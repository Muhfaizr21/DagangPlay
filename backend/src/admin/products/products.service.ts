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

    private async resolveMerchant(merchantSlug?: string, domain?: string) {
        if (!merchantSlug && !domain) {
            return await this.prisma.merchant.findFirst({ where: { isOfficial: true, status: 'ACTIVE' } });
        }
        return await this.prisma.merchant.findFirst({
            where: {
                OR: [
                    merchantSlug ? { slug: merchantSlug } : {},
                    domain ? { domain: domain } : {},
                    domain ? { slug: domain.split('.')[0] } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            }
        });
    }

    // Public API Methods 
    async getPublicCategories(merchantSlug?: string, domain?: string) {
        let merchantId: string | undefined;
        let isOfficial = true;

        const m = await this.resolveMerchant(merchantSlug, domain);
        if (m) {
            merchantId = m.id;
            isOfficial = !!m.isOfficial;
        }

        // 1. Get ALL active categories 
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                products: {
                    where: { status: 'ACTIVE' },
                    include: {
                        skus: {
                            where: { status: 'ACTIVE' },
                            include: {
                                merchantProductPrices: merchantId ? {
                                    where: { merchantId }
                                } : false
                            }
                        }
                    }
                }
            }
        });

        const mergedMap = new Map<string, any>();

        for (const cat of categories) {
            let canonicalSlug = cat.slug;
            let canonicalName = cat.name;

            const lowSlug = cat.slug.toLowerCase();
            if (lowSlug.startsWith('free-fire')) {
                canonicalSlug = 'free-fire';
                canonicalName = 'Free Fire';
            } else if (lowSlug === 'mlbb' || lowSlug === 'mobile-legend' || lowSlug === 'mobile-legends') {
                canonicalSlug = 'mobile-legends';
                canonicalName = 'Mobile Legends';
            } else if (lowSlug === 'pubg' || lowSlug === 'pubg-mobile') {
                canonicalSlug = 'pubg-mobile';
                canonicalName = 'PUBG MOBILE';
            }

            // Calculate active SKU count for this merchant
            let skuCount = 0;
            for (const prod of cat.products) {
                for (const sku of prod.skus) {
                    const mPrice = (sku as any).merchantProductPrices?.[0];
                    const isActive = mPrice ? mPrice.isActive : true; // Default to true so stores aren't empty
                    if (isActive) skuCount++;
                }
            }

            if (skuCount === 0) continue;

            if (mergedMap.has(canonicalSlug)) {
                const existing = mergedMap.get(canonicalSlug);
                existing.skuCount += skuCount;
                if (!existing.image && cat.image) existing.image = cat.image;
            } else {
                mergedMap.set(canonicalSlug, {
                    id: cat.id,
                    name: canonicalName,
                    slug: canonicalSlug,
                    image: cat.image,
                    icon: cat.icon,
                    skuCount: skuCount
                });
            }
        }

        const fallbacks: Record<string, string> = {
            'mobile-legends': 'https://img.df.sg/game/mlbb.png',
            'free-fire': 'https://img.df.sg/game/ff.png',
            'free-fire-max': 'https://img.df.sg/game/ffmax.png',
            'pubg-mobile': 'https://img.df.sg/game/pubgm.png',
            'genshin-impact': 'https://img.df.sg/game/genshin.png',
            'valorant': 'https://img.df.sg/game/valorant.png',
            'roblox': 'https://img.df.sg/game/roblox.png',
            'starlight-princess': 'https://img.df.sg/game/starlight.png'
        };

        const result = Array.from(mergedMap.values());
        for (const item of result) {
            if (!item.image && fallbacks[item.slug]) {
                item.image = fallbacks[item.slug];
            }
        }

        return result.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getPublicCategoryBySlug(slug: string, merchantSlug?: string, domain?: string) {
        // Find merchant if provided
        let merchantId: string | undefined;
        let isOfficial = true;
        const m = await this.resolveMerchant(merchantSlug, domain);
        if (m) {
            merchantId = m.id;
            isOfficial = !!m.isOfficial;
        }

        // Handle canonical slugs - if user asks for 'free-fire', fetch both 'free-fire' and 'free-fire-max'
        let slugsToFetch = [slug];
        if (slug === 'free-fire') slugsToFetch = ['free-fire', 'free-fire-max', 'free-fire-garena'];
        if (slug === 'mobile-legends') slugsToFetch = ['mobile-legend', 'mobile-legends', 'mlbb'];

        let categories = await this.prisma.category.findMany({
            where: { slug: { in: slugsToFetch } },
            include: {
                products: {
                    where: { status: 'ACTIVE' },
                    include: {
                        overrides: merchantId ? {
                            where: { merchantId }
                        } : false,
                        skus: {
                            where: { status: 'ACTIVE' },
                            orderBy: { priceNormal: 'asc' }
                        }
                    }
                }
            }
        });

        // If not found by category slug, try to find by product slug
        if (categories.length === 0) {
            const catByProduct = await this.prisma.category.findFirst({
                where: { products: { some: { slug: slug } } },
                include: {
                    products: {
                        where: { status: 'ACTIVE' },
                        include: {
                            overrides: merchantId ? {
                                where: { merchantId }
                            } : false,
                            skus: {
                                where: { status: 'ACTIVE' },
                                orderBy: { priceNormal: 'asc' }
                            }
                        }
                    }
                }
            });
            if (catByProduct) categories = [catByProduct as any];
        }

        if (categories.length === 0) return null;

        // If merchantId is provided, fetch custom prices and visibility
        const merchantPrices = merchantId ? await this.prisma.merchantProductPrice.findMany({
            where: { merchantId }
        }) : [];

        const priceMap = new Map(merchantPrices.map(mp => [mp.productSkuId, mp.customPrice]));
        const visibilityMap = new Map(merchantPrices.map(mp => [mp.productSkuId, mp.isActive]));

        // Merge results into a single object 
        const primary = categories[0];
        const allProducts = (categories as any).flatMap(c => c.products.map(p => {
            const filteredSkus = p.skus.filter(s => {
                const hasOverride = visibilityMap.has(s.id);
                const isActive = hasOverride ? visibilityMap.get(s.id) : true; // Default to true so categories aren't empty
                return isActive;
            }).map(s => {
                const customPrice = priceMap.get(s.id);
                return {
                    ...s,
                    priceNormal: customPrice !== undefined ? customPrice : s.priceNormal
                };
            });

            const override = (p as any).overrides?.[0];
            return {
                ...p,
                name: override?.customName || p.name,
                thumbnail: override?.customThumbnail || (p as any).thumbnail,
                skus: filteredSkus
            };
        })).filter(p => p.skus.length > 0);

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

        if (!mergedResult.image) {
            const fallbacks: Record<string, string> = {
                'mobile-legends': 'https://img.df.sg/game/mlbb.png',
                'free-fire': 'https://img.df.sg/game/ff.png',
                'pubg-mobile': 'https://img.df.sg/game/pubgm.png',
                'genshin-impact': 'https://img.df.sg/game/genshin.png',
                'valorant': 'https://img.df.sg/game/valorant.png'
            };
            if (fallbacks[mergedResult.slug]) {
                mergedResult.image = fallbacks[mergedResult.slug];
            }
        }

        return mergedResult;
    }

    // 8. Get Public Content (Banners & Announcements) for Landing Page
    async getPublicContent(merchantSlug?: string, domain?: string) {
        const targetMerchant = await this.resolveMerchant(merchantSlug, domain);

        if (!targetMerchant) return { banners: [], announcements: [] };

        const [banners, announcements] = await Promise.all([
            this.prisma.banner.findMany({
                where: { merchantId: targetMerchant.id, isActive: true },
                orderBy: { sortOrder: 'asc' }
            }),
            this.prisma.announcement.findMany({
                where: { merchantId: targetMerchant.id, isActive: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return { banners, announcements };
    }

    // 9. Get Public Reseller Sample Prices
    async getPublicResellerPrices(merchantSlug?: string, domain?: string) {
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
    async getPublicFullCatalog(merchantSlug?: string, domain?: string) {
        let merchant: any = await this.resolveMerchant(merchantSlug, domain);

        const merchantId = merchant?.id;
        let isOfficial = true;
        if (merchant) {
            isOfficial = !!merchant.isOfficial;
        }


        // Get plan mapping for tiered pricing if unofficial
        let activeTier = 'NORMAL';
        if (merchant) {
            const mapping = await this.prisma.planTierMapping.findUnique({
                where: { plan: merchant.plan || 'FREE' }
            });
            activeTier = mapping?.tier || 'NORMAL';
        }

        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            include: {
                products: {
                    where: { status: 'ACTIVE' },
                    include: {
                        overrides: merchantId ? {
                            where: { merchantId }
                        } : false,
                        skus: {
                            where: { status: 'ACTIVE' },
                            include: {
                                merchantProductPrices: merchantId ? {
                                    where: { merchantId }
                                } : false
                            },
                            orderBy: { basePrice: 'asc' }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return (categories as any).map(cat => {
            const products = cat.products.map(p => {
                const skus = p.skus.filter(s => {
                    const mPrice = (s as any).merchantProductPrices?.[0];
                    const isActive = mPrice ? mPrice.isActive : true; // Default to true so stores aren't empty
                    return isActive;
                }).map(s => {
                    const mPrice = (s as any).merchantProductPrices?.[0];

                    // Determine default price based on merchant plan
                    let defaultPrice = Number(s.priceNormal);
                    if (activeTier === 'PRO') defaultPrice = Number(s.pricePro);
                    else if (activeTier === 'LEGEND') defaultPrice = Number(s.priceLegend);
                    else if (activeTier === 'SUPREME') defaultPrice = Number(s.priceSupreme);

                    const finalPrice = mPrice ? Number(mPrice.customPrice) : defaultPrice;

                    return {
                        id: s.id,
                        name: s.name,
                        normal: finalPrice,
                        pro: Number(s.pricePro),
                        legend: Number(s.priceLegend),
                        supreme: Number(s.priceSupreme)
                    };
                });

                const fallbacks: Record<string, string> = {
                    'mobile-legends': 'https://img.df.sg/game/mlbb.png',
                    'free-fire': 'https://img.df.sg/game/ff.png',
                    'free-fire-max': 'https://img.df.sg/game/ffmax.png',
                    'pubg-mobile': 'https://img.df.sg/game/pubgm.png',
                    'genshin-impact': 'https://img.df.sg/game/genshin.png',
                    'valorant': 'https://img.df.sg/game/valorant.png'
                };
                const imageFallback = fallbacks[p.slug] || fallbacks[cat.slug] || cat.image;

                const override = (p as any).overrides?.[0];
                const finalName = override?.customName || p.name;
                const finalThumbnail = override?.customThumbnail || p.thumbnail || imageFallback;

                return {
                    id: p.id,
                    name: finalName,
                    slug: p.slug,
                    image: finalThumbnail,
                    skus: skus
                };

            }).filter(p => p.skus.length > 0);

            return {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                image: cat.image,
                products: products
            };
        }).filter(cat => cat.products.length > 0);
    }
}
