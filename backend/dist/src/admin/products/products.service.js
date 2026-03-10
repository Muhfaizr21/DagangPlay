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
                const brandSlug = item.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const category = await this.prisma.category.upsert({
                    where: { slug: brandSlug },
                    update: {},
                    create: { name: item.brand, slug: brandSlug, isActive: true }
                });
                const productSlug = `${brandSlug}-topup`;
                const product = await this.prisma.product.upsert({
                    where: { slug: productSlug },
                    update: {},
                    create: { name: `${item.brand} Topup`, slug: productSlug, categoryId: category.id, status: 'ACTIVE' }
                });
                const rule = rulesByCategory.get(category.id) || globalRule;
                const basePrice = Number(item.price);
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
    async getPublicCategories(merchantSlug) {
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
            const skuCount = cat.products.reduce((acc, p) => acc + (p._count?.skus || 0), 0);
            if (mergedMap.has(canonicalSlug)) {
                const existing = mergedMap.get(canonicalSlug);
                existing.skuCount += skuCount;
                if (!existing.image && cat.image)
                    existing.image = cat.image;
            }
            else {
                mergedMap.set(canonicalSlug, {
                    ...cat,
                    slug: canonicalSlug,
                    name: canonicalName,
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
        return result.sort((a, b) => a.name.localeCompare(b.name));
    }
    async getPublicCategoryBySlug(slug, merchantSlug) {
        let merchantId;
        if (merchantSlug) {
            const m = await this.prisma.merchant.findFirst({ where: { slug: merchantSlug } });
            merchantId = m?.id;
        }
        let slugsToFetch = [slug];
        if (slug === 'free-fire')
            slugsToFetch = ['free-fire', 'free-fire-max', 'free-fire-garena'];
        if (slug === 'mobile-legends')
            slugsToFetch = ['mobile-legend', 'mobile-legends', 'mlbb'];
        let categories = await this.prisma.category.findMany({
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
        if (categories.length === 0) {
            const catByProduct = await this.prisma.category.findFirst({
                where: { products: { some: { slug: slug } } },
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
            if (catByProduct)
                categories = [catByProduct];
        }
        if (categories.length === 0)
            return null;
        const merchantPrices = merchantId ? await this.prisma.merchantProductPrice.findMany({
            where: { merchantId, isActive: true }
        }) : [];
        const priceMap = new Map(merchantPrices.map(mp => [mp.productSkuId, mp.customPrice]));
        const primary = categories[0];
        const allProducts = categories.flatMap(c => c.products.map(p => ({
            ...p,
            skus: p.skus.map(s => ({
                ...s,
                priceNormal: priceMap.has(s.id) ? priceMap.get(s.id) : s.priceNormal
            }))
        })));
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
    async getPublicContent(merchantSlug) {
        let targetMerchant;
        if (merchantSlug) {
            targetMerchant = await this.prisma.merchant.findFirst({
                where: { slug: merchantSlug }
            });
        }
        if (!targetMerchant) {
            targetMerchant = await this.prisma.merchant.findFirst({
                where: { isOfficial: true }
            });
        }
        if (!targetMerchant)
            return { banners: [], announcements: [] };
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
    async getPublicResellerPrices(merchantSlug) {
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
    async getPublicFullCatalog(merchantSlug) {
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
            slug: cat.slug,
            icon: cat.icon,
            image: cat.image,
            products: cat.products.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map