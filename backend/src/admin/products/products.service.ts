import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    // 1. Get All Categories
    async getCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }

    // 2. Get All Products with their SKUs
    async getProducts() {
        return this.prisma.product.findMany({
            include: {
                category: true,
                skus: {
                    orderBy: { basePrice: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 3. Sync from Digiflazz API
    async syncDigiflazzProducts() {
        try {
            const username = process.env.DIGIFLAZZ_USERNAME;
            const key = process.env.DIGIFLAZZ_KEY;
            const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';

            if (!username || !key) {
                throw new Error('Credential Digiflazz tidak ditemukan di .env');
            }

            // Generate MD5 signature required by Digiflazz
            // Formula: md5(username + apikey + "pricelist")
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

            const jsonResp = await response.json();

            if (!response.ok || !jsonResp.data) {
                throw new Error(`Digiflazz Error: ${JSON.stringify(jsonResp)}`);
            }

            const items = jsonResp.data; // Array of product objects

            // Ensure Digiflazz Supplier exists
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE' }
            });

            let updatedCount = 0;
            let newCount = 0;

            // Group digiflazz items by brand (Game Name)
            // They have { buyer_sku_code, product_name, category, brand, type, seller_name, price, buyer_product_status, seller_product_status }
            // Because we map "brand" ->  Category/Product in our system
            // For simplicity we will iterate and map

            for (const item of items) {
                // e.g., category: 'Games', brand: 'MOBILE LEGENDS', type: 'Umum'
                if (item.category !== 'Games') continue; // Only want games

                // 1. Ensure Category
                const brandSlug = item.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const category = await this.prisma.category.upsert({
                    where: { slug: brandSlug },
                    update: {},
                    create: { name: item.brand, slug: brandSlug, isActive: true }
                });

                // 2. Ensure Product
                const productSlug = `${brandSlug}-diamonds`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: {},
                    create: { name: `${item.brand} Topup`, slug: productSlug, categoryId: category.id, status: 'ACTIVE' }
                });

                // 3. Upsert SKU
                // Calculate dynamic selling price (e.g., basePrice + 10%)
                const basePrice = item.price;
                const sellingPrice = Math.ceil(basePrice * 1.10); // 10% markup standard

                const skuRecord = await this.prisma.productSku.findFirst({
                    where: { supplierCode: item.buyer_sku_code }
                });

                const isAvailable = item.buyer_product_status && item.seller_product_status;

                if (skuRecord) {
                    // Update exists
                    await this.prisma.productSku.update({
                        where: { id: skuRecord.id },
                        data: {
                            basePrice,
                            // We only update selling price if we want strict sync, otherwise omit
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                    updatedCount++;
                } else {
                    // Create new
                    await this.prisma.productSku.create({
                        data: {
                            productId: product.id,
                            supplierId: supplier.id,
                            name: item.product_name,
                            supplierCode: item.buyer_sku_code,
                            basePrice,
                            sellingPrice,
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                    newCount++;
                }
            }

            // Log the sync event
            await this.prisma.auditLog.create({
                data: {
                    action: 'DIGIFLAZZ_MANUAL_SYNC',
                    entity: 'Product',
                    newData: { newCount, updatedCount, totalItemsParsed: items.length },
                    oldData: {}
                }
            });

            return {
                success: true,
                message: 'Sync Berhasil',
                newCount,
                updatedCount,
            };

        } catch (err: any) {
            console.error(err);
            throw new InternalServerErrorException(err.message || 'Gagal sinkronisasi produk');
        }
    }
}
