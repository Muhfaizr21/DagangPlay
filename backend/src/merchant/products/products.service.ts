import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async getProducts(merchantId: string, search?: string, categoryId?: string) {
        const whereClause: any = {
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

        // Map to make it easier for frontend
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

    async updateSkuPriceOverrides(merchantId: string, userId: string, skuId: string, sellingPrice: number, isActive: boolean) {
        const sku = await this.prisma.productSku.findUnique({ where: { id: skuId } });
        if (!sku) {
            throw new NotFoundException('SKU tidak ditemukan');
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

    async bulkUpdateMargin(merchantId: string, userId: string, markupPercentage: number, categoryId?: string) {
        // 1. Find all active SKUs for the merchant (optionally filtered by category)
        const productWhere: any = { status: 'ACTIVE' };
        if (categoryId) {
            productWhere.categoryId = categoryId;
        }

        const products = await this.prisma.product.findMany({
            where: productWhere,
            include: { skus: { where: { status: 'ACTIVE' } } }
        });

        const skus = products.flatMap(p => p.skus);

        // 2. Upsert each SKU price to base + percentage
        const operations = skus.map(sku => {
            // we'll calculate margin based on default Super Admin sellingPrice
            // if markupPercentage = 10, new price = defaultSellingPrice * 1.10
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
}
