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
                        category: { select: { name: true } }
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map