import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        image: string | null;
        sortOrder: number;
        icon: string | null;
        parentId: string | null;
        digiflazzCategory: string | null;
    }[]>;
    updateCategoryImage(name: string, body: {
        imageUrl: string;
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getProducts(): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            image: string | null;
            sortOrder: number;
            icon: string | null;
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
        slug: string;
        description: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        banner: string | null;
        digiflazzCategory: string | null;
        categoryId: string;
        thumbnail: string | null;
        gameIdLabel: string | null;
        gameServerId: boolean;
        serverLabel: string | null;
        digiflazzBrand: string | null;
        instruction: string | null;
        isFeatured: boolean;
        isPopular: boolean;
    })[]>;
    syncDigiflazz(): Promise<{
        success: boolean;
        message: string;
        newCount: number;
        updatedCount: number;
    }>;
    getAllSkusPricing(): Promise<({
        product: {
            name: string;
            category: {
                id: string;
                name: string;
                image: string | null;
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
    updateSkuPrice(id: string, prices: {
        normal: number;
        pro: number;
        legend: number;
        supreme: number;
    }): Promise<{
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
    applyCategoryFormula(body: {
        categoryId: string;
        margins: {
            normal: number;
            pro: number;
            legend: number;
            supreme: number;
        };
    }): Promise<{
        success: boolean;
        count: number;
    }>;
    updateSkuStatus(id: string, body: {
        status: string;
    }): Promise<{
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
}
