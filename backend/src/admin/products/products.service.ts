import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SkuStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    // 1. Get All Categories
    async getCategories() {
        const categories = await this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                },
                products: {
                    select: {
                        _count: {
                            select: { skus: true }
                        }
                    }
                }
            }
        });

        return categories.map(cat => ({
            ...cat,
            totalSkus: cat.products.reduce((acc, p) => acc + (p._count?.skus || 0), 0)
        }));
    }

    async updateCategoryImage(name: string, imageUrl: string) {
        return this.prisma.category.updateMany({
            where: { name },
            data: { image: imageUrl, icon: imageUrl }
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

            if (!response.ok || !jsonResp.data || !Array.isArray(jsonResp.data)) {
                // Fallback to cache if available or just error out
                throw new Error(`Digiflazz Sync Error: ${JSON.stringify(jsonResp.data || jsonResp)}`);
            }

            const items = jsonResp.data;

            // 1. Fetch all pricing rules to apply them during sync
            const allRules = await this.prisma.tierPricingRule.findMany();
            const globalRule = allRules.find(r => !r.categoryId && r.isActive);
            const rulesByCategory = new Map();
            allRules.filter(r => r.categoryId && r.isActive).forEach(r => rulesByCategory.set(r.categoryId, r));

            // 2. Ensure Supplier
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE', apiUrl: url, apiKey: key, apiSecret: 'SECRET' }
            });

            let updatedCount = 0;
            let newCount = 0;

            for (const item of items) {
                // More inclusive filtering for gaming products
                const isGame = item.category?.toLowerCase().includes('game') ||
                    item.category === 'Games' ||
                    item.type === 'Games';
                if (!isGame) continue;

                // A. Category Upsert
                const brandSlug = item.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const category = await this.prisma.category.upsert({
                    where: { slug: brandSlug },
                    update: {},
                    create: { name: item.brand, slug: brandSlug, isActive: true }
                });

                // B. Product Upsert
                const productSlug = `${brandSlug}-topup`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: {},
                    create: { name: `${item.brand} Topup`, slug: productSlug, categoryId: category.id, status: 'ACTIVE' }
                });

                // C. Determine Pricing Rule
                const rule = rulesByCategory.get(category.id) || globalRule;
                const basePrice = Number(item.price);

                // Fallback margins if no rule exists: Normal 12%, Pro 8%, Legend 5%, Supreme 3%
                const mNormal = rule?.marginNormal ?? 12;
                const mPro = rule?.marginPro ?? 8;
                const mLegend = rule?.marginLegend ?? 5;
                const mSupreme = rule?.marginSupreme ?? 3;

                const priceNormal = Math.ceil(basePrice * (1 + mNormal / 100));
                const pricePro = Math.ceil(basePrice * (1 + mPro / 100));
                const priceLegend = Math.ceil(basePrice * (1 + mLegend / 100));
                const priceSupreme = Math.ceil(basePrice * (1 + mSupreme / 100));

                const skuRecord = await this.prisma.productSku.findFirst({
                    where: { supplierCode: item.buyer_sku_code, supplierId: supplier.id }
                });

                const isAvailable = item.buyer_product_status && item.seller_product_status;

                if (skuRecord) {
                    await this.prisma.productSku.update({
                        where: { id: skuRecord.id },
                        data: {
                            basePrice,
                            priceNormal,
                            pricePro,
                            priceLegend,
                            priceSupreme,
                            marginNormal: mNormal,
                            marginPro: mPro,
                            marginLegend: mLegend,
                            marginSupreme: mSupreme,
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                    updatedCount++;
                } else {
                    await this.prisma.productSku.create({
                        data: {
                            productId: product.id,
                            supplierId: supplier.id,
                            name: item.product_name,
                            supplierCode: item.buyer_sku_code,
                            basePrice,
                            priceNormal,
                            pricePro,
                            priceLegend,
                            priceSupreme,
                            marginNormal: mNormal,
                            marginPro: mPro,
                            marginLegend: mLegend,
                            marginSupreme: mSupreme,
                            status: isAvailable ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                    newCount++;
                }
            }

            await this.prisma.auditLog.create({
                data: {
                    action: 'DIGIFLAZZ_FULL_SYNC',
                    entity: 'ProductSku',
                    newData: { newCount, updatedCount, totalIn: items.length },
                    oldData: {}
                }
            });

            return { success: true, message: `Sinkronisasi Berhasil: ${newCount} baru, ${updatedCount} diupdate.`, newCount, updatedCount };

        } catch (err: any) {
            console.error('[ProductsService] Sync Error:', err);
            throw new InternalServerErrorException(err.message || 'Gagal sinkronisasi produk');
        }
    }

    // 4. Get All SKUs for Pricing Management
    async getAllSkusPricing() {
        return this.prisma.productSku.findMany({
            include: {
                product: {
                    select: {
                        name: true,
                        category: { select: { name: true, image: true, id: true } }
                    }
                }
            },
            orderBy: [
                { product: { name: 'asc' } },
                { basePrice: 'asc' }
            ]
        });
    }

    // 5. Update SKU Prices (Manual Single Update)
    async updateSkuPrice(id: string, prices: any) {
        const sku = await this.prisma.productSku.findUnique({ where: { id } });
        if (!sku) throw new Error('SKU tidak ditemukan');

        const base = Number(sku.basePrice);
        const updated = await this.prisma.productSku.update({
            where: { id },
            data: {
                priceNormal: prices.normal,
                pricePro: prices.pro,
                priceLegend: prices.legend,
                priceSupreme: prices.supreme,
                marginNormal: ((prices.normal - base) / base) * 100,
                marginPro: ((prices.pro - base) / base) * 100,
                marginLegend: ((prices.legend - base) / base) * 100,
                marginSupreme: ((prices.supreme - base) / base) * 100,
            }
        });

        // Log to TierPriceHistory
        await this.prisma.tierPriceHistory.create({
            data: {
                productSkuId: id,
                oldBasePrice: Number(sku.basePrice),
                oldPriceNormal: Number(sku.priceNormal),
                oldPricePro: Number(sku.pricePro),
                oldPriceLegend: Number(sku.priceLegend),
                oldPriceSupreme: Number(sku.priceSupreme),
                newBasePrice: Number(sku.basePrice),
                newPriceNormal: prices.normal,
                newPricePro: prices.pro,
                newPriceLegend: prices.legend,
                newPriceSupreme: prices.supreme,
                changeType: 'MANUAL',
                changedBy: 'admin',
                reason: 'Update manual Super Admin'
            }
        });

        return updated;
    }

    // 6. Bulk Apply Formula to Category
    async applyCategoryFormula(categoryId: string, margins: any) {
        const skus = await this.prisma.productSku.findMany({
            where: { product: { categoryId } }
        });

        const updates = skus.map(async (sku) => {
            const base = Number(sku.basePrice);
            const newPriceNormal = Math.ceil(base * (1 + margins.normal / 100));
            const newPricePro = Math.ceil(base * (1 + margins.pro / 100));
            const newPriceLegend = Math.ceil(base * (1 + margins.legend / 100));
            const newPriceSupreme = Math.ceil(base * (1 + margins.supreme / 100));

            // Update SKU
            await this.prisma.productSku.update({
                where: { id: sku.id },
                data: {
                    priceNormal: newPriceNormal,
                    pricePro: newPricePro,
                    priceLegend: newPriceLegend,
                    priceSupreme: newPriceSupreme,
                    marginNormal: margins.normal,
                    marginPro: margins.pro,
                    marginLegend: margins.legend,
                    marginSupreme: margins.supreme,
                }
            });

            // Log History
            return this.prisma.tierPriceHistory.create({
                data: {
                    productSkuId: sku.id,
                    oldBasePrice: Number(sku.basePrice),
                    oldPriceNormal: Number(sku.priceNormal),
                    oldPricePro: Number(sku.pricePro),
                    oldPriceLegend: Number(sku.priceLegend),
                    oldPriceSupreme: Number(sku.priceSupreme),
                    newBasePrice: Number(sku.basePrice),
                    newPriceNormal: newPriceNormal,
                    newPricePro: newPricePro,
                    newPriceLegend: newPriceLegend,
                    newPriceSupreme: newPriceSupreme,
                    changeType: 'BULK_UPDATE',
                    changedBy: 'admin',
                    reason: `Bulk update kategori ${categoryId}`
                }
            });
        });

        await Promise.all(updates);
        return { success: true, count: skus.length };
    }

    // 7. Toggle SKU Status
    async updateSkuStatus(id: string, status: string) {
        return this.prisma.productSku.update({
            where: { id },
            data: { status: status as SkuStatus }
        });
    }

    // Public API Methods 
    async getPublicCategories() {
        // Find categories that have at least one active product with active SKUs
        const categories = await this.prisma.category.findMany({
            where: {
                isActive: true,
                products: {
                    some: {
                        status: 'ACTIVE',
                        skus: {
                            some: { status: 'ACTIVE' }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                icon: true,
                products: {
                    where: { status: 'ACTIVE' },
                    select: {
                        _count: {
                            select: { skus: { where: { status: 'ACTIVE' } } }
                        }
                    }
                }
            }
        });

        // Group categories by canonical name to merge duplicates like Free Fire and Free Fire Max
        const mergedMap = new Map<string, any>();

        for (const cat of categories) {
            let canonicalSlug = cat.slug;
            let canonicalName = cat.name;

            // Merging logic
            if (cat.slug.startsWith('free-fire')) {
                canonicalSlug = 'free-fire';
                canonicalName = 'Free Fire';
            } else if (cat.slug === 'mlbb' || cat.slug === 'mobile-legend') {
                canonicalSlug = 'mobile-legends';
                canonicalName = 'Mobile Legends';
            }

            const skuCount = cat.products.reduce((acc, p) => acc + p._count.skus, 0);

            if (mergedMap.has(canonicalSlug)) {
                const existing = mergedMap.get(canonicalSlug);
                existing.skuCount += skuCount;
                // Keep the one with an image if possible
                if (!existing.image && cat.image) {
                    existing.image = cat.image;
                }
            } else {
                mergedMap.set(canonicalSlug, {
                    ...cat,
                    slug: canonicalSlug,
                    name: canonicalName,
                    skuCount: skuCount
                });
            }
        }

        return Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    async getPublicCategoryBySlug(slug: string) {
        // Handle canonical slugs - if user asks for 'free-fire', fetch both 'free-fire' and 'free-fire-max'
        let slugsToFetch = [slug];
        if (slug === 'free-fire') slugsToFetch = ['free-fire', 'free-fire-max', 'free-fire-garena'];
        if (slug === 'mobile-legends') slugsToFetch = ['mobile-legend', 'mobile-legends', 'mlbb'];

        const categories = await this.prisma.category.findMany({
            where: { slug: { in: slugsToFetch } },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                products: {
                    where: { status: 'ACTIVE' },
                    select: {
                        id: true,
                        name: true,
                        gameIdLabel: true,
                        gameServerId: true,
                        serverLabel: true,
                        skus: {
                            where: { status: 'ACTIVE' },
                            orderBy: { priceNormal: 'asc' },
                            select: {
                                id: true,
                                name: true,
                                priceNormal: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if (categories.length === 0) return null;

        // Merge results into a single object 
        const primary = categories[0];
        const allProducts = categories.flatMap(c => c.products);

        const mergedResult = {
            ...primary,
            name: slug === 'free-fire' ? 'Free Fire' : (slug === 'mobile-legends' ? 'Mobile Legends' : primary.name),
            slug: slug,
            products: allProducts
        };

        // Force labels for specific games if database has incorrect info
        const canonicalName = mergedResult.name.toLowerCase();

        if (canonicalName.includes('mobile legend') || canonicalName.includes('mlbb')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "User ID",
                gameServerId: true,
                serverLabel: "Zone ID"
            }));
        } else if (canonicalName.includes('free fire')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "Player ID",
                gameServerId: false
            }));
        } else if (canonicalName.includes('genshin') || canonicalName.includes('honkai')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "UID",
                gameServerId: true,
                serverLabel: "Server"
            }));
        } else if (canonicalName.includes('pubg')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "Player ID",
                gameServerId: false
            }));
        }

        return mergedResult;
    }

    // 8. Get Public Content (Banners & Announcements) for Landing Page
    async getPublicContent() {
        const officialMerchant = await this.prisma.merchant.findFirst({
            where: { isOfficial: true }
        });

        if (!officialMerchant) return { banners: [], announcements: [] };

        const [banners, announcements] = await Promise.all([
            this.prisma.banner.findMany({
                where: { merchantId: officialMerchant.id, isActive: true },
                orderBy: { sortOrder: 'asc' }
            }),
            this.prisma.announcement.findMany({
                where: { merchantId: officialMerchant.id, isActive: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return { banners, announcements };
    }

    // 9. Get Public Reseller Sample Prices
    async getPublicResellerPrices() {
        // Find a few sample popular products
        const sampleSkus = await this.prisma.productSku.findMany({
            where: {
                OR: [
                    { name: { contains: 'Diamonds', mode: 'insensitive' } },
                    { name: { contains: 'UC', mode: 'insensitive' } },
                    { name: { contains: 'Vouchers', mode: 'insensitive' } },
                ],
                status: 'ACTIVE'
            },
            include: {
                product: {
                    include: { category: true }
                }
            },
            take: 3,
            orderBy: { basePrice: 'asc' }
        });

        return sampleSkus.map(sku => ({
            name: `${sku.product.name} ${sku.name}`,
            normal: Number(sku.priceNormal),
            pro: Number(sku.pricePro),
            legend: Number(sku.priceLegend),
            supreme: Number(sku.priceSupreme),
            img: sku.product.category.image || 'https://via.placeholder.com/50'
        }));
    }

    // 10. Get Full Public Catalog for Reseller Page
    async getPublicFullCatalog() {
        const categories = await this.prisma.category.findMany({
            include: {
                products: {
                    include: {
                        skus: {
                            where: { status: 'ACTIVE' },
                            orderBy: { basePrice: 'asc' }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            image: cat.image,
            products: cat.products.map(p => ({
                id: p.id,
                name: p.name,
                image: p.thumbnail || cat.image,
                skus: p.skus.map(s => ({
                    id: s.id,
                    name: s.name,
                    normal: Number(s.priceNormal),
                    pro: Number(s.pricePro),
                    legend: Number(s.priceLegend),
                    supreme: Number(s.priceSupreme)
                }))
            }))
        }));
    }
}
