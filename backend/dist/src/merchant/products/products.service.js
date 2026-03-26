"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const subscriptions_service_1 = require("../../admin/subscriptions/subscriptions.service");
let ProductsService = class ProductsService {
    prisma;
    subscriptionsService;
    constructor(prisma, subscriptionsService) {
        this.prisma = prisma;
        this.subscriptionsService = subscriptionsService;
    }
    async getProducts(merchantId, search, categoryId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            select: { plan: true, isOfficial: true }
        });
        const mapping = await this.prisma.planTierMapping.findUnique({
            where: { plan: merchant?.plan || 'FREE' }
        });
        const activeTier = mapping?.tier || 'NORMAL';
        const whereClause = {
            status: 'ACTIVE',
        };
        if (search) {
            whereClause.name = { contains: search, mode: 'insensitive' };
        }
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        const products = await this.prisma.product.findMany({
            where: whereClause,
            include: {
                category: {
                    select: { name: true }
                },
                skus: {
                    where: { status: 'ACTIVE' },
                    include: {
                        merchantProductPrices: {
                            where: { merchantId }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        return products.map(product => {
            const mappedSkus = product.skus.map(sku => {
                const merchantPriceDetails = sku.merchantProductPrices.length > 0 ? sku.merchantProductPrices[0] : null;
                let defaultTierPrice = Number(sku.priceNormal);
                if (activeTier === 'PRO')
                    defaultTierPrice = Number(sku.pricePro);
                if (activeTier === 'LEGEND')
                    defaultTierPrice = Number(sku.priceLegend);
                if (activeTier === 'SUPREME')
                    defaultTierPrice = Number(sku.priceSupreme);
                const finalPrice = merchantPriceDetails ? Number(merchantPriceDetails.customPrice) : defaultTierPrice;
                const isActive = merchantPriceDetails ? merchantPriceDetails.isActive : true;
                const margin = finalPrice - Number(sku.basePrice);
                return {
                    id: sku.id,
                    name: sku.name,
                    basePrice: Number(sku.basePrice),
                    defaultSellingPrice: defaultTierPrice,
                    merchantSellingPrice: finalPrice,
                    margin: margin,
                    isActive: isActive,
                    hasOverride: !!merchantPriceDetails,
                    tier: activeTier
                };
            });
            return {
                id: product.id,
                name: product.name,
                category: product.category?.name || 'Uncategorized',
                thumbnail: product.thumbnail || null,
                skus: mappedSkus
            };
        });
    }
    async updateSkuPriceOverrides(merchantId, userId, skuId, customPrice, isActive) {
        const sku = await this.prisma.productSku.findUnique({ where: { id: skuId } });
        if (!sku) {
            throw new common_1.NotFoundException('SKU tidak ditemukan');
        }
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        const mapping = await this.prisma.planTierMapping.findUnique({ where: { plan: merchant?.plan || 'FREE' } });
        const activeTier = mapping?.tier || 'NORMAL';
        let merchantModalPrice = Number(sku.priceNormal);
        if (activeTier === 'PRO')
            merchantModalPrice = Number(sku.pricePro);
        if (activeTier === 'LEGEND')
            merchantModalPrice = Number(sku.priceLegend);
        if (activeTier === 'SUPREME')
            merchantModalPrice = Number(sku.priceSupreme);
        if (customPrice < merchantModalPrice) {
            throw new common_1.BadRequestException(`Harga jual (Rp ${customPrice.toLocaleString('id-ID')}) tidak boleh lebih rendah dari harga modal (Rp ${merchantModalPrice.toLocaleString('id-ID')}) untuk Plan ${merchant?.plan}.`);
        }
        if (isActive) {
            await this.subscriptionsService.checkFeatureLimit(merchantId, 'maxProducts');
        }
        return this.prisma.merchantProductPrice.upsert({
            where: {
                merchantId_productSkuId: {
                    merchantId,
                    productSkuId: skuId
                }
            },
            update: {
                customPrice,
                isActive,
                userId
            },
            create: {
                merchantId,
                productSkuId: skuId,
                customPrice,
                isActive,
                userId
            }
        });
    }
    async bulkUpdateMargin(merchantId, userId, markupPercentage, markupAmount = 0, categoryId) {
        if (markupPercentage < 0 || markupAmount < 0) {
            throw new common_1.BadRequestException('Margin markup tidak boleh negatif.');
        }
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        const mapping = await this.prisma.planTierMapping.findUnique({ where: { plan: merchant?.plan || 'FREE' } });
        const activeTier = mapping?.tier || 'NORMAL';
        const productWhere = { status: 'ACTIVE' };
        if (categoryId) {
            productWhere.categoryId = categoryId;
        }
        const products = await this.prisma.product.findMany({
            where: productWhere,
            include: { skus: { where: { status: 'ACTIVE' } } }
        });
        const skus = products.flatMap(p => p.skus);
        const existingPrices = await this.prisma.merchantProductPrice.count({
            where: { merchantId, productSkuId: { in: skus.map(s => s.id) }, isActive: true }
        });
        const newAdditionsCount = skus.length - existingPrices;
        await this.subscriptionsService.checkFeatureLimit(merchantId, 'maxProducts', newAdditionsCount > 0 ? newAdditionsCount : 0);
        const operations = skus.map(sku => {
            let defaultPrice = Number(sku.priceNormal);
            if (activeTier === 'PRO')
                defaultPrice = Number(sku.pricePro);
            if (activeTier === 'LEGEND')
                defaultPrice = Number(sku.priceLegend);
            if (activeTier === 'SUPREME')
                defaultPrice = Number(sku.priceSupreme);
            const newPrice = defaultPrice + (defaultPrice * (markupPercentage / 100)) + markupAmount;
            return this.prisma.merchantProductPrice.upsert({
                where: { merchantId_productSkuId: { merchantId, productSkuId: sku.id } },
                update: { customPrice: newPrice, userId, isActive: true },
                create: {
                    merchantId,
                    productSkuId: sku.id,
                    customPrice: newPrice,
                    isActive: true,
                    userId
                }
            });
        });
        await this.prisma.$transaction(operations);
        await this.prisma.auditLog.create({
            data: {
                userId,
                merchantId,
                action: 'BULK_PRICE_UPDATE',
                entity: 'MERCHANT_PRODUCT_PRICE',
                newData: { markupPercentage, markupAmount, categoryId, count: skus.length }
            }
        });
        return { success: true, count: operations.length };
    }
    async updateProductOverride(merchantId, productId, data) {
        return this.prisma.merchantProductOverride.upsert({
            where: {
                merchantId_productId: { merchantId, productId }
            },
            update: {
                ...data
            },
            create: {
                merchantId,
                productId,
                ...data
            }
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscriptions_service_1.SubscriptionsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map