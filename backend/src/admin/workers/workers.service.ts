import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { JobStatus, OrderFulfillmentStatus } from '@prisma/client';

import { DigiflazzService } from '../digiflazz/digiflazz.service';

@Injectable()
export class WorkersService {
    private readonly logger = new Logger(WorkersService.name);

    constructor(
        private prisma: PrismaService,
        private digiflazz: DigiflazzService
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleJobQueue() {
        this.logger.debug('Menjalankan background jobs Worker dari JobQueue Prisma...');
        const pendingJobs = await this.prisma.jobQueue.findMany({
            where: { status: JobStatus.PENDING },
            take: 10
        });

        for (const job of pendingJobs) {
            try {
                await this.prisma.jobQueue.update({ where: { id: job.id }, data: { status: JobStatus.RUNNING } });

                // Logika Job Type
                if (job.type === 'SYNC_SUPPLIER') {
                    // Simulasi Sync
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status: JobStatus.SUCCESS, completedAt: new Date() }
                });

                this.logger.log(`Job ${job.id} type ${job.type} SUCCESS`);
            } catch (e: any) {
                // Implementasi logic retry
                const retries = (job.retryCount || 0) + 1;
                const status = retries >= 3 ? JobStatus.FAILED : JobStatus.RETRYING;

                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status, retryCount: retries, error: e.message }
                });
                this.logger.error(`Job ${job.id} FAILED, Retry count: ${retries}`);
            }
        }
    }

    // Tiap jam check tagihan langganan SaaS (Subscription)
    @Cron(CronExpression.EVERY_HOUR)
    async checkSubscriptions() {
        // Implementasi check merchant expired dan non-aktifkan status
        this.logger.debug('Auditing merchant subscription...');
    }

    // Tiap 2 menit sinkronisasi status pesanan yang masih PROCESSING/PENDING dari supplier
    @Cron('0 */2 * * * *')
    async syncFulfillmentStatus() {
        this.logger.debug('Auditing fulfillment statuses... (Supplier: Digiflazz)');
        const ordersToSync = await this.prisma.order.findMany({
            where: {
                fulfillmentStatus: { in: [OrderFulfillmentStatus.PENDING, OrderFulfillmentStatus.PROCESSING] },
                supplierRefId: { not: null }
            },
            include: { productSku: true },
            take: 50
        });

        const now = new Date();

        for (const order of ordersToSync) {
            try {
                // TIMEOUT LOGGING: Just log a warning if stuck in PROCESSING for too long
                const tenMinutesAgo = new Date(now.getTime() - (10 * 60 * 1000));
                if (order.fulfillmentStatus === OrderFulfillmentStatus.PROCESSING && order.updatedAt < tenMinutesAgo) {
                    this.logger.warn(`Order ${order.orderNumber} is stuck in PROCESSING for over 10 minutes. Manual check recommended.`);
                    // We DO NOT auto-refund here anymore to avoid loss if it eventually succeeds
                }

                const customerNo = order.gameUserServerId ? `${order.gameUserId}${order.gameUserServerId}` : order.gameUserId;

                const supplierInfo = await this.digiflazz.checkOrderStatus(
                    order.id,
                    order.supplierRefId!,
                    order.productSku.supplierCode,
                    customerNo
                );

                if (!supplierInfo || !supplierInfo.status) continue;

                const statusMap: any = {
                    'Sukses': OrderFulfillmentStatus.SUCCESS,
                    'Gagal': OrderFulfillmentStatus.FAILED,
                    'Pending': OrderFulfillmentStatus.PROCESSING
                };

                const newStatus = statusMap[supplierInfo.status] || order.fulfillmentStatus;

                if (newStatus !== order.fulfillmentStatus) {
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            fulfillmentStatus: newStatus,
                            serialNumber: supplierInfo.sn || order.serialNumber,
                            completedAt: newStatus === OrderFulfillmentStatus.SUCCESS ? new Date() : null,
                            failedAt: newStatus === OrderFulfillmentStatus.FAILED ? new Date() : null,
                            failReason: newStatus === OrderFulfillmentStatus.FAILED ? supplierInfo.message : null
                        }
                    });

                    // FATAL FIX: Jika Gagal via Sync, kembalikan uang user dan batalkan komisi merchant
                    if (newStatus === OrderFulfillmentStatus.FAILED) {
                        this.logger.warn(`Order ${order.orderNumber} FAILED via Sync. Triggering refund & reversal.`);
                        await this.digiflazz.handleCommissionReversal(order.id);
                        await this.digiflazz.handleCustomerRefund(order.id);
                    }

                    this.logger.log(`Order ${order.orderNumber} updated to ${newStatus}`);
                }
            } catch (err: any) {
                this.logger.error(`Failed to sync order ${order.orderNumber}: ${err.message}`);
            }
        }
    }

    // Tiap 6 jam otomatis singkron harga & produk dari Digiflazz (Otomasi Harga & Kebersihan Produk)
    @Cron(CronExpression.EVERY_6_HOURS)
    async syncProductsFromSupplier() {
        this.logger.log('Starting Automated Product & Price Sync from Digiflazz...');
        try {
            const products = await this.digiflazz.getDigiflazzProducts();
            
            // Filter hanya Games (Sesuai Rule: Jangan ada produk non-game)
            const gameItems = products.filter((item: any) => {
                const cat = (item.category || '').toUpperCase();
                const brand = (item.brand || '').toUpperCase();
                const type = (item.type || '').toUpperCase();

                const isGameCategory = cat.includes('GAMES') || cat.includes('VOUCHER') || cat.includes('ENTERTAINMENT');
                const isTelcoBrand = brand.includes('TELKOMSEL') || brand.includes('XL') || brand.includes('AXIS') || brand.includes('INDOSAT') || brand.includes('TRI') || brand.includes('SMARTFREN');
                const isShopping = brand.includes('ALFAMART') || brand.includes('INDOMARET') || brand.includes('GRAB') || brand.includes('GOJEK') || brand.includes('PLN');

                return (isGameCategory || type === 'GAMES') && !isTelcoBrand && !isShopping;
            });

            this.logger.log(`Found ${gameItems.length} game items to sync.`);

            // Popular Games for Priority Sorting
            const popularBrands = [
                'MOBILE LEGENDS', 'FREE FIRE', 'FREE FIRE MAX', 'PUBG MOBILE', 
                'GENSHIN IMPACT', 'VALORANT', 'HONOR OF KINGS', 'COD MOBILE',
                'LEAGUE OF LEGENDS', 'ARENA OF VALOR', 'MAGIC CHESS'
            ];

            const gameThumbnails: Record<string, string> = {
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

                // Logic Upsert Category & Product (Ported from manual_sync)
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

                // Price Recalculation (Anti-Loss)
                const basePrice = Number(item.price);
                const marginNormal = 10; // Default 10%
                const marginPro = 8;
                const marginLegend = 5;
                const marginSupreme = 3;

                const priceNormal = Math.ceil(basePrice * (1 + marginNormal / 100));
                const pricePro = Math.ceil(basePrice * (1 + marginPro / 100));
                const priceLegend = Math.ceil(basePrice * (1 + marginLegend / 100));
                const priceSupreme = Math.ceil(basePrice * (1 + marginSupreme / 100));

                const supplier = await this.prisma.supplier.findUnique({ where: { code: 'DIGIFLAZZ' } });
                if (!supplier) continue;

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
                    status: (item.buyer_product_status && item.seller_product_status) ? ('ACTIVE' as any) : ('INACTIVE' as any)
                };

                if (existingSku) {
                    await this.prisma.productSku.update({
                        where: { id: existingSku.id },
                        data: skuData
                    });
                } else {
                    await this.prisma.productSku.create({
                        data: skuData
                    });
                }
            }
            this.logger.log('Automated Sync Finished Successfully!');
        } catch (err: any) {
            this.logger.error(`Automated Sync Failed: ${err.message}`);
        }
    }

    // Tiap jam otomatis singkron saldo supplier (Audit & Alert)
    @Cron(CronExpression.EVERY_HOUR)
    async syncSupplierBalance() {
        this.logger.debug('Auditing supplier balance...');
        try {
            const supplier = await this.prisma.supplier.findUnique({
                where: { code: 'DIGIFLAZZ' }
            });

            if (!supplier) return;

            const currentBalance = await this.digiflazz.checkBalance();
            await this.prisma.supplier.update({
                where: { id: supplier.id },
                data: { balance: currentBalance, lastSyncAt: new Date() }
            });

            if (currentBalance < 200000) { // Turunkan limit alert ke 200rb
                this.logger.warn(`LOW BALANCE ALERT: Rp ${currentBalance.toLocaleString('id-ID')}.`);
            }
        } catch (err: any) {
            this.logger.error(`Failed to sync supplier balance: ${err.message}`);
        }
    }
}
