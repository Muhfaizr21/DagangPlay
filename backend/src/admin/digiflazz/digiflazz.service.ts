import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { WhatsappService } from '../../common/notifications/whatsapp.service';

@Injectable()
export class DigiflazzService {
    private readonly logger = new Logger(DigiflazzService.name);
    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) { }

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

                const response = await axios.post(`${url}/price-list`, {
                    cmd: "prepaid",
                    username: username,
                    sign: sign
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });

                const jsonResp = response.data;

                if (response.status !== 200 || !jsonResp.data) {
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
            const msg = err.response?.data?.message || err.message;
            this.logger.error('[Digiflazz] Error fetching price list:', msg);
            throw new InternalServerErrorException(`Digiflazz Connection Error: ${msg}`);
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
        // CRITICAL FIX: Jalankan sinkronisasi secara asinkron di belakang layar (Background Job)
        // untuk mencegah 504 Gateway Timeout pada panel frontend Admin
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
                } catch (err) {
                    console.error(`[BulkSync] Gagal sync produk ${p.buyer_sku_code}:`, err);
                }
            }
            console.log(`[BulkSync] Selesai: ${successCount} dari ${payload.length} produk tersinkronisasi.`);
        });

        return { success: true, message: `Proses sinkronisasi massal untuk ${payload.length} produk sedang berjalan di latar belakang.` };
    }

    /**
     * Check Order Status from Digiflazz
     */
    async checkOrderStatus(orderId: string, supplierRefId: string, buyerSkuCode: string, customerNo: string) {
        const { username, key, url } = this.getDigiflazzConfig();
        // Sign: md5(username + apikey + ref_id)
        const sign = crypto.createHash('md5').update(username + key + supplierRefId).digest('hex');

        const response = await axios.post(`${url}/transaction`, {
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

    /**
     * Check Balance from Digiflazz
     */
    async checkBalance() {
        const { username, key, url } = this.getDigiflazzConfig();
        // Sign: md5(username + apikey + "depo")
        const sign = crypto.createHash('md5').update(username + key + 'depo').digest('hex');

        const response = await axios.post(`${url}/cek-saldo`, {
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
            include: { productSku: true, user: true }
        });

        if (!order) throw new NotFoundException('Order not found for fulfillment');
        if (order.fulfillmentStatus === 'SUCCESS') return;

        // FIX #16: Guard against null/empty gameUserId before hitting Digiflazz
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

        // 1. SUPPLIER BALANCE CHECK (To prevent blind API requests and properly handle failure)
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
                
                // Notify admin of zero balance risk
                this.whatsappService.sendAdminSummary(
                    `⚠️ *SALDO SUPPLIER HABIS*\n` +
                    `Order ${order.orderNumber} gagal karena saldo Digiflazz (${currentBalance}) kurang dari harga modal dasar (${order.basePrice}). Segera top-up!`
                ).catch(() => {});
                
                return null;
            }
        } catch (balErr: any) {
            this.logger.error(`[SupplierBalance] Failed to verify balance, proceeding normally: ${balErr.message}`);
        }

        // --- ANTI-LOSS GUARD (CRITICAL FIX) ---
        const currentBasePrice = Number(order.productSku.basePrice);
        const lockedModalPrice = Number(order.merchantModalPrice || order.sellingPrice);

        // If Digiflazz price jumped above what we charged the merchant, abort and dispute.
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
        let response: any;
        try {
            response = await axios.post(`${url}/transaction`, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            });
            resJson = response.data;

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

                // REVERSAL LOGIC: DIBATALKAN. Gunakan Sistem Dispute Case manual.
                if (fulfillmentStatus === 'FAILED') {
                    await this.prisma.disputeCase.create({
                        data: {
                            orderId: order.id,
                            userId: order.userId,
                            reason: `Sistem Otomatis: Transaksi Digiflazz merespons GAGAL. Lakukan pengecekan manual ke Live Chat Digiflazz sebelum Refund.`,
                            status: 'OPEN'
                        }
                    });

                    this.whatsappService.sendAdminSummary(
                        `⚠️ *POTENSI SENGKETA (DISPUTE)*\nOrder ${order.orderNumber} merespons Gagal dari Digiflazz.\n` +
                        `Otomatis masuk ke antrean Sengketa. Segera cek manual ke Digiflazz sebelum Refund!`
                    ).catch(() => {});
                }

                // SEND NOTIFICATION (SUCCESS/FAILED)
                if (fulfillmentStatus === 'SUCCESS' || fulfillmentStatus === 'FAILED') {
                    this.whatsappService.sendFulfillmentNotification(
                        order.user.phone || '',
                        order.orderNumber,
                        `${order.productName} - ${order.productSkuName}`,
                        fulfillmentStatus,
                        data.sn || 'N/A'
                    ).catch(err => this.logger.error(`[FulfillmentNotification] Failed: ${err.message}`));
                    
                    // FIXED: AUTO SETTLEMENT (Move funds to Available Balance)
                    if (fulfillmentStatus === 'SUCCESS') {
                        await this.settleOrderProfit(order.id);
                    }
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
                
                // create dispute case
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
        } catch (err: any) {
            console.error('[DigiflazzService] Fulfillment Connection Error (Potentially Stuck):', err.message);
            // FATAL FIX: Jangan langsung anggap FAILED jika hanya error koneksi
            // Biarkan status tetap PROCESSING agar Cron Job bisa mengecek ulang nanti.
            // Jika langsung FAILED, resiko Double Refund jika ternyata di supplier SUKSES.
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

    /**
     * Logic Settlement Profit (Memindahkan Dana dari Escrow ke Available)
     * Dipanggil saat fulfillment SUKSES.
     */
    public async settleOrderProfit(orderId: string) {
        await this.prisma.$transaction(async (tx) => {
            // ATOMIC PROTECT: Lock commissions by flipping status to SETTLED first.
            // If they are already SETTLED, updated.count will be 0, preventing double payout.
            const updated = await tx.commission.updateMany({
                where: { orderId, status: 'PENDING' },
                data: { status: 'SETTLED', settledAt: new Date() }
            });

            if (updated.count === 0) return; // Already settled or no commissions

            // Re-fetch the SETTLED ones to know the amounts (we just flipped them)
            const commissions = await tx.commission.findMany({
                where: { orderId, status: 'SETTLED', settledAt: { gte: new Date(Date.now() - 5000) } }, // newly settled
                include: { user: { include: { merchant: true } } }
            });

            for (const comm of commissions) {
                const user = comm.user;

                // 1. Jika User adalah Merchant (Merchant Owner)
                if (user.role === 'MERCHANT' && user.merchant) {
                    const merchantId = user.merchant.id;
                    const merchant = await tx.merchant.findUnique({ where: { id: merchantId } });

                    if (merchant) {
                        // Move Escrow -> Available
                        const updatedMerchant = await tx.merchant.update({
                            where: { id: merchantId },
                            data: {
                                escrowBalance: { decrement: comm.amount },
                                availableBalance: { increment: comm.amount }
                            }
                        });

                        // Log movement
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
                // 2. Jika User adalah Super Admin (Platform Cut)
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

                // Mark commission as SETTLED
                await tx.commission.update({
                    where: { id: comm.id },
                    data: { status: 'SETTLED', settledAt: new Date() }
                });
            }
        });
        console.log(`[Settlement] Profits for order ${orderId} have been settled.`);
    }
    /**
     * Logic Reversal Profit (untuk Digiflazz Gagal)
     * Membatalkan komisi yang sudah SETTLED atau PENDING dan menarik dana dari entity yang tepat.
     */
    public async handleCommissionReversal(orderId: string) {
        await this.prisma.$transaction(async (tx) => {
            const commissions = await tx.commission.findMany({
                where: { orderId, status: { in: ['SETTLED', 'PENDING'] } },
                include: { user: { include: { merchant: true } } }
            });

            if (commissions.length === 0) return;

            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order) return;

            for (const comm of commissions) {
                const user = comm.user;

                // FIXED 13: Cek peran user sebelum menarik dana (Jangan semua ditarik dari Merchant!)
                if (user.role === 'MERCHANT' && user.merchant) {
                    const merchantId = user.merchant.id;
                    const merchant = await tx.merchant.findUnique({ where: { id: merchantId } });

                    if (!merchant) continue;

                    if (comm.status === 'PENDING') {
                        // Reversal from Escrow (funds were not yet available)
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
                    } else if (comm.status === 'SETTLED') {
                        // Reversal from Available (funds were already liquid)
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
                // FIXED 13.2: Tarik balik dana Platform dari Super Admin (Jika terbayar)
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

                // Mark commission as CANCELLED irrespective of status
                await tx.commission.update({
                    where: { id: comm.id },
                    data: { status: 'CANCELLED' }
                });
            }
        });
        console.log(`[Reversal] Profits for order ${orderId} have been reversed.`);
    }

    /**
     * Logic Refund to Customer (Buyer) saat fulfillment gagal total
     */
    public async handleCustomerRefund(orderId: string) {
        // CRITICAL FIX: "Check-then-Act" Race Condition. Semuanya harus di dalam 1 transaksi.
        await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { user: true }
            });

            if (!order || order.paymentStatus !== 'PAID' || order.fulfillmentStatus === 'REFUNDED') return;

            // Cek apakah sudah pernah direfund sebelumnya
            const existingRefund = await tx.balanceTransaction.findFirst({
                where: { orderId, type: 'REFUND', userId: order.userId, amount: { gt: 0 } }
            });
            if (existingRefund) return;

            // IDENTIFIKASI GUEST: Jika user tidak punya email dan namanya diawali "Guest "
            const isGuest = !order.user.email && order.user.name.startsWith('Guest ');

            if (isGuest) {
                const voucherCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${order.id.substring(order.id.length - 4)}`;
                console.log(`[CustomerRefund] Order ${order.orderNumber} is a GUEST order. Generating Refund Voucher: ${voucherCode}`);
                
                // FIXED: FALLACY REFUND GUEST. Ganti dengan sistem VOUCHER (PromoCode).
                // Karena Guest tidak bisa login, saldo di user.balance tidak akan pernah terpakai.
                // Dengan PromoCode, mereka bisa memasukkan kode ini di pesanan berikutnya untuk diskon 100%.
                await tx.promoCode.create({
                    data: {
                        merchantId: order.merchantId,
                        code: voucherCode,
                        name: `Refund Voucher: ${order.orderNumber}`,
                        description: `Voucher pengembalian dana untuk pesanan gagal: ${order.productSkuName}`,
                        type: 'DISCOUNT_FLAT',
                        value: order.sellingPrice, // Voucher senilai harga yang sudah dibayar
                        quota: 1,
                        usedCount: 0,
                        isActive: true,
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Berlaku 30 hari
                    }
                });

                // Update Order with Refund Instructions
                await tx.order.update({
                    where: { id: order.id },
                    data: { 
                        paymentStatus: 'REFUNDED',
                        fulfillmentStatus: 'FAILED',
                        failReason: `PESANAN GAGAL: Kami telah menerbitkan VOUCHER REFUND senilai Rp ${order.sellingPrice.toLocaleString('id-ID')}. Gunakan kode: ${voucherCode} pada pembelian berikutnya.`,
                        note: `VOUCHER REFUND GUEST: ${voucherCode} (Nilai: Rp ${order.sellingPrice.toLocaleString('id-ID')})`
                    }
                });

                // Notifikasi WhatsApp jika ada nomor HP
                if (order.user.phone) {
                    // This is outside tx, so we might need to handle it differently, 
                    // but for now we'll rely on the existing pattern.
                }

                return;
            }

            // 1. Credit balance to User
            const user = await tx.user.update({
                where: { id: order.userId },
                data: { balance: { increment: order.sellingPrice } }
            });

            // 2. Log Balance Transaction
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

            // 3. Mark Order as Refunded
            await tx.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'REFUNDED' }
            });
            console.log(`[CustomerRefund] Order ${order.orderNumber} fully refunded to user ${order.user.name}.`);
        });
    }

    /**
     * Webhook Handler untuk Perubahan Harga (Negative Margin Protection)
     */
    async processPriceWebhook(payload: any) {
        if (!Array.isArray(payload)) return;

        setImmediate(async () => {
        for (const item of payload) {
            const skuCode = item.buyer_sku_code;
            const newPrice = Number(item.price);

            // 1. Update our master price (ProductSku)
            const skus = await this.prisma.productSku.findMany({
                where: { supplierCode: skuCode, supplier: { code: 'DIGIFLAZZ' } }
            });

            for (const sku of skus) {
                // FATAL: SA ANTI-LOSS logic
                // Jika modal baru mendadak melampaui harga jual retail lami, OFF-kan SKU
                if (newPrice > Number(sku.priceNormal)) {
                    console.error(`[AntiLoss] Price Spike! New Base (${newPrice}) > Current Retail (${sku.priceNormal}). DEACTIVATING ${skuCode}.`);
                    await this.prisma.productSku.update({
                        where: { id: sku.id },
                        data: { status: 'INACTIVE' }
                    });
                    continue;
                }

                await this.prisma.$transaction(async (tx) => {
                    // Recalculate Tier Prices based on new base price + existing margins
                    const updatedPriceNormal = newPrice + Number(sku.marginNormal);
                    const updatedPricePro = newPrice + Number(sku.marginPro);
                    const updatedPriceLegend = newPrice + Number(sku.marginLegend);
                    const updatedPriceSupreme = newPrice + Number(sku.marginSupreme);

                    // Update Master SKU with new prices
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

                    // 2. CHECK ALL MERCHANT CUSTOM PRICES & SYNC MODALS
                    const merchantPrices = await tx.merchantProductPrice.findMany({
                        where: { productSkuId: sku.id, isActive: true },
                        include: { merchant: true }
                    });

                    for (const mp of merchantPrices) {
                        const plan = mp.merchant.plan;
                        
                        // Gunakan harga modal Tier sebagai benchmark
                        let currentModalPrice = updatedPricePro;
                        if (plan === 'LEGEND') currentModalPrice = updatedPriceLegend;
                        else if (plan === 'SUPREME') currentModalPrice = updatedPriceSupreme;

                        // NEW: DYNAMIC MARKUP PERCENTAGE LOGIC
                        const merchantSettings = await tx.merchantSetting.findMany({
                            where: { merchantId: mp.merchantId }
                        });
                        const markupSetting = merchantSettings.find(s => s.key === 'MARKUP_PERCENTAGE');
                        const markupPercentage = markupSetting ? parseFloat(markupSetting.value) : 0;

                        if (markupPercentage > 0) {
                            // Automatically update price to maintain margin
                            const newDynamicPrice = Math.ceil(currentModalPrice + (currentModalPrice * (markupPercentage / 100)));
                            console.log(`[DynamicMarkup] Updating Price for Merchant ${mp.merchant.name}: ${mp.customPrice} -> ${newDynamicPrice} (${markupPercentage}%)`);
                            
                            await tx.merchantProductPrice.update({
                                where: { id: mp.id },
                                data: { customPrice: newDynamicPrice }
                            });
                        } else {
                            // FALLBACK TO ANTI-LOSS (Status Quo)
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

    /**
     * Verify Webhook Signature for Security
     */
    public verifyWebhookSignature(signature: string, event: string, refId?: string): boolean {
        const { username, key } = this.getDigiflazzConfig();
        
        // 1. Check for standard 'callback' static signature
        const staticSign = crypto.createHash('md5').update(username + key + 'callback').digest('hex');
        if (signature === staticSign) return true;

        // 2. Check for dynamic transaction-based signature (username + key + ref_id)
        if (refId) {
            const dynamicSign = crypto.createHash('md5').update(username + key + refId).digest('hex');
            if (signature === dynamicSign) return true;
        }

        return false;
    }
    /**
     * Webhook Handler untuk Status Transaksi
     */
    async processTransactionWebhook(data: any) {
        if (!data || !data.ref_id) return;

        const order = await this.prisma.order.findUnique({
            where: { orderNumber: data.ref_id }
        });

        if (!order) {
            console.warn(`[DigiflazzWebhook] Order ${data.ref_id} tidak ditemukan.`);
            return;
        }

        const statusMap: any = {
            'Sukses': 'SUCCESS',
            'Gagal': 'FAILED',
            'Pending': 'PROCESSING'
        };

        const newStatus = statusMap[data.status] || 'PROCESSING';

        // Skip if already in final status
        if (order.fulfillmentStatus === 'SUCCESS' || order.fulfillmentStatus === 'FAILED' || order.fulfillmentStatus === 'REFUNDED') {
            return;
        }

        await this.prisma.order.update({
            where: {
                id: order.id,
                // Pastikan tidak ketimpa jika webhook telat dan manual update oleh admin sudah diproses
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

            this.whatsappService.sendAdminSummary(
                `⚠️ *POTENSI SENGKETA (DISPUTE)*\nOrder ${order.orderNumber} merespons Gagal dari Webhook Digiflazz.\n` +
                `Otomatis masuk ke antrean Sengketa. Segera cek manual ke Digiflazz sebelum Refund!`
            ).catch(() => {});
        }

        console.log(`[DigiflazzWebhook] Transaksi ${data.ref_id} diupdate ke status ${newStatus}`);
    }

    /**
     * Mask sensitive fields in logs
     */
    private maskSensitiveData(data: any): any {
        if (!data || typeof data !== 'object') return data;

        const sensitiveKeys = ['username', 'sign', 'key', 'apiKey', 'api_key', 'apiSecret', 'password', 'pin'];
        const masked = Array.isArray(data) ? [...data] : { ...data };

        for (const key of Object.keys(masked)) {
            if (sensitiveKeys.includes(key)) {
                masked[key] = '********';
            } else if (typeof masked[key] === 'object' && masked[key] !== null) {
                masked[key] = this.maskSensitiveData(masked[key]);
            }
        }
        return masked;
    }

    /**
     * Cron Job to re-process ALL Stuck/PROCESSING orders automatically
     */
    @Cron('*/5 * * * *')
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
                // By re-calling placeOrder with same ref_id, Digiflazz acts as status checker (idempotent)
                await this.placeOrder(order.id);
                this.logger.log(`[Cron] Successfully hit retry for ${order.orderNumber}`);
            } catch (err: any) {
                this.logger.error(`[Cron] Failed to retry order ${order.orderNumber}: ${err.message}`);
            }
        }
    }

    /**
     * BULK MARGIN ADJUSTER: Increase/Decrease margin for ALL products (Control Room)
     */
    async bulkAdjustMargins(amount: number, type: 'PRO' | 'LEGEND' | 'SUPREME' | 'ALL') {
        this.logger.log(`[BulkAdjust] Starting margin adjustment of Rp ${amount} for tier: ${type}`);
        
        const skus = await this.prisma.productSku.findMany({
            where: { status: 'ACTIVE' }
        });

        const updates = skus.map(sku => {
            const data: any = {};
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
}
