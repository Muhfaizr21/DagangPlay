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
                        sellingPrice: localSku.sellingPrice,
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
        sellingPrice: number;  // Price we sell to Merchants
        status: string;        // ACTIVE / INACTIVE
    }) {
        try {
            // Ensure Digiflazz Supplier exists
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE' }
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
                        sellingPrice: dto.sellingPrice,
                        status: dto.status as any
                    }
                });

                // Audit log for price update
                if (Number(existingSku.sellingPrice) !== Number(dto.sellingPrice) || Number(existingSku.basePrice) !== Number(dto.digiflazz_price)) {
                    await this.prisma.auditLog.create({
                        data: {
                            action: 'DIGIFLAZZ_PRICE_UPDATE',
                            entity: 'ProductSku',
                            newData: { sellingPrice: dto.sellingPrice, basePrice: dto.digiflazz_price },
                            oldData: { sellingPrice: Number(existingSku.sellingPrice), basePrice: Number(existingSku.basePrice) },
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
                        sellingPrice: dto.sellingPrice,
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
                sellingPrice: p.sellingPrice,
                status: p.status
            });
            successCount++;
        }
        return { success: true, message: `${successCount} produk berhasil di-sync secara massal.` };
    }
}
