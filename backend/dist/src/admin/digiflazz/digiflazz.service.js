"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DigiflazzService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigiflazzService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const whatsapp_service_1 = require("../../common/notifications/whatsapp.service");
let DigiflazzService = DigiflazzService_1 = class DigiflazzService {
    prisma;
    whatsappService;
    logger = new common_1.Logger(DigiflazzService_1.name);
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    getDigiflazzConfig() {
        const username = process.env.DIGIFLAZZ_USERNAME;
        const key = process.env.DIGIFLAZZ_KEY;
        const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';
        if (!username || !key) {
            throw new common_1.InternalServerErrorException('Kredensial Digiflazz tidak dikonfigurasi pada environment variables (.env)');
        }
        return { username, key, url };
    }
    priceListCache = null;
    lastFetchTime = 0;
    async getDigiflazzProducts() {
        try {
            const now = Date.now();
            let rawItems = [];
            if (this.priceListCache && (now - this.lastFetchTime) < 60000) {
                console.log('[DigiflazzService] Menggunakan data cache Digiflazz (Menghindari limitasi rate)');
                rawItems = this.priceListCache;
            }
            else {
                const { username, key, url } = this.getDigiflazzConfig();
                const sign = crypto.createHash('md5').update(username + key + 'pricelist').digest('hex');
                const response = await axios_1.default.post(`${url}/price-list`, {
                    cmd: "prepaid",
                    username: username,
                    sign: sign
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });
                const jsonResp = response.data;
                if (response.status !== 200 || !jsonResp.data) {
                    throw new common_1.InternalServerErrorException(`Digiflazz Error: ${JSON.stringify(jsonResp)}`);
                }
                rawItems = jsonResp.data;
                const cachePath = path.join(process.cwd(), 'digiflazz-cache.json');
                if (!Array.isArray(jsonResp.data)) {
                    console.warn('[DigiflazzService] API Digiflazz Error/Limit.', jsonResp.data);
                    if (fs.existsSync(cachePath)) {
                        console.log('[DigiflazzService] Memuat data Digiflazz dari local disk cache...');
                        rawItems = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                    }
                    else {
                        console.warn('[DigiflazzService] Tidak ada local file cache. Menggunakan Data Mock Sementara.');
                        rawItems = [
                            { buyer_sku_code: "ML5", product_name: "5 Diamonds", category: "Games", brand: "MOBILE LEGENDS", type: "Umum", seller_name: "Digiflazz", price: 1500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "ML86", product_name: "86 Diamonds", category: "Games", brand: "MOBILE LEGENDS", type: "Umum", seller_name: "Digiflazz", price: 24500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "ML172", product_name: "172 Diamonds", category: "Games", brand: "MOBILE LEGENDS", type: "Umum", seller_name: "Digiflazz", price: 48000, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "FF70", product_name: "70 Diamonds", category: "Games", brand: "FREE FIRE", type: "Umum", seller_name: "Digiflazz", price: 10000, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "FF140", product_name: "140 Diamonds", category: "Games", brand: "FREE FIRE", type: "Umum", seller_name: "Digiflazz", price: 19500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "PB1200", product_name: "1.200 PB Cash", category: "Games", brand: "POINT BLANK", type: "Umum", seller_name: "Digiflazz", price: 9500, buyer_product_status: true, seller_product_status: true },
                            { buyer_sku_code: "PUBG60", product_name: "60 UC", category: "Games", brand: "PUBG MOBILE", type: "Umum", seller_name: "Digiflazz", price: 14500, buyer_product_status: true, seller_product_status: true }
                        ];
                    }
                }
                else {
                    this.priceListCache = rawItems;
                    this.lastFetchTime = now;
                    fs.writeFileSync(cachePath, JSON.stringify(rawItems), 'utf8');
                    console.log('[DigiflazzService] Data Digiflazz asli berhasil disimpan ke local disk cache.');
                }
            }
            const localSkus = await this.prisma.productSku.findMany({
                where: { supplier: { code: 'DIGIFLAZZ' } },
                include: { product: { include: { category: true } } }
            });
            const skuMap = new Map();
            for (const sku of localSkus) {
                skuMap.set(sku.supplierCode, sku);
            }
            return rawItems.map((item) => {
                const localSku = skuMap.get(item.buyer_sku_code);
                return {
                    buyer_sku_code: item.buyer_sku_code,
                    product_name: item.product_name,
                    category: item.category,
                    brand: item.brand,
                    type: item.type,
                    seller_name: item.seller_name,
                    price: item.price,
                    buyer_product_status: item.buyer_product_status,
                    seller_product_status: item.seller_product_status,
                    is_mapped: !!localSku,
                    local_info: localSku ? {
                        id: localSku.id,
                        productId: localSku.productId,
                        productName: localSku.product.name,
                        categoryId: localSku.product.categoryId,
                        categoryName: localSku.product.category?.name,
                        priceNormal: localSku.priceNormal,
                        status: localSku.status,
                    } : null
                };
            });
        }
        catch (err) {
            const msg = err.response?.data?.message || err.message;
            this.logger.error('[Digiflazz] Error fetching price list:', msg);
            throw new common_1.InternalServerErrorException(`Digiflazz Connection Error: ${msg}`);
        }
    }
    async syncProduct(dto) {
        try {
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE', apiUrl: 'https://api.digiflazz.com/v1', apiKey: 'DUMMY_KEY', apiSecret: 'DUMMY_SECRET' }
            });
            let categoryId = dto.categoryId;
            const brandSlug = dto.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (!categoryId) {
                const category = await this.prisma.category.upsert({
                    where: { slug: brandSlug },
                    update: {},
                    create: { name: dto.brand, slug: brandSlug, isActive: true }
                });
                categoryId = category.id;
            }
            let productId = dto.productId;
            if (!productId) {
                const productSlug = `${brandSlug}-topup`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: {},
                    create: { name: `${dto.brand} Topup`, slug: productSlug, categoryId: categoryId, status: 'ACTIVE' }
                });
                productId = product.id;
            }
            const existingSku = await this.prisma.productSku.findFirst({
                where: { supplierCode: dto.buyer_sku_code, supplierId: supplier.id }
            });
            let savedSku;
            if (existingSku) {
                savedSku = await this.prisma.productSku.update({
                    where: { id: existingSku.id },
                    data: {
                        productId: productId,
                        name: dto.product_name,
                        basePrice: dto.digiflazz_price,
                        priceNormal: dto.priceNormal,
                        pricePro: dto.pricePro || dto.priceNormal,
                        priceLegend: dto.priceLegend || dto.priceNormal,
                        priceSupreme: dto.priceSupreme || dto.priceNormal,
                        marginNormal: dto.priceNormal - dto.digiflazz_price,
                        marginPro: (dto.pricePro || dto.priceNormal) - dto.digiflazz_price,
                        marginLegend: (dto.priceLegend || dto.priceNormal) - dto.digiflazz_price,
                        marginSupreme: (dto.priceSupreme || dto.priceNormal) - dto.digiflazz_price,
                        status: dto.status
                    }
                });
                if (Number(existingSku.priceNormal) !== Number(dto.priceNormal) || Number(existingSku.basePrice) !== Number(dto.digiflazz_price)) {
                    await this.prisma.auditLog.create({
                        data: {
                            action: 'DIGIFLAZZ_PRICE_UPDATE',
                            entity: 'ProductSku',
                            newData: { priceNormal: dto.priceNormal, basePrice: dto.digiflazz_price },
                            oldData: { priceNormal: Number(existingSku.priceNormal), basePrice: Number(existingSku.basePrice) },
                        }
                    });
                }
            }
            else {
                savedSku = await this.prisma.productSku.create({
                    data: {
                        productId: productId,
                        supplierId: supplier.id,
                        name: dto.product_name,
                        supplierCode: dto.buyer_sku_code,
                        basePrice: dto.digiflazz_price,
                        priceNormal: dto.priceNormal,
                        pricePro: dto.pricePro || dto.priceNormal,
                        priceLegend: dto.priceLegend || dto.priceNormal,
                        priceSupreme: dto.priceSupreme || dto.priceNormal,
                        marginNormal: dto.priceNormal - dto.digiflazz_price,
                        marginPro: (dto.pricePro || dto.priceNormal) - dto.digiflazz_price,
                        marginLegend: (dto.priceLegend || dto.priceNormal) - dto.digiflazz_price,
                        marginSupreme: (dto.priceSupreme || dto.priceNormal) - dto.digiflazz_price,
                        status: dto.status
                    }
                });
                await this.prisma.auditLog.create({
                    data: {
                        action: 'DIGIFLAZZ_PRODUCT_MAPPED',
                        entity: 'ProductSku',
                        newData: { skuId: savedSku.id, buyer_sku_code: dto.buyer_sku_code },
                    }
                });
            }
            const merchantPrices = await this.prisma.merchantProductPrice.findMany({
                where: { productSkuId: savedSku.id, isActive: true },
                include: { merchant: true }
            });
            for (const mp of merchantPrices) {
                const plan = mp.merchant.plan;
                let currentModalPrice = savedSku.priceNormal;
                if (plan === 'PRO')
                    currentModalPrice = savedSku.pricePro;
                else if (plan === 'LEGEND')
                    currentModalPrice = savedSku.priceLegend;
                else if (plan === 'SUPREME')
                    currentModalPrice = savedSku.priceSupreme;
                if (currentModalPrice > mp.customPrice) {
                    await this.prisma.merchantProductPrice.update({
                        where: { id: mp.id },
                        data: {
                            isActive: false,
                            reason: `Negative Margin: Modal (${currentModalPrice}) > Jual (${mp.customPrice})`
                        }
                    });
                    console.log(`[NegativeMarginAlert] Product ${savedSku.supplierCode} deactivated for Merchant ${mp.merchant.name}`);
                }
            }
            return { success: true, message: 'Produk berhasil di-sync dan di-mapping', sku: savedSku };
        }
        catch (err) {
            console.error('[DigiflazzService] Error syncing product:', err);
            throw new common_1.InternalServerErrorException('Gagal melakukan sinkronisasi produk (' + err.message + ')');
        }
    }
    async bulkSyncProducts(payload) {
        setImmediate(async () => {
            let successCount = 0;
            for (const p of payload) {
                try {
                    await this.syncProduct({
                        buyer_sku_code: p.buyer_sku_code,
                        product_name: p.product_name,
                        brand: p.brand,
                        category_digiflazz: p.category,
                        digiflazz_price: p.price,
                        categoryId: p.categoryId,
                        productId: p.productId,
                        priceNormal: p.sellingPrice || p.priceNormal,
                        status: p.status
                    });
                    successCount++;
                }
                catch (err) {
                    console.error(`[BulkSync] Gagal sync produk ${p.buyer_sku_code}:`, err);
                }
            }
            console.log(`[BulkSync] Selesai: ${successCount} dari ${payload.length} produk tersinkronisasi.`);
        });
        return { success: true, message: `Proses sinkronisasi massal untuk ${payload.length} produk sedang berjalan di latar belakang.` };
    }
    async checkOrderStatus(orderId, supplierRefId, buyerSkuCode, customerNo) {
        const { username, key, url } = this.getDigiflazzConfig();
        const sign = crypto.createHash('md5').update(username + key + supplierRefId).digest('hex');
        const response = await axios_1.default.post(`${url}/transaction`, {
            username,
            buyer_sku_code: buyerSkuCode,
            customer_no: customerNo,
            ref_id: supplierRefId,
            sign
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        return response.data?.data;
    }
    async checkBalance() {
        const { username, key, url } = this.getDigiflazzConfig();
        const sign = crypto.createHash('md5').update(username + key + 'depo').digest('hex');
        const response = await axios_1.default.post(`${url}/cek-saldo`, {
            cmd: 'deposit',
            username,
            sign
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000
        });
        const resJson = response.data;
        if (resJson.data) {
            return Number(resJson.data.deposit || 0);
        }
        throw new Error('Gagal ambil saldo: ' + JSON.stringify(resJson));
    }
    async checkAvailability(skuCode) {
        const products = await this.getDigiflazzProducts();
        const item = products.find((p) => p.buyer_sku_code === skuCode);
        if (!item) {
            return { isAvailable: false, reason: 'Produk tidak ditemukan di supplier' };
        }
        if (item.buyer_product_status === false || item.seller_product_status === false) {
            return {
                isAvailable: false,
                reason: item.message || 'Produk sedang gangguan atau stok kosong di supplier'
            };
        }
        return { isAvailable: true, item };
    }
    async placeOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { productSku: true, user: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found for fulfillment');
        if (order.fulfillmentStatus === 'SUCCESS')
            return;
        if (!order.gameUserId || order.gameUserId.trim() === '') {
            this.logger.error(`[placeOrder] Order ${order.orderNumber} has no gameUserId. Cannot fulfill.`);
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    fulfillmentStatus: 'FAILED',
                    failReason: 'Gagal: ID Akun Game (User ID) tidak boleh kosong.'
                }
            });
            return null;
        }
        const { username, key, url } = this.getDigiflazzConfig();
        try {
            const currentBalance = await this.checkBalance();
            if (currentBalance < order.basePrice) {
                this.logger.error(`[SupplierBalance] Insufficient balance for ${order.orderNumber}. Have: ${currentBalance}, Need: ${order.basePrice}`);
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: {
                        fulfillmentStatus: 'FAILED',
                        failReason: 'Gagal diproses: Saldo supplier sedang tidak mencukupi (Refund Otomatis).'
                    }
                });
                await this.handleCommissionReversal(order.id);
                await this.handleCustomerRefund(order.id);
                this.whatsappService.sendAdminSummary(`⚠️ *SALDO SUPPLIER HABIS*\n` +
                    `Order ${order.orderNumber} gagal karena saldo Digiflazz (${currentBalance}) kurang dari harga modal dasar (${order.basePrice}). Segera top-up!`).catch(() => { });
                return null;
            }
        }
        catch (balErr) {
            this.logger.error(`[SupplierBalance] Failed to verify balance, proceeding normally: ${balErr.message}`);
        }
        const currentBasePrice = Number(order.productSku.basePrice);
        const lockedModalPrice = Number(order.merchantModalPrice || order.sellingPrice);
        if (currentBasePrice > lockedModalPrice) {
            console.warn(`[AntiLoss] Price Spike Detected: Order ${order.orderNumber}. Current Base: ${currentBasePrice} > Locked Modal: ${lockedModalPrice}. ABORTING.`);
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    fulfillmentStatus: 'FAILED',
                    failReason: `Pelanggaran Anti-Rugi: Harga pusat (Rp ${currentBasePrice}) telah naik melebihi harga modal transaksi (Rp ${lockedModalPrice}).`
                }
            });
            await this.prisma.disputeCase.create({
                data: {
                    orderId: order.id,
                    userId: order.userId,
                    reason: `Anti-Loss Guard: Harga pusat mendadak naik dari Rp ${order.basePrice} menjadi Rp ${currentBasePrice}. Hubungi admin untuk penyesuaian dana.`,
                    status: 'OPEN'
                }
            });
            return { success: false, message: 'Price threshold exceeded' };
        }
        const sign = crypto.createHash('md5').update(username + key + order.orderNumber).digest('hex');
        const customerNo = order.gameUserServerId ? `${order.gameUserId}${order.gameUserServerId}` : order.gameUserId;
        const payload = {
            username,
            buyer_sku_code: order.productSku.supplierCode,
            customer_no: customerNo,
            ref_id: order.orderNumber,
            testing: process.env.NODE_ENV !== 'production',
            sign
        };
        let resJson;
        let response;
        try {
            response = await axios_1.default.post(`${url}/transaction`, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            });
            resJson = response.data;
            await this.prisma.supplierLog.create({
                data: {
                    supplierId: order.productSku.supplierId,
                    orderId: order.id,
                    method: 'POST',
                    endpoint: `${url}/transaction`,
                    requestBody: this.maskSensitiveData(payload),
                    responseBody: this.maskSensitiveData(resJson),
                    httpStatus: response.status,
                    isSuccess: resJson.data?.status === 'Sukses' || resJson.data?.status === 'Pending'
                }
            });
            if (resJson.data) {
                const data = resJson.data;
                const statusMap = {
                    'Sukses': 'SUCCESS',
                    'Gagal': 'FAILED',
                    'Pending': 'PROCESSING'
                };
                const fulfillmentStatus = statusMap[data.status] || 'PROCESSING';
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: {
                        fulfillmentStatus,
                        supplierRefId: data.ref_id,
                        serialNumber: data.sn,
                        supplierResponse: data,
                        processedAt: new Date(),
                        completedAt: data.status === 'Sukses' ? new Date() : null,
                        failedAt: data.status === 'Gagal' ? new Date() : null,
                        failReason: data.status === 'Gagal' ? data.message : null
                    }
                });
                if (fulfillmentStatus === 'FAILED') {
                    await this.prisma.disputeCase.create({
                        data: {
                            orderId: order.id,
                            userId: order.userId,
                            reason: `Sistem Otomatis: Transaksi Digiflazz merespons GAGAL. Lakukan pengecekan manual ke Live Chat Digiflazz sebelum Refund.`,
                            status: 'OPEN'
                        }
                    });
                    this.whatsappService.sendAdminSummary(`⚠️ *POTENSI SENGKETA (DISPUTE)*\nOrder ${order.orderNumber} merespons Gagal dari Digiflazz.\n` +
                        `Otomatis masuk ke antrean Sengketa. Segera cek manual ke Digiflazz sebelum Refund!`).catch(() => { });
                }
                if (fulfillmentStatus === 'SUCCESS' || fulfillmentStatus === 'FAILED') {
                    this.whatsappService.sendFulfillmentNotification(order.user.phone || '', order.orderNumber, `${order.productName} - ${order.productSkuName}`, fulfillmentStatus, data.sn || 'N/A').catch(err => this.logger.error(`[FulfillmentNotification] Failed: ${err.message}`));
                    if (fulfillmentStatus === 'SUCCESS') {
                        await this.settleOrderProfit(order.id);
                    }
                }
                return data;
            }
            else {
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: {
                        fulfillmentStatus: 'FAILED',
                        failReason: resJson.data?.message || 'Digiflazz API connection error'
                    }
                });
                await this.prisma.disputeCase.create({
                    data: {
                        orderId: order.id,
                        userId: order.userId,
                        reason: `Sistem Otomatis: API Digiflazz Error (${resJson.data?.message || 'Error'}). Lakukan pengecekan manual.`,
                        status: 'OPEN'
                    }
                });
                return resJson;
            }
        }
        catch (err) {
            console.error('[DigiflazzService] Fulfillment Connection Error (Potentially Stuck):', err.message);
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    fulfillmentStatus: 'PROCESSING',
                    note: `Connection Error: ${err.message}. Awaiting auto-sync...`
                }
            });
            throw err;
        }
    }
    async settleOrderProfit(orderId) {
        await this.prisma.$transaction(async (tx) => {
            const updated = await tx.commission.updateMany({
                where: { orderId, status: 'PENDING' },
                data: { status: 'SETTLED', settledAt: new Date() }
            });
            if (updated.count === 0)
                return;
            const commissions = await tx.commission.findMany({
                where: { orderId, status: 'SETTLED', settledAt: { gte: new Date(Date.now() - 5000) } },
                include: { user: { include: { merchant: true } } }
            });
            for (const comm of commissions) {
                const user = comm.user;
                if (user.role === 'MERCHANT' && user.merchant) {
                    const merchantId = user.merchant.id;
                    const merchant = await tx.merchant.findUnique({ where: { id: merchantId } });
                    if (merchant) {
                        const updatedMerchant = await tx.merchant.update({
                            where: { id: merchantId },
                            data: {
                                escrowBalance: { decrement: comm.amount },
                                availableBalance: { increment: comm.amount }
                            }
                        });
                        await tx.merchantLedgerMovement.create({
                            data: {
                                merchantId,
                                orderId,
                                type: 'SETTLEMENT',
                                amount: comm.amount,
                                description: `Pencairan Laba Penjualan (Order Sukses): ${orderId}`,
                                availableBefore: merchant.availableBalance,
                                availableAfter: updatedMerchant.availableBalance,
                                escrowBefore: merchant.escrowBalance,
                                escrowAfter: updatedMerchant.escrowBalance
                            }
                        });
                    }
                }
                else if (user.role === 'SUPER_ADMIN') {
                    const updatedUser = await tx.user.update({
                        where: { id: user.id },
                        data: { balance: { increment: comm.amount } }
                    });
                    await tx.balanceTransaction.create({
                        data: {
                            userId: user.id,
                            type: 'COMMISSION',
                            amount: comm.amount,
                            description: `Platform Fee Settlement (Order: ${orderId})`,
                            balanceBefore: Number(user.balance),
                            balanceAfter: Number(updatedUser.balance)
                        }
                    });
                }
                await tx.commission.update({
                    where: { id: comm.id },
                    data: { status: 'SETTLED', settledAt: new Date() }
                });
            }
        });
        console.log(`[Settlement] Profits for order ${orderId} have been settled.`);
    }
    async handleCommissionReversal(orderId) {
        await this.prisma.$transaction(async (tx) => {
            const commissions = await tx.commission.findMany({
                where: { orderId, status: { in: ['SETTLED', 'PENDING'] } },
                include: { user: { include: { merchant: true } } }
            });
            if (commissions.length === 0)
                return;
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order)
                return;
            for (const comm of commissions) {
                const user = comm.user;
                if (user.role === 'MERCHANT' && user.merchant) {
                    const merchantId = user.merchant.id;
                    const merchant = await tx.merchant.findUnique({ where: { id: merchantId } });
                    if (!merchant)
                        continue;
                    if (comm.status === 'PENDING') {
                        await tx.merchant.update({
                            where: { id: merchantId },
                            data: { escrowBalance: { decrement: comm.amount } }
                        });
                        await tx.merchantLedgerMovement.create({
                            data: {
                                merchantId: merchantId,
                                orderId: order.id,
                                type: 'ESCROW_OUT',
                                amount: -comm.amount,
                                description: `Reversal Laba (Gagal Fulfillment): ${order.orderNumber} (Level: ESCROW)`,
                                availableBefore: merchant.availableBalance,
                                availableAfter: merchant.availableBalance,
                                escrowBefore: merchant.escrowBalance,
                                escrowAfter: merchant.escrowBalance - comm.amount
                            }
                        });
                    }
                    else if (comm.status === 'SETTLED') {
                        const updatedMerchant = await tx.merchant.update({
                            where: { id: merchantId },
                            data: { availableBalance: { decrement: comm.amount } }
                        });
                        await tx.merchantLedgerMovement.create({
                            data: {
                                merchantId: merchantId,
                                orderId: order.id,
                                type: 'AVAILABLE_OUT',
                                amount: -comm.amount,
                                description: `Reversal Laba (Gagal Fulfillment): ${order.orderNumber} (Level: AVAILABLE)`,
                                availableBefore: merchant.availableBalance,
                                availableAfter: updatedMerchant.availableBalance,
                                escrowBefore: updatedMerchant.escrowBalance,
                                escrowAfter: updatedMerchant.escrowBalance
                            }
                        });
                    }
                }
                else if (user.role === 'SUPER_ADMIN' && comm.status === 'SETTLED') {
                    await tx.user.update({
                        where: { id: user.id },
                        data: { balance: { decrement: comm.amount } }
                    });
                    await tx.balanceTransaction.create({
                        data: {
                            userId: user.id,
                            type: 'ADJUSTMENT',
                            amount: -comm.amount,
                            description: `Reversal Platform Fee (Order Gagal: ${order.orderNumber})`
                        }
                    });
                }
                await tx.commission.update({
                    where: { id: comm.id },
                    data: { status: 'CANCELLED' }
                });
            }
        });
        console.log(`[Reversal] Profits for order ${orderId} have been reversed.`);
    }
    async handleCustomerRefund(orderId) {
        await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { user: true }
            });
            if (!order || order.paymentStatus !== 'PAID' || order.fulfillmentStatus === 'REFUNDED')
                return;
            const existingRefund = await tx.balanceTransaction.findFirst({
                where: { orderId, type: 'REFUND', userId: order.userId, amount: { gt: 0 } }
            });
            if (existingRefund)
                return;
            const isGuest = !order.user.email && order.user.name.startsWith('Guest ');
            if (isGuest) {
                const voucherCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${order.id.substring(order.id.length - 4)}`;
                console.log(`[CustomerRefund] Order ${order.orderNumber} is a GUEST order. Generating Refund Voucher: ${voucherCode}`);
                await tx.promoCode.create({
                    data: {
                        merchantId: order.merchantId,
                        code: voucherCode,
                        name: `Refund Voucher: ${order.orderNumber}`,
                        description: `Voucher pengembalian dana untuk pesanan gagal: ${order.productSkuName}`,
                        type: 'DISCOUNT_FLAT',
                        value: order.sellingPrice,
                        quota: 1,
                        usedCount: 0,
                        isActive: true,
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }
                });
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: 'REFUNDED',
                        fulfillmentStatus: 'FAILED',
                        failReason: `PESANAN GAGAL: Kami telah menerbitkan VOUCHER REFUND senilai Rp ${order.sellingPrice.toLocaleString('id-ID')}. Gunakan kode: ${voucherCode} pada pembelian berikutnya.`,
                        note: `VOUCHER REFUND GUEST: ${voucherCode} (Nilai: Rp ${order.sellingPrice.toLocaleString('id-ID')})`
                    }
                });
                if (order.user.phone) {
                }
                return;
            }
            const user = await tx.user.update({
                where: { id: order.userId },
                data: { balance: { increment: order.sellingPrice } }
            });
            await tx.balanceTransaction.create({
                data: {
                    userId: order.userId,
                    type: 'REFUND',
                    amount: order.sellingPrice,
                    balanceBefore: Number(user.balance) - Number(order.sellingPrice),
                    balanceAfter: Number(user.balance),
                    orderId: order.id,
                    description: `Refund otomatis (Order Gagal): ${order.orderNumber}`
                }
            });
            await tx.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'REFUNDED' }
            });
            console.log(`[CustomerRefund] Order ${order.orderNumber} fully refunded to user ${order.user.name}.`);
        });
    }
    async processPriceWebhook(payload) {
        if (!Array.isArray(payload))
            return;
        setImmediate(async () => {
            for (const item of payload) {
                const skuCode = item.buyer_sku_code;
                const newPrice = Number(item.price);
                const skus = await this.prisma.productSku.findMany({
                    where: { supplierCode: skuCode, supplier: { code: 'DIGIFLAZZ' } }
                });
                for (const sku of skus) {
                    if (newPrice > Number(sku.priceNormal)) {
                        console.error(`[AntiLoss] Price Spike! New Base (${newPrice}) > Current Retail (${sku.priceNormal}). DEACTIVATING ${skuCode}.`);
                        await this.prisma.productSku.update({
                            where: { id: sku.id },
                            data: { status: 'INACTIVE' }
                        });
                        continue;
                    }
                    await this.prisma.$transaction(async (tx) => {
                        const updatedPriceNormal = newPrice + Number(sku.marginNormal);
                        const updatedPricePro = newPrice + Number(sku.marginPro);
                        const updatedPriceLegend = newPrice + Number(sku.marginLegend);
                        const updatedPriceSupreme = newPrice + Number(sku.marginSupreme);
                        const updatedSku = await tx.productSku.update({
                            where: { id: sku.id },
                            data: {
                                basePrice: newPrice,
                                priceNormal: updatedPriceNormal,
                                pricePro: updatedPricePro,
                                priceLegend: updatedPriceLegend,
                                priceSupreme: updatedPriceSupreme
                            }
                        });
                        const merchantPrices = await tx.merchantProductPrice.findMany({
                            where: { productSkuId: sku.id, isActive: true },
                            include: { merchant: true }
                        });
                        for (const mp of merchantPrices) {
                            const plan = mp.merchant.plan;
                            let currentModalPrice = updatedPricePro;
                            if (plan === 'LEGEND')
                                currentModalPrice = updatedPriceLegend;
                            else if (plan === 'SUPREME')
                                currentModalPrice = updatedPriceSupreme;
                            const merchantSettings = await tx.merchantSetting.findMany({
                                where: { merchantId: mp.merchantId }
                            });
                            const markupSetting = merchantSettings.find(s => s.key === 'MARKUP_PERCENTAGE');
                            const markupPercentage = markupSetting ? parseFloat(markupSetting.value) : 0;
                            if (markupPercentage > 0) {
                                const newDynamicPrice = Math.ceil(currentModalPrice + (currentModalPrice * (markupPercentage / 100)));
                                console.log(`[DynamicMarkup] Updating Price for Merchant ${mp.merchant.name}: ${mp.customPrice} -> ${newDynamicPrice} (${markupPercentage}%)`);
                                await tx.merchantProductPrice.update({
                                    where: { id: mp.id },
                                    data: { customPrice: newDynamicPrice }
                                });
                            }
                            else {
                                if (Number(mp.customPrice) < currentModalPrice) {
                                    await tx.merchantProductPrice.update({
                                        where: { id: mp.id },
                                        data: {
                                            isActive: false,
                                            reason: `Otomatis: Modal (${currentModalPrice}) > Harga Jual (${mp.customPrice})`
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });
        return { success: true };
    }
    verifyWebhookSignature(signature, event, refId) {
        const { username, key } = this.getDigiflazzConfig();
        const staticSign = crypto.createHash('md5').update(username + key + 'callback').digest('hex');
        if (signature === staticSign)
            return true;
        if (refId) {
            const dynamicSign = crypto.createHash('md5').update(username + key + refId).digest('hex');
            if (signature === dynamicSign)
                return true;
        }
        return false;
    }
    async processTransactionWebhook(data) {
        if (!data || !data.ref_id)
            return;
        const order = await this.prisma.order.findUnique({
            where: { orderNumber: data.ref_id }
        });
        if (!order) {
            console.warn(`[DigiflazzWebhook] Order ${data.ref_id} tidak ditemukan.`);
            return;
        }
        const statusMap = {
            'Sukses': 'SUCCESS',
            'Gagal': 'FAILED',
            'Pending': 'PROCESSING'
        };
        const newStatus = statusMap[data.status] || 'PROCESSING';
        if (order.fulfillmentStatus === 'SUCCESS' || order.fulfillmentStatus === 'FAILED' || order.fulfillmentStatus === 'REFUNDED') {
            return;
        }
        await this.prisma.order.update({
            where: {
                id: order.id,
                fulfillmentStatus: { notIn: ['SUCCESS', 'FAILED', 'REFUNDED'] }
            },
            data: {
                fulfillmentStatus: newStatus,
                serialNumber: data.sn || order.serialNumber,
                failReason: data.status === 'Gagal' ? data.message : order.failReason,
                completedAt: data.status === 'Sukses' ? new Date() : order.completedAt,
                failedAt: data.status === 'Gagal' ? new Date() : order.failedAt,
            }
        });
        if (newStatus === 'FAILED') {
            await this.prisma.disputeCase.create({
                data: {
                    orderId: order.id,
                    userId: order.userId,
                    reason: `Sistem Otomatis (Webhook): Transaksi Digiflazz merespons GAGAL. Lakukan pengecekan manual ke Live Chat Digiflazz sebelum Refund.`,
                    status: 'OPEN'
                }
            });
            this.whatsappService.sendAdminSummary(`⚠️ *POTENSI SENGKETA (DISPUTE)*\nOrder ${order.orderNumber} merespons Gagal dari Webhook Digiflazz.\n` +
                `Otomatis masuk ke antrean Sengketa. Segera cek manual ke Digiflazz sebelum Refund!`).catch(() => { });
        }
        console.log(`[DigiflazzWebhook] Transaksi ${data.ref_id} diupdate ke status ${newStatus}`);
    }
    maskSensitiveData(data) {
        if (!data || typeof data !== 'object')
            return data;
        const sensitiveKeys = ['username', 'sign', 'key', 'apiKey', 'api_key', 'apiSecret', 'password', 'pin'];
        const masked = Array.isArray(data) ? [...data] : { ...data };
        for (const key of Object.keys(masked)) {
            if (sensitiveKeys.includes(key)) {
                masked[key] = '********';
            }
            else if (typeof masked[key] === 'object' && masked[key] !== null) {
                masked[key] = this.maskSensitiveData(masked[key]);
            }
        }
        return masked;
    }
    async retryStuckOrders() {
        const fiveMinsAgo = new Date();
        fiveMinsAgo.setMinutes(fiveMinsAgo.getMinutes() - 5);
        const stuckOrders = await this.prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                fulfillmentStatus: 'PROCESSING',
                updatedAt: { lt: fiveMinsAgo }
            },
            take: 20
        });
        if (stuckOrders.length > 0) {
            this.logger.log(`[Cron] Found ${stuckOrders.length} stuck PROCESSING orders. Retrying...`);
        }
        for (const order of stuckOrders) {
            try {
                await this.placeOrder(order.id);
                this.logger.log(`[Cron] Successfully hit retry for ${order.orderNumber}`);
            }
            catch (err) {
                this.logger.error(`[Cron] Failed to retry order ${order.orderNumber}: ${err.message}`);
            }
        }
    }
    async bulkAdjustMargins(amount, type) {
        this.logger.log(`[BulkAdjust] Starting margin adjustment of Rp ${amount} for tier: ${type}`);
        const skus = await this.prisma.productSku.findMany({
            where: { status: 'ACTIVE' }
        });
        const updates = skus.map(sku => {
            const data = {};
            if (type === 'PRO' || type === 'ALL') {
                data.marginPro = { increment: amount };
                data.pricePro = { increment: amount };
            }
            if (type === 'LEGEND' || type === 'ALL') {
                data.marginLegend = { increment: amount };
                data.priceLegend = { increment: amount };
            }
            if (type === 'SUPREME' || type === 'ALL') {
                data.marginSupreme = { increment: amount };
                data.priceSupreme = { increment: amount };
            }
            return this.prisma.productSku.update({
                where: { id: sku.id },
                data
            });
        });
        await this.prisma.$transaction(updates);
        return { success: true, updatedCount: updates.length };
    }
};
exports.DigiflazzService = DigiflazzService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigiflazzService.prototype, "retryStuckOrders", null);
exports.DigiflazzService = DigiflazzService = DigiflazzService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], DigiflazzService);
//# sourceMappingURL=digiflazz.service.js.map