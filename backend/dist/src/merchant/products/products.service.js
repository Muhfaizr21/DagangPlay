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
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProducts(merchantId, search, categoryId) {
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
                        merchantPrices: {
                            where: { merchantId }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        return products.map(product => {
            const mappedSkus = product.skus.map(sku => {
                const merchantPriceDetails = sku.merchantPrices.length > 0 ? sku.merchantPrices[0] : null;
                const finalPrice = merchantPriceDetails ? Number(merchantPriceDetails.sellingPrice) : Number(sku.sellingPrice);
                const isActive = merchantPriceDetails ? merchantPriceDetails.isActive : true;
                const margin = finalPrice - Number(sku.basePrice);
                return {
                    id: sku.id,
                    name: sku.name,
                    basePrice: Number(sku.basePrice),
                    defaultSellingPrice: Number(sku.sellingPrice),
                    merchantSellingPrice: finalPrice,
                    margin: margin,
                    isActive: isActive,
                    hasOverride: !!merchantPriceDetails,
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
    async updateSkuPriceOverrides(merchantId, userId, skuId, sellingPrice, isActive) {
        const sku = await this.prisma.productSku.findUnique({ where: { id: skuId } });
        if (!sku) {
            throw new common_1.NotFoundException('SKU tidak ditemukan');
        }
        return this.prisma.merchantProductPrice.upsert({
            where: {
                merchantId_productSkuId: {
                    merchantId,
                    productSkuId: skuId
                }
            },
            update: {
                sellingPrice,
                isActive,
                userId
            },
            create: {
                merchantId,
                productSkuId: skuId,
                sellingPrice,
                isActive,
                userId
            }
        });
    }
    async bulkUpdateMargin(merchantId, userId, markupPercentage, categoryId) {
        const productWhere = { status: 'ACTIVE' };
        if (categoryId) {
            productWhere.categoryId = categoryId;
        }
        const products = await this.prisma.product.findMany({
            where: productWhere,
            include: { skus: { where: { status: 'ACTIVE' } } }
        });
        const skus = products.flatMap(p => p.skus);
        const operations = skus.map(sku => {
            const defaultPrice = Number(sku.sellingPrice);
            const newPrice = defaultPrice + (defaultPrice * (markupPercentage / 100));
            return this.prisma.merchantProductPrice.upsert({
                where: { merchantId_productSkuId: { merchantId, productSkuId: sku.id } },
                update: { sellingPrice: newPrice, userId },
                create: {
                    merchantId,
                    productSkuId: sku.id,
                    sellingPrice: newPrice,
                    isActive: true,
                    userId
                }
            });
        });
        await this.prisma.$transaction(operations);
        return { success: true, count: operations.length };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map