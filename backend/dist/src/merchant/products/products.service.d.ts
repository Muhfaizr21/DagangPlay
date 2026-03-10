import { PrismaService } from '../../prisma.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
export declare class ProductsService {
    private prisma;
    private subscriptionsService;
    constructor(prisma: PrismaService, subscriptionsService: SubscriptionsService);
    getProducts(merchantId: string, search?: string, categoryId?: string): Promise<{
        id: string;
        name: string;
        category: string;
        thumbnail: string | null;
        skus: {
            id: string;
            name: string;
            basePrice: number;
            defaultSellingPrice: number;
            merchantSellingPrice: number;
            margin: number;
            isActive: boolean;
            hasOverride: boolean;
            tier: import("@prisma/client").$Enums.PriceTier;
        }[];
    }[]>;
    updateSkuPriceOverrides(merchantId: string, userId: string, skuId: string, customPrice: number, isActive: boolean): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    }>;
    bulkUpdateMargin(merchantId: string, userId: string, markupPercentage: number, categoryId?: string): Promise<{
        success: boolean;
        count: number;
    }>;
}
