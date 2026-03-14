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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const crypto = __importStar(require("crypto"));
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async updateCategoryImage(name, imageUrl) {
        return this.prisma.category.updateMany({
            where: { name },
            data: { image: imageUrl, icon: imageUrl }
        });
    }
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
                throw new Error(`Digiflazz Sync Error: ${JSON.stringify(jsonResp.data || jsonResp)}`);
            }
            const items = jsonResp.data;
            const allRules = await this.prisma.tierPricingRule.findMany();
            const globalRule = allRules.find(r => !r.categoryId && r.isActive);
            const rulesByCategory = new Map();
            allRules.filter(r => r.categoryId && r.isActive).forEach(r => rulesByCategory.set(r.categoryId, r));
            const supplier = await this.prisma.supplier.upsert({
                where: { code: 'DIGIFLAZZ' },
                update: {},
                create: { name: 'Digiflazz', code: 'DIGIFLAZZ', status: 'ACTIVE', apiUrl: url, apiKey: key, apiSecret: 'SECRET' }
            });
            let updatedCount = 0;
            let newCount = 0;
            for (const item of items) {
                const isGame = item.category?.toLowerCase().includes('game') ||
                    item.category === 'Games' ||
                    item.type === 'Games';
                if (!isGame)
                    continue;
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
                const brandUpper = item.brand.toUpperCase();
                const brandSlug = item.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const isPopular = popularBrands.includes(brandUpper);
                const sortOrder = isPopular ? (100 - popularBrands.indexOf(brandUpper)) : 0;
                const thumbnail = gameThumbnails[brandUpper] || `https://www.google.com/s2/favicons?sz=128&domain=${brandSlug}.com`;
                const category = await this.prisma.category.upsert({
                    where: { slug: brandSlug },
                    update: { image: thumbnail, icon: thumbnail, sortOrder: sortOrder },
                    create: { name: item.brand, slug: brandSlug, isActive: true, image: thumbnail, icon: thumbnail, sortOrder: sortOrder }
                });
                const productSlug = `${brandSlug}-topup`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: { isPopular: isPopular, sortOrder: sortOrder, thumbnail: thumbnail },
                    create: { name: `${item.brand} Topup`, slug: productSlug, categoryId: category.id, status: 'ACTIVE', isPopular: isPopular, sortOrder: sortOrder, thumbnail: thumbnail }
                });
                const rule = rulesByCategory.get(category.id) || globalRule;
                const basePrice = Number(item.price);
                const mNormal = rule?.marginNormal ?? 10;
                const mPro = rule?.marginPro ?? 8;
                const mLegend = rule?.marginLegend ?? 5;
                const mSupreme = rule?.marginSupreme ?? 3;
                const priceNormal = Math.ceil(basePrice * (1 + mNormal / 100));
                const pricePro = Math.ceil(basePrice * (1 + mPro / 100));
                const priceLegend = Math.ceil(basePrice * (1 + mLegend / 100));
                const priceSupreme = Math.ceil(basePrice * (1 + mSupreme / 100));
                const skuRecord = await this.prisma.productSku.findFirst({
                    where: { supplierCode: item.buyer_sku_code, supplierId: supplier.id, productId: product.id }
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
                }
                else {
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
        }
        catch (err) {
            console.error('[ProductsService] Sync Error:', err);
            throw new common_1.InternalServerErrorException(err.message || 'Gagal sinkronisasi produk');
        }
    }
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
    async updateSkuPrice(id, prices) {
        const sku = await this.prisma.productSku.findUnique({ where: { id } });
        if (!sku)
            throw new Error('SKU tidak ditemukan');
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
    async applyCategoryFormula(categoryId, margins) {
        const skus = await this.prisma.productSku.findMany({
            where: { product: { categoryId } }
        });
        const updates = skus.map(async (sku) => {
            const base = Number(sku.basePrice);
            const newPriceNormal = Math.ceil(base * (1 + margins.normal / 100));
            const newPricePro = Math.ceil(base * (1 + margins.pro / 100));
            const newPriceLegend = Math.ceil(base * (1 + margins.legend / 100));
            const newPriceSupreme = Math.ceil(base * (1 + margins.supreme / 100));
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
    async updateSkuStatus(id, status) {
        return this.prisma.productSku.update({
            where: { id },
            data: { status: status }
        });
    }
    async resolveMerchant(merchantSlug, domain) {
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
    async getPublicCategories(merchantSlug, domain) {
        let merchantId;
        let isOfficial = true;
        const m = await this.resolveMerchant(merchantSlug, domain);
        if (m) {
            merchantId = m.id;
            isOfficial = !!m.isOfficial;
        }
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
        const mergedMap = new Map();
        for (const cat of categories) {
            let canonicalSlug = cat.slug;
            let canonicalName = cat.name;
            const lowSlug = cat.slug.toLowerCase();
            if (lowSlug.startsWith('free-fire')) {
                canonicalSlug = 'free-fire';
                canonicalName = 'Free Fire';
            }
            else if (lowSlug === 'mlbb' || lowSlug === 'mobile-legend' || lowSlug === 'mobile-legends') {
                canonicalSlug = 'mobile-legends';
                canonicalName = 'Mobile Legends';
            }
            else if (lowSlug === 'pubg' || lowSlug === 'pubg-mobile') {
                canonicalSlug = 'pubg-mobile';
                canonicalName = 'PUBG MOBILE';
            }
            let skuCount = 0;
            for (const prod of cat.products) {
                for (const sku of prod.skus) {
                    const mPrice = sku.merchantProductPrices?.[0];
                    const isActive = mPrice ? mPrice.isActive : true;
                    if (isActive)
                        skuCount++;
                }
            }
            if (skuCount === 0)
                continue;
            if (mergedMap.has(canonicalSlug)) {
                const existing = mergedMap.get(canonicalSlug);
                existing.skuCount += skuCount;
                if (!existing.image && cat.image)
                    existing.image = cat.image;
            }
            else {
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
        const fallbacks = {
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
        const fullCats = await this.prisma.category.findMany({
            where: { slug: { in: result.map(r => r.slug) } },
            select: { slug: true, sortOrder: true }
        });
        const orderMap = new Map(fullCats.map(c => [c.slug, c.sortOrder]));
        return result.sort((a, b) => {
            const orderA = orderMap.get(a.slug) || 0;
            const orderB = orderMap.get(b.slug) || 0;
            if (orderB !== orderA)
                return orderB - orderA;
            return a.name.localeCompare(b.name);
        });
    }
    async getPublicCategoryBySlug(slug, merchantSlug, domain) {
        let merchantId;
        let isOfficial = true;
        const m = await this.resolveMerchant(merchantSlug, domain);
        if (m) {
            merchantId = m.id;
            isOfficial = !!m.isOfficial;
        }
        let slugsToFetch = [slug];
        if (slug === 'free-fire')
            slugsToFetch = ['free-fire', 'free-fire-max', 'free-fire-garena'];
        if (slug === 'mobile-legends')
            slugsToFetch = ['mobile-legend', 'mobile-legends', 'mlbb'];
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
            if (catByProduct)
                categories = [catByProduct];
        }
        if (categories.length === 0)
            return null;
        const merchantPrices = merchantId ? await this.prisma.merchantProductPrice.findMany({
            where: { merchantId }
        }) : [];
        const priceMap = new Map(merchantPrices.map(mp => [mp.productSkuId, mp.customPrice]));
        const visibilityMap = new Map(merchantPrices.map(mp => [mp.productSkuId, mp.isActive]));
        const primary = categories[0];
        const allProducts = categories.flatMap(c => c.products.map(p => {
            const filteredSkus = p.skus.filter(s => {
                const hasOverride = visibilityMap.has(s.id);
                const isActive = hasOverride ? visibilityMap.get(s.id) : true;
                return isActive;
            }).map(s => {
                const customPrice = priceMap.get(s.id);
                return {
                    ...s,
                    priceNormal: customPrice !== undefined ? customPrice : s.priceNormal
                };
            });
            const override = p.overrides?.[0];
            return {
                ...p,
                name: override?.customName || p.name,
                thumbnail: override?.customThumbnail || p.thumbnail,
                skus: filteredSkus
            };
        })).filter(p => p.skus.length > 0);
        const mergedResult = {
            ...primary,
            name: slug === 'free-fire' ? 'Free Fire' : (slug === 'mobile-legends' ? 'Mobile Legends' : primary.name),
            slug: slug,
            products: allProducts
        };
        const canonicalName = mergedResult.name.toLowerCase();
        if (canonicalName.includes('mobile legend') || canonicalName.includes('mlbb')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "User ID",
                gameServerId: true,
                serverLabel: "Zone ID"
            }));
        }
        else if (canonicalName.includes('free fire')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "Player ID",
                gameServerId: false
            }));
        }
        else if (canonicalName.includes('genshin') || canonicalName.includes('honkai')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "UID",
                gameServerId: true,
                serverLabel: "Server"
            }));
        }
        else if (canonicalName.includes('pubg')) {
            mergedResult.products = mergedResult.products.map(p => ({
                ...p,
                gameIdLabel: "Player ID",
                gameServerId: false
            }));
        }
        if (!mergedResult.image) {
            const fallbacks = {
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
    async getPublicContent(merchantSlug, domain) {
        const targetMerchant = await this.resolveMerchant(merchantSlug, domain);
        if (!targetMerchant)
            return { banners: [], announcements: [] };
        const [banners, announcements, popupPromos] = await Promise.all([
            this.prisma.banner.findMany({
                where: { merchantId: targetMerchant.id, isActive: true },
                orderBy: { sortOrder: 'asc' }
            }),
            this.prisma.announcement.findMany({
                where: { merchantId: targetMerchant.id, isActive: true },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.popupPromo.findMany({
                where: {
                    merchantId: targetMerchant.id,
                    isActive: true,
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);
        return { banners, announcements, popupPromos };
    }
    async getPublicResellerPrices(merchantSlug, domain) {
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
    async getPublicFullCatalog(merchantSlug, domain) {
        let merchant = await this.resolveMerchant(merchantSlug, domain);
        const merchantId = merchant?.id;
        let isOfficial = true;
        if (merchant) {
            isOfficial = !!merchant.isOfficial;
        }
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
        return categories.map(cat => {
            const products = cat.products.map(p => {
                const skus = p.skus.filter(s => {
                    const mPrice = s.merchantProductPrices?.[0];
                    const isActive = mPrice ? mPrice.isActive : true;
                    return isActive;
                }).map(s => {
                    const mPrice = s.merchantProductPrices?.[0];
                    let defaultPrice = Number(s.priceNormal);
                    if (activeTier === 'PRO')
                        defaultPrice = Number(s.pricePro);
                    else if (activeTier === 'LEGEND')
                        defaultPrice = Number(s.priceLegend);
                    else if (activeTier === 'SUPREME')
                        defaultPrice = Number(s.priceSupreme);
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
                const fallbacks = {
                    'mobile-legends': 'https://img.df.sg/game/mlbb.png',
                    'free-fire': 'https://img.df.sg/game/ff.png',
                    'free-fire-max': 'https://img.df.sg/game/ffmax.png',
                    'pubg-mobile': 'https://img.df.sg/game/pubgm.png',
                    'genshin-impact': 'https://img.df.sg/game/genshin.png',
                    'valorant': 'https://img.df.sg/game/valorant.png'
                };
                const imageFallback = fallbacks[p.slug] || fallbacks[cat.slug] || cat.image;
                const override = p.overrides?.[0];
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map