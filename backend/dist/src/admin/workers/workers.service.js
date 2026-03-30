"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
const digiflazz_service_1 = require("../digiflazz/digiflazz.service");
let WorkersService = WorkersService_1 = class WorkersService {
    prisma;
    digiflazz;
    logger = new common_1.Logger(WorkersService_1.name);
    constructor(prisma, digiflazz) {
        this.prisma = prisma;
        this.digiflazz = digiflazz;
    }
    async handleJobQueue() {
        this.logger.debug('Menjalankan background jobs Worker dari JobQueue Prisma...');
        const pendingJobs = await this.prisma.jobQueue.findMany({
            where: { status: client_1.JobStatus.PENDING },
            take: 10
        });
        for (const job of pendingJobs) {
            try {
                await this.prisma.jobQueue.update({ where: { id: job.id }, data: { status: client_1.JobStatus.RUNNING } });
                if (job.type === 'SYNC_SUPPLIER') {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status: client_1.JobStatus.SUCCESS, completedAt: new Date() }
                });
                this.logger.log(`Job ${job.id} type ${job.type} SUCCESS`);
            }
            catch (e) {
                const retries = (job.retryCount || 0) + 1;
                const status = retries >= 3 ? client_1.JobStatus.FAILED : client_1.JobStatus.RETRYING;
                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status, retryCount: retries, error: e.message }
                });
                this.logger.error(`Job ${job.id} FAILED, Retry count: ${retries}`);
            }
        }
    }
    async checkSubscriptions() {
        this.logger.debug('Auditing merchant subscription...');
    }
    async syncFulfillmentStatus() {
        this.logger.debug('Auditing fulfillment statuses... (Supplier: Digiflazz)');
        const ordersToSync = await this.prisma.order.findMany({
            where: {
                fulfillmentStatus: { in: [client_1.OrderFulfillmentStatus.PENDING, client_1.OrderFulfillmentStatus.PROCESSING] },
                supplierRefId: { not: null }
            },
            include: { productSku: true },
            take: 50
        });
        const now = new Date();
        for (const order of ordersToSync) {
            try {
                const tenMinutesAgo = new Date(now.getTime() - (10 * 60 * 1000));
                if (order.fulfillmentStatus === client_1.OrderFulfillmentStatus.PROCESSING && order.updatedAt < tenMinutesAgo) {
                    this.logger.warn(`Order ${order.orderNumber} is stuck in PROCESSING for over 10 minutes. Manual check recommended.`);
                }
                const customerNo = order.gameUserServerId ? `${order.gameUserId}${order.gameUserServerId}` : order.gameUserId;
                const supplierInfo = await this.digiflazz.checkOrderStatus(order.id, order.supplierRefId, order.productSku.supplierCode, customerNo);
                if (!supplierInfo || !supplierInfo.status)
                    continue;
                const statusMap = {
                    'Sukses': client_1.OrderFulfillmentStatus.SUCCESS,
                    'Gagal': client_1.OrderFulfillmentStatus.FAILED,
                    'Pending': client_1.OrderFulfillmentStatus.PROCESSING
                };
                const newStatus = statusMap[supplierInfo.status] || order.fulfillmentStatus;
                if (newStatus !== order.fulfillmentStatus) {
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            fulfillmentStatus: newStatus,
                            serialNumber: supplierInfo.sn || order.serialNumber,
                            completedAt: newStatus === client_1.OrderFulfillmentStatus.SUCCESS ? new Date() : null,
                            failedAt: newStatus === client_1.OrderFulfillmentStatus.FAILED ? new Date() : null,
                            failReason: newStatus === client_1.OrderFulfillmentStatus.FAILED ? supplierInfo.message : null
                        }
                    });
                    if (newStatus === client_1.OrderFulfillmentStatus.FAILED) {
                        this.logger.warn(`Order ${order.orderNumber} FAILED via Sync. Triggering refund & reversal.`);
                        const pendingCommission = await this.prisma.commission.findFirst({
                            where: { orderId: order.id, status: { in: ['PENDING', 'SETTLED'] } }
                        });
                        if (pendingCommission) {
                            await this.digiflazz.handleCommissionReversal(order.id);
                            await this.digiflazz.handleCustomerRefund(order.id);
                        }
                        else {
                            this.logger.warn(`[SyncCron] Order ${order.orderNumber} FAILED but commissions already reversed. Skipping double-refund.`);
                        }
                    }
                    this.logger.log(`Order ${order.orderNumber} updated to ${newStatus}`);
                }
            }
            catch (err) {
                this.logger.error(`Failed to sync order ${order.orderNumber}: ${err.message}`);
            }
        }
    }
    async syncProductsFromSupplier() {
        this.logger.log('Starting Automated Product & Price Sync from Digiflazz...');
        try {
            const products = await this.digiflazz.getDigiflazzProducts();
            const gameItems = products.filter((item) => {
                const cat = (item.category || '').toUpperCase();
                const brand = (item.brand || '').toUpperCase();
                const type = (item.type || '').toUpperCase();
                const isGameCategory = cat.includes('GAMES') || cat.includes('VOUCHER') || cat.includes('ENTERTAINMENT');
                const isTelcoBrand = brand.includes('TELKOMSEL') || brand.includes('XL') || brand.includes('AXIS') || brand.includes('INDOSAT') || brand.includes('TRI') || brand.includes('SMARTFREN');
                const isShopping = brand.includes('ALFAMART') || brand.includes('INDOMARET') || brand.includes('GRAB') || brand.includes('GOJEK') || brand.includes('PLN');
                return (isGameCategory || type === 'GAMES') && !isTelcoBrand && !isShopping;
            });
            this.logger.log(`Found ${gameItems.length} game items to sync.`);
            const popularBrands = [
                'MOBILE LEGENDS', 'FREE FIRE', 'FREE FIRE MAX', 'PUBG MOBILE',
                'GENSHIN IMPACT', 'VALORANT', 'HONOR OF KINGS', 'COD MOBILE',
                'LEAGUE OF LEGENDS', 'ARENA OF VALOR', 'MAGIC CHESS'
            ];
            const gameThumbnails = {
                'MOBILE LEGENDS': 'https://cdn1.codashop.com/S/content/common/images/mno/MobileLegends600x600.png',
                'FREE FIRE': 'https://cdn1.codashop.com/S/content/common/images/mno/FreeFire600x600.png',
                'FREE FIRE MAX': 'https://cdn1.codashop.com/S/content/common/images/mno/FreeFire600x600.png',
                'GENSHIN IMPACT': 'https://cdn1.codashop.com/S/content/common/images/mno/GenshinImpact600x600.png',
                'PUBG MOBILE': 'https://cdn1.codashop.com/S/content/common/images/mno/PUBGM600x600.png',
                'VALORANT': 'https://cdn1.codashop.com/S/content/common/images/mno/Valorant600x600.png',
                'HONOR OF KINGS': 'https://cdn1.codashop.com/S/content/common/images/mno/HOK600x600.png',
                'POINT BLANK': 'https://cdn1.codashop.com/S/content/common/images/mno/PointBlank600x600.png',
                'COD MOBILE': 'https://cdn1.codashop.com/S/content/common/images/mno/Codm600x600.png',
                'STEAM WALLET (IDR)': 'https://cdn1.codashop.com/S/content/common/images/mno/Steam600x600.png'
            };
            for (const item of gameItems) {
                const brand = item.brand || 'UMUM';
                const brandUpper = brand.toUpperCase();
                const catSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const isPopular = popularBrands.includes(brandUpper);
                const sortOrder = isPopular ? (100 - popularBrands.indexOf(brandUpper)) : 0;
                const thumbnail = gameThumbnails[brandUpper] || `https://www.google.com/s2/favicons?sz=128&domain=${catSlug}.com`;
                const category = await this.prisma.category.upsert({
                    where: { slug: catSlug },
                    update: { name: brand, image: thumbnail, icon: thumbnail, sortOrder: sortOrder },
                    create: { name: brand, slug: catSlug, isActive: true, image: thumbnail, icon: thumbnail, sortOrder: sortOrder }
                });
                const productSlug = `${catSlug}-topup`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: { categoryId: category.id, status: 'ACTIVE', thumbnail: thumbnail, isPopular: isPopular, sortOrder: sortOrder },
                    create: { name: `${brand} Topup`, slug: productSlug, categoryId: category.id, status: 'ACTIVE', thumbnail: thumbnail, isPopular: isPopular, sortOrder: sortOrder }
                });
                const basePrice = Number(item.price);
                const marginNormal = 10;
                const marginPro = 8;
                const marginLegend = 5;
                const marginSupreme = 3;
                const priceNormal = Math.ceil(basePrice * (1 + marginNormal / 100));
                const pricePro = Math.ceil(basePrice * (1 + marginPro / 100));
                const priceLegend = Math.ceil(basePrice * (1 + marginLegend / 100));
                const priceSupreme = Math.ceil(basePrice * (1 + marginSupreme / 100));
                const supplier = await this.prisma.supplier.findUnique({ where: { code: 'DIGIFLAZZ' } });
                if (!supplier)
                    continue;
                const existingSku = await this.prisma.productSku.findFirst({
                    where: {
                        productId: product.id,
                        supplierCode: item.buyer_sku_code,
                        supplierId: supplier.id
                    }
                });
                const skuData = {
                    productId: product.id,
                    name: item.product_name,
                    supplierId: supplier.id,
                    supplierCode: item.buyer_sku_code,
                    basePrice: basePrice,
                    priceNormal: priceNormal,
                    pricePro: pricePro,
                    priceLegend: priceLegend,
                    priceSupreme: priceSupreme,
                    marginNormal: priceNormal - basePrice,
                    marginPro: pricePro - basePrice,
                    marginLegend: priceLegend - basePrice,
                    marginSupreme: priceSupreme - basePrice,
                    status: (item.buyer_product_status && item.seller_product_status) ? 'ACTIVE' : 'INACTIVE'
                };
                if (existingSku) {
                    await this.prisma.productSku.update({
                        where: { id: existingSku.id },
                        data: skuData
                    });
                }
                else {
                    await this.prisma.productSku.create({
                        data: skuData
                    });
                }
            }
            this.logger.log('Automated Sync Finished Successfully!');
        }
        catch (err) {
            this.logger.error(`Automated Sync Failed: ${err.message}`);
        }
    }
    async syncSupplierBalance() {
        this.logger.debug('Auditing supplier balance...');
        try {
            const supplier = await this.prisma.supplier.findUnique({
                where: { code: 'DIGIFLAZZ' }
            });
            if (!supplier)
                return;
            const currentBalance = await this.digiflazz.checkBalance();
            await this.prisma.supplier.update({
                where: { id: supplier.id },
                data: { balance: currentBalance, lastSyncAt: new Date() }
            });
            if (currentBalance < 200000) {
                this.logger.warn(`LOW BALANCE ALERT: Rp ${currentBalance.toLocaleString('id-ID')}.`);
            }
        }
        catch (err) {
            this.logger.error(`Failed to sync supplier balance: ${err.message}`);
        }
    }
};
exports.WorkersService = WorkersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkersService.prototype, "handleJobQueue", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkersService.prototype, "checkSubscriptions", null);
__decorate([
    (0, schedule_1.Cron)('0 */2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkersService.prototype, "syncFulfillmentStatus", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkersService.prototype, "syncProductsFromSupplier", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkersService.prototype, "syncSupplierBalance", null);
exports.WorkersService = WorkersService = WorkersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        digiflazz_service_1.DigiflazzService])
], WorkersService);
//# sourceMappingURL=workers.service.js.map