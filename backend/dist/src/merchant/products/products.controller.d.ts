import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma.service';
export declare class ProductsController {
    private readonly productsService;
    private prisma;
    constructor(productsService: ProductsService, prisma: PrismaService);
    getProducts(req: any, search?: string, categoryId?: string): Promise<{
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
    updateSkuPrice(req: any, skuId: string, body: {
        sellingPrice: number;
        isActive: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        isActive: boolean;
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        customPrice: number;
        reason: string | null;
        customModalPrice: number | null;
    }>;
    bulkUpdatePricing(req: any, body: {
        markupPercentage: number;
        markupAmount?: number;
        categoryId?: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
    updateProductMetadata(req: any, productId: string, body: {
        customName?: string;
        customThumbnail?: string;
        description?: string;
    }): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        productId: string;
        customName: string | null;
        customThumbnail: string | null;
    }>;
}
