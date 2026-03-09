import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma.service';
export declare class ProductsController {
    private readonly productsService;
    private prisma;
    constructor(productsService: ProductsService, prisma: PrismaService);
    getProducts(req: any, search?: string, categoryId?: string): Promise<{
        id: string;
        name: string;
        category: any;
        thumbnail: string | null;
        skus: any;
    }[]>;
    updateSkuPrice(req: any, skuId: string, body: {
        sellingPrice: number;
        isActive: boolean;
    }): Promise<{
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
    bulkUpdatePricing(req: any, body: {
        markupPercentage: number;
        categoryId?: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
