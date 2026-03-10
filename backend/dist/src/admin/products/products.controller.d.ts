import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getCategories(): Promise<{
        totalSkus: number;
        products: {
            _count: {
                skus: number;
            };
        }[];
        _count: {
            products: number;
        };
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        image: string | null;
        description: string | null;
        sortOrder: number;
        isActive: boolean;
        parentId: string | null;
        digiflazzCategory: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateCategoryImage(name: string, body: {
        imageUrl: string;
    }): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getProducts(): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
            image: string | null;
            description: string | null;
            sortOrder: number;
            isActive: boolean;
            parentId: string | null;
            digiflazzCategory: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        skus: {
            id: string;
            name: string;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
            basePrice: number;
            productId: string;
            supplierId: string;
            supplierCode: string;
            backupSupplierId: string | null;
            backupSupplierCode: string | null;
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
        sortOrder: number;
        digiflazzCategory: string | null;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
        thumbnail: string | null;
        banner: string | null;
        gameIdLabel: string | null;
        gameServerId: boolean;
        serverLabel: string | null;
        digiflazzBrand: string | null;
        instruction: string | null;
        status: import("@prisma/client").$Enums.ProductStatus;
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
            category: {
                id: string;
                name: string;
                image: string | null;
            };
            name: string;
        };
    } & {
        id: string;
        name: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        basePrice: number;
        productId: string;
        supplierId: string;
        supplierCode: string;
        backupSupplierId: string | null;
        backupSupplierCode: string | null;
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
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        basePrice: number;
        productId: string;
        supplierId: string;
        supplierCode: string;
        backupSupplierId: string | null;
        backupSupplierCode: string | null;
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
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        basePrice: number;
        productId: string;
        supplierId: string;
        supplierCode: string;
        backupSupplierId: string | null;
        backupSupplierCode: string | null;
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
