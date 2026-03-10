import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DigiflazzService {
    constructor(private prisma: PrismaService) { }

    private getDigiflazzConfig() {
        const username = process.env.DIGIFLAZZ_USERNAME;
        const key = process.env.DIGIFLAZZ_KEY;
        const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';

        if (!username || !key) {
            throw new InternalServerErrorException('Kredensial Digiflazz tidak dikonfigurasi pada environment variables (.env)');
        }

        return { username, key, url };
    }
    // IN-MEMORY CACHE (Biar ngga gampang kena rate limit Sandbox!)
    private priceListCache: any[] | null = null;
    private lastFetchTime: number = 0;

    /**
     * Get Raw Digiflazz Prepaid Price List & merge with our system mapped products
     */
    async getDigiflazzProducts() {
        try {
            // Gunakan Cache jika masih berumur kurang dari 60 detik (1 Menit)
            const now = Date.now();
            let rawItems: any[] = [];

            if (this.priceListCache && (now - this.lastFetchTime) < 60000) {
                console.log('[DigiflazzService] Menggunakan data cache Digiflazz (Menghindari limitasi rate)');
                rawItems = this.priceListCache;
            } else {
                const { username, key, url } = this.getDigiflazzConfig();

                // Digiflazz Authentication: md5(username + apikey + "pricelist")
                const sign = crypto.createHash('md5').update(username + key + 'pricelist').digest('hex');

                const response = await fetch(`${url}/price-list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cmd: "prepaid",
                        username: username,
                        sign: sign
                    })
                });

                const jsonResp = await response.json() as any;

                if (!response.ok || !jsonResp.data) {
                    throw new InternalServerErrorException(`Digiflazz Error: ${JSON.stringify(jsonResp)}`);
                }

                // Kadang API Sandbox merespon dengan Error (misal: "Anda telah mencapai limitasi")
                rawItems = jsonResp.data;
                const cachePath = path.join(process.cwd(), 'digiflazz-cache.json');

                if (!Array.isArray(jsonResp.data)) {
                    console.warn('[DigiflazzService] API Digiflazz Error/Limit.', jsonResp.data);

                    // BACA FILE DARI DISK JIKA ADA CACHE REAL YANG TERSIMPAN SEBELUMNYA
                    if (fs.existsSync(cachePath)) {
                        console.log('[DigiflazzService] Memuat data Digiflazz dari local disk cache...');
                        rawItems = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                    } else {
                        // MOCK DATA FALLBACK TERAKHIR AGAR APP TIDAK CRASH SAMA SEKALI
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
                } else {
                    // Berhasil ambil data Array Asli! 
                    // Simpan ke in-memory cache
                    this.priceListCache = rawItems;
                    this.lastFetchTime = now;
                    // Simpan ke DISK agar Sandbox Limit tidak merusak list saat restart
                    fs.writeFileSync(cachePath, JSON.stringify(rawItems), 'utf8');
                    console.log('[DigiflazzService] Data Digiflazz asli berhasil disimpan ke local disk cache.');
                }
            }

            // Get all mapped SKUs from our database
            const localSkus = await this.prisma.productSku.findMany({
                where: { supplier: { code: 'DIGIFLAZZ' } },
                include: { product: { include: { category: true } } }
            });

            // Index local SKUs by supplierCode
            const skuMap = new Map();
            for (const sku of localSkus) {
                skuMap.set(sku.supplierCode, sku);
            }

            // Map and return Digiflazz items with local sync data
            return rawItems.map((item: any) => {
                const localSku = skuMap.get(item.buyer_sku_code);

                return {
                    buyer_sku_code: item.buyer_sku_code,
                    product_name: item.product_name,
                    category: item.category,
                    brand: item.brand,
                    type: item.type,
                    seller_name: item.seller_name,
                    price: item.price, // Digiflazz price (Our Cost)
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
        } catch (err: any) {
            console.error('[DigiflazzService] Error fetching price list:', err);
            throw new InternalServerErrorException(err.message || 'Gagal mengambil data dari Digiflazz');
        }
    }

    /**
     * Map or Update a Digiflazz Product into our system
     */
    async syncProduct(dto: {
        buyer_sku_code: string;
        product_name: string;
        brand: string;
        category_digiflazz: string;
        digiflazz_price: number;
        categoryId?: string;    // Our local Category ID
        productId?: string;     // Our local Product ID
        priceNormal: number;   // Price for NORMAL tier
        pricePro?: number;      // Price for PRO tier
        priceLegend?: number;   // Price for LEGEND tier
        priceSupreme?: number;  // Price for SUPREME tier
        status: string;        // ACTIVE / INACTIVE
    }) {
        try {
            // Ensure Digiflazz Supplier exists
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE', apiUrl: 'https://api.digiflazz.com/v1', apiKey: 'DUMMY_KEY', apiSecret: 'DUMMY_SECRET' }
            });

            // 1. Ensure Category
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

            // 2. Ensure Product
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
                // Update specific mapping
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
                        status: dto.status as any
                    }
                });

                // Audit log for price update
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
            } else {
                // Create new mapping
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
                        status: dto.status as any
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

            // 3. NEGATIVE MARGIN PROTECTION (Auto-deactivate if merchant loses money)
            // Fetch all merchants who have customized prices for this SKU
            const merchantPrices = await this.prisma.merchantProductPrice.findMany({
                where: { productSkuId: savedSku.id, isActive: true },
                include: { merchant: true }
            });

            for (const mp of merchantPrices) {
                const plan = mp.merchant.plan;
                let currentModalPrice = savedSku.priceNormal;

                if (plan === 'PRO') currentModalPrice = savedSku.pricePro;
                else if (plan === 'LEGEND') currentModalPrice = savedSku.priceLegend;
                else if (plan === 'SUPREME') currentModalPrice = savedSku.priceSupreme;

                // If Merchant Modal Cost > Merchant Selling Price
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
        } catch (err: any) {
            console.error('[DigiflazzService] Error syncing product:', err);
            throw new InternalServerErrorException('Gagal melakukan sinkronisasi produk (' + err.message + ')');
        }
    }

    /**
     * Bulk Sync Selected Products
     */
    async bulkSyncProducts(payload: any[]) {
        let successCount = 0;
        for (const p of payload) {
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
        return { success: true, message: `${successCount} produk berhasil di-sync secara massal.` };
    }

    /**
     * Check Order Status from Digiflazz
     */
    async checkOrderStatus(orderId: string, supplierRefId: string, buyerSkuCode: string, customerNo: string) {
        const { username, key, url } = this.getDigiflazzConfig();
        // Sign: md5(username + apikey + ref_id)
        const sign = crypto.createHash('md5').update(username + key + supplierRefId).digest('hex');

        const response = await fetch(`${url}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                buyer_sku_code: buyerSkuCode,
                customer_no: customerNo,
                ref_id: supplierRefId,
                sign
            })
        });

        const resJson = await response.json() as any;
        return resJson.data;
    }

    /**
     * Check Balance from Digiflazz
     */
    async checkBalance() {
        const { username, key, url } = this.getDigiflazzConfig();
        // Sign: md5(username + apikey + "depo")
        const sign = crypto.createHash('md5').update(username + key + 'depo').digest('hex');

        const response = await fetch(`${url}/cek-saldo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cmd: 'deposit',
                username,
                sign
            })
        });

        const resJson = await response.json() as any;
        if (resJson.data) {
            return Number(resJson.data.deposit || 0);
        }
        throw new Error('Gagal ambil saldo: ' + JSON.stringify(resJson));
    }

    /**
     * Cek apakah produk ready di Digiflazz (Stok & Status)
     */
    async checkAvailability(skuCode: string) {
        // Ambil data terbaru (atau dari cache)
        const products = await this.getDigiflazzProducts();
        const item = products.find((p: any) => p.buyer_sku_code === skuCode);

        if (!item) {
            return { isAvailable: false, reason: 'Produk tidak ditemukan di supplier' };
        }

        // buyer_product_status & seller_product_status harus true
        if (item.buyer_product_status === false || item.seller_product_status === false) {
            return {
                isAvailable: false,
                reason: (item as any).message || 'Produk sedang gangguan atau stok kosong di supplier'
            };
        }

        return { isAvailable: true, item };
    }

    /**
     * Place Order to Digiflazz (Automated Fulfillment)
     */
    async placeOrder(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { productSku: true }
        });

        if (!order) throw new NotFoundException('Order not found for fulfillment');
        if (order.fulfillmentStatus === 'SUCCESS') return;

        const { username, key, url } = this.getDigiflazzConfig();
        // Sign: md5(username + apikey + ref_id)
        const sign = crypto.createHash('md5').update(username + key + order.orderNumber).digest('hex');

        // Prepare customer number (standard format for ML/FF etc)
        const customerNo = order.gameUserServerId ? `${order.gameUserId}${order.gameUserServerId}` : order.gameUserId;

        const payload = {
            username,
            buyer_sku_code: order.productSku.supplierCode,
            customer_no: customerNo,
            ref_id: order.orderNumber,
            testing: process.env.NODE_ENV !== 'production', // Sandbox mode if not prod
            sign
        };

        let resJson: any;
        try {
            const response = await fetch(`${url}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            resJson = await response.json() as any;

            // Log fulfillment attempt
            await this.prisma.supplierLog.create({
                data: {
                    supplierId: order.productSku.supplierId,
                    orderId: order.id,
                    method: 'POST',
                    endpoint: `${url}/transaction`,
                    requestBody: this.maskSensitiveData(payload) as any,
                    responseBody: this.maskSensitiveData(resJson) as any,
                    httpStatus: response.status,
                    isSuccess: resJson.data?.status === 'Sukses' || resJson.data?.status === 'Pending'
                }
            });

            if (resJson.data) {
                const data = resJson.data;
                const statusMap: any = {
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

                // REVERSAL LOGIC: Jika Gagal, tarik kembali profit merchant yang sudah terlanjur masuk
                if (fulfillmentStatus === 'FAILED') {
                    await this.handleCommissionReversal(order.id);
                    await this.handleCustomerRefund(order.id);
                }

                return data;
            } else {
                // Digiflazz failed at API level
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: {
                        fulfillmentStatus: 'FAILED',
                        failReason: resJson.data?.message || 'Digiflazz API connection error'
                    }
                });
                await this.handleCommissionReversal(order.id);
                await this.handleCustomerRefund(order.id);
                return resJson;
            }
        } catch (err: any) {
            console.error('[DigiflazzService] Fulfillment Error:', err);
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    fulfillmentStatus: 'FAILED',
                    failReason: err.message || 'System error'
                }
            });
            await this.handleCommissionReversal(order.id);
            await this.handleCustomerRefund(order.id);
            throw err;
        }
    }

    /**
     * Logic Reversal Profit (untuk Digiflazz Gagal)
     */
    private async handleCommissionReversal(orderId: string) {
        const commissions = await this.prisma.commission.findMany({
            where: { orderId, status: 'SETTLED' }
        });

        if (commissions.length === 0) return;

        await this.prisma.$transaction(async (tx) => {
            for (const comm of commissions) {
                const user = await tx.user.update({
                    where: { id: comm.userId },
                    data: { balance: { decrement: comm.amount } }
                });

                await tx.balanceTransaction.create({
                    data: {
                        userId: comm.userId,
                        type: 'REFUND',
                        amount: -comm.amount,
                        balanceBefore: Number(user.balance) + comm.amount,
                        balanceAfter: Number(user.balance),
                        orderId,
                        description: `Reversal profit (Digiflazz Gagal): ${orderId}`
                    }
                });

                await tx.commission.update({
                    where: { id: comm.id },
                    data: { status: 'REFUNDED' }
                });
            }
        });
        console.log(`[FinanceProtect] Automated reversal for ${orderId} completed.`);
    }

    /**
     * Logic Refund to Customer (Buyer) saat fulfillment gagal total
     */
    private async handleCustomerRefund(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order || order.paymentStatus !== 'PAID') return;

        // Cek apakah sudah pernah direfund sebelumnya
        const existingRefund = await this.prisma.balanceTransaction.findFirst({
            where: { orderId, type: 'REFUND', userId: order.userId, amount: { gt: 0 } }
        });
        if (existingRefund) return;

        await this.prisma.$transaction(async (tx) => {
            // 1. Credit balance to User
            const user = await tx.user.update({
                where: { id: order.userId },
                data: { balance: { increment: order.totalPrice } }
            });

            // 2. Log Balance Transaction
            await tx.balanceTransaction.create({
                data: {
                    userId: order.userId,
                    type: 'REFUND',
                    amount: order.totalPrice,
                    balanceBefore: Number(user.balance) - order.totalPrice,
                    balanceAfter: Number(user.balance),
                    orderId: order.id,
                    description: `Refund otomatis (Order Gagal): ${order.orderNumber}`
                }
            });

            // 3. Mark Order as Refunded
            await tx.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'REFUNDED' }
            });
        });

        console.log(`[CustomerRefund] Order ${order.orderNumber} fully refunded to user ${order.user.name}.`);
    }

    /**
     * Webhook Handler untuk Perubahan Harga (Negative Margin Protection)
     */
    async processPriceWebhook(payload: any) {
        if (!Array.isArray(payload)) return;

        for (const item of payload) {
            const skuCode = item.buyer_sku_code;
            const newPrice = Number(item.price);

            // 1. Update our master price (ProductSku)
            const skus = await this.prisma.productSku.findMany({
                where: { supplierCode: skuCode, supplier: { code: 'DIGIFLAZZ' } }
            });

            for (const sku of skus) {
                await this.prisma.$transaction(async (tx) => {
                    // Update master base price
                    await tx.productSku.update({
                        where: { id: sku.id },
                        data: { basePrice: newPrice }
                    });

                    // 2. CHECK ALL MERCHANT CUSTOM PRICES
                    const merchantPrices = await tx.merchantProductPrice.findMany({
                        where: { productSkuId: sku.id, isActive: true },
                        include: { merchant: true }
                    });

                    for (const mp of merchantPrices) {
                        const plan = mp.merchant.plan;
                        let currentModalPrice = sku.priceNormal;

                        if (plan === 'PRO') currentModalPrice = sku.pricePro;
                        else if (plan === 'LEGEND') currentModalPrice = sku.priceLegend;
                        else if (plan === 'SUPREME') currentModalPrice = sku.priceSupreme;

                        // Force-deactivate if selling price < updated modal cost
                        if (mp.customPrice < currentModalPrice) {
                            await tx.merchantProductPrice.update({
                                where: { id: mp.id },
                                data: {
                                    isActive: false,
                                    reason: `Price Spike: Modal (${currentModalPrice}) > Jual (${mp.customPrice})`
                                }
                            });
                            console.warn(`[AntiLoss] Merchant ${mp.merchant.name} - SKU ${skuCode} DEACTIVATED.`);
                        }
                    }
                });
            }
        }
    }
}
