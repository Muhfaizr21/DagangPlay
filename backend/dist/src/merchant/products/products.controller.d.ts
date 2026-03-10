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
    bulkUpdatePricing(req: any, body: {
        markupPercentage: number;
        categoryId?: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
