import { PrismaService } from '../../prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCategories(): Promise<{
        totalSkus: number;
        _count: {
            products: number;
        };
        products: {
            _count: {
                skus: number;
            };
        }[];
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
        digiflazzCategory: string | null;
    }[]>;
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
            digiflazzCategory: string | null;
        };
        skus: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SkuStatus;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            productId: string;
            supplierId: string;
            supplierCode: string;
            backupSupplierId: string | null;
            backupSupplierCode: string | null;
            basePrice: number;
            priceNormal: number;
            pricePro: number;
            priceLegend: number;
            priceSupreme: number;
            marginNormal: number;
            marginPro: number;
            marginLegend: number;
            marginSupreme: number;
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
        digiflazzCategory: string | null;
        categoryId: string;
        thumbnail: string | null;
        banner: string | null;
        gameIdLabel: string | null;
        gameServerId: boolean;
        serverLabel: string | null;
        digiflazzBrand: string | null;
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
    getAllSkusPricing(): Promise<({
        product: {
            name: string;
            category: {
                name: string;
            };
        };
    } & {
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.SkuStatus;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        productId: string;
        supplierId: string;
        supplierCode: string;
        backupSupplierId: string | null;
        backupSupplierCode: string | null;
        basePrice: number;
        priceNormal: number;
        pricePro: number;
        priceLegend: number;
        priceSupreme: number;
        marginNormal: number;
        marginPro: number;
        marginLegend: number;
        marginSupreme: number;
        stock: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    updateSkuPrice(id: string, prices: any): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.SkuStatus;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        productId: string;
        supplierId: string;
        supplierCode: string;
        backupSupplierId: string | null;
        backupSupplierCode: string | null;
        basePrice: number;
        priceNormal: number;
        pricePro: number;
        priceLegend: number;
        priceSupreme: number;
        marginNormal: number;
        marginPro: number;
        marginLegend: number;
        marginSupreme: number;
        stock: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    applyCategoryFormula(categoryId: string, margins: any): Promise<{
        success: boolean;
        count: number;
    }>;
}
