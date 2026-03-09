import { PrismaService } from '../../prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    getProducts(merchantId: string, search?: string, categoryId?: string): Promise<{
        id: string;
        name: string;
        category: any;
        thumbnail: string | null;
        skus: any;
    }[]>;
    updateSkuPriceOverrides(merchantId: string, userId: string, skuId: string, sellingPrice: number, isActive: boolean): Promise<{
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
