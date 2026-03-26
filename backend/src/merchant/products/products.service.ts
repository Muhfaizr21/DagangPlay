import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
                const isActive = merchantPriceDetails ? merchantPriceDetails.isActive : true; // Default to true so they are visibly ON
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

        // Get Merchant's Tier Modal Price
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        const mapping = await this.prisma.planTierMapping.findUnique({ where: { plan: merchant?.plan || 'FREE' } });
        const activeTier = mapping?.tier || 'NORMAL';

        let merchantModalPrice = Number(sku.priceNormal);
        if (activeTier === 'PRO') merchantModalPrice = Number(sku.pricePro);
        if (activeTier === 'LEGEND') merchantModalPrice = Number(sku.priceLegend);
        if (activeTier === 'SUPREME') merchantModalPrice = Number(sku.priceSupreme);

        if (customPrice < merchantModalPrice) {
            throw new BadRequestException(`Harga jual (Rp ${customPrice.toLocaleString('id-ID')}) tidak boleh lebih rendah dari harga modal (Rp ${merchantModalPrice.toLocaleString('id-ID')}) untuk Plan ${merchant?.plan}.`);
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

    async bulkUpdateMargin(merchantId: string, userId: string, markupPercentage: number, markupAmount: number = 0, categoryId?: string) {
        if (markupPercentage < 0 || markupAmount < 0) {
            throw new BadRequestException('Margin markup tidak boleh negatif.');
        }

        // Get Merchant's Tier
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        const mapping = await this.prisma.planTierMapping.findUnique({ where: { plan: merchant?.plan || 'FREE' } });
        const activeTier = mapping?.tier || 'NORMAL';

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

        // Calculate only truly new additions to avoid instantly tripping limits
        const existingPrices = await this.prisma.merchantProductPrice.count({
            where: { merchantId, productSkuId: { in: skus.map(s => s.id) }, isActive: true }
        });
        const newAdditionsCount = skus.length - existingPrices;

        // Enforce SaaS Limit for Bulk
        await this.subscriptionsService.checkFeatureLimit(merchantId, 'maxProducts', newAdditionsCount > 0 ? newAdditionsCount : 0);
        
        const operations = skus.map(sku => {
            let defaultPrice = Number(sku.priceNormal);
            if (activeTier === 'PRO') defaultPrice = Number(sku.pricePro);
            if (activeTier === 'LEGEND') defaultPrice = Number(sku.priceLegend);
            if (activeTier === 'SUPREME') defaultPrice = Number(sku.priceSupreme);

            // Calculate new price: Modal + (Modal * %) + Fixed Amount
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

        // Audit Log
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
