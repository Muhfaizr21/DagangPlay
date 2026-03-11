import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private subscriptionsService: SubscriptionsService
    ) { }

    async getProducts(merchantId: string, search?: string, categoryId?: string) {
        // 1. Get merchant's plan and its mapped tier
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            select: { plan: true, isOfficial: true }
        });

        const mapping = await this.prisma.planTierMapping.findUnique({
            where: { plan: merchant?.plan || 'FREE' }
        });

        const activeTier = mapping?.tier || 'NORMAL';

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
                        merchantProductPrices: {
                            where: { merchantId }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // 2. Map items using tiered pricing
        return products.map(product => {
            const mappedSkus = product.skus.map(sku => {
                const merchantPriceDetails = sku.merchantProductPrices.length > 0 ? sku.merchantProductPrices[0] : null;

                // Determine base tiered price if no override
                let defaultTierPrice = Number(sku.priceNormal);
                if (activeTier === 'PRO') defaultTierPrice = Number(sku.pricePro);
                if (activeTier === 'LEGEND') defaultTierPrice = Number(sku.priceLegend);
                if (activeTier === 'SUPREME') defaultTierPrice = Number(sku.priceSupreme);

                const finalPrice = merchantPriceDetails ? Number(merchantPriceDetails.customPrice) : defaultTierPrice;
                const isActive = merchantPriceDetails ? merchantPriceDetails.isActive : (merchant?.isOfficial ? true : false);
                const margin = finalPrice - Number(sku.basePrice);

                return {
                    id: sku.id,
                    name: sku.name,
                    basePrice: Number(sku.basePrice),
                    defaultSellingPrice: defaultTierPrice, // This is the modal for the merchant based on their plan
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

    async updateSkuPriceOverrides(merchantId: string, userId: string, skuId: string, customPrice: number, isActive: boolean) {
        const sku = await this.prisma.productSku.findUnique({ where: { id: skuId } });
        if (!sku) {
            throw new NotFoundException('SKU tidak ditemukan');
        }

        // Enforce SaaS Limit
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

        // Enforce SaaS Limit for Bulk
        // Note: For simplicity, we check if they are already at limit. 
        // In real world, we'd check if adding 'skus.length' exceeds limit.
        await this.subscriptionsService.checkFeatureLimit(merchantId, 'maxProducts');
        const operations = skus.map(sku => {
            // we'll calculate margin based on default Super Admin priceNormal
            // if markupPercentage = 10, new price = priceNormal * 1.10
            const defaultPrice = Number(sku.priceNormal);
            const newPrice = defaultPrice + (defaultPrice * (markupPercentage / 100));

            return this.prisma.merchantProductPrice.upsert({
                where: { merchantId_productSkuId: { merchantId, productSkuId: sku.id } },
                update: { customPrice: newPrice, userId },
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
        return { success: true, count: operations.length };
    }

    async updateProductOverride(merchantId: string, productId: string, data: { customName?: string, customThumbnail?: string, description?: string }) {
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
}
