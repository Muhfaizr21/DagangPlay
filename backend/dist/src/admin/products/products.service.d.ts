import { PrismaService } from '../../prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCategories(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        icon: string | null;
        image: string | null;
        sortOrder: number;
        isActive: boolean;
        parentId: string | null;
    })[]>;
    getProducts(): Promise<({
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            icon: string | null;
            image: string | null;
            sortOrder: number;
            isActive: boolean;
            parentId: string | null;
        };
        skus: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SkuStatus;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            supplierId: string;
            supplierCode: string;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            sellingPrice: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    } & {
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        sortOrder: number;
        categoryId: string;
        thumbnail: string | null;
        banner: string | null;
        gameId: string | null;
        instruction: string | null;
        isFeatured: boolean;
        isPopular: boolean;
    })[]>;
    syncDigiflazzProducts(): Promise<{
        success: boolean;
        message: string;
        newCount: number;
        updatedCount: number;
    }>;
}
