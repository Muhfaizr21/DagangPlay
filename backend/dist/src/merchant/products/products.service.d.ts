import { PrismaService } from '../../prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
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
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        reason: string | null;
        customPrice: number;
    }>;
    bulkUpdateMargin(merchantId: string, userId: string, markupPercentage: number, categoryId?: string): Promise<{
        success: boolean;
        count: number;
    }>;
}
