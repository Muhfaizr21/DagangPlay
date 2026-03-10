import { PrismaService } from '../../prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    updateCategoryImage(name: string, imageUrl: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
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
    syncDigiflazzProducts(): Promise<{
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
    updateSkuPrice(id: string, prices: any): Promise<{
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
    applyCategoryFormula(categoryId: string, margins: any): Promise<{
        success: boolean;
        count: number;
    }>;
    updateSkuStatus(id: string, status: string): Promise<{
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
    getPublicCategories(merchantSlug?: string): Promise<any[]>;
    getPublicCategoryBySlug(slug: string, merchantSlug?: string): Promise<{
        name: string;
        slug: string;
        products: {
            skus: {
                priceNormal: number | undefined;
                id: string;
                name: string;
                status: import("@prisma/client").$Enums.SkuStatus;
            }[];
            id: string;
            name: string;
            gameIdLabel: string | null;
            gameServerId: boolean;
            serverLabel: string | null;
        }[];
        id: string;
        image: string | null;
    } | null>;
    getPublicContent(merchantSlug?: string): Promise<{
        banners: {
            id: string;
            image: string;
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string | null;
            title: string;
            linkUrl: string | null;
            position: import("@prisma/client").$Enums.BannerPosition;
            startDate: Date | null;
            endDate: Date | null;
            clickCount: number;
        }[];
        announcements: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string | null;
            title: string;
            startDate: Date | null;
            endDate: Date | null;
            content: string;
            imageUrl: string | null;
        }[];
    }>;
    getPublicResellerPrices(merchantSlug?: string): Promise<{
        name: string;
        normal: number;
        pro: number;
        legend: number;
        supreme: number;
        img: string;
    }[]>;
    getPublicFullCatalog(merchantSlug?: string): Promise<{
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        image: string | null;
        products: {
            id: string;
            name: string;
            slug: string;
            image: string | null;
            skus: {
                id: string;
                name: string;
                normal: number;
                pro: number;
                legend: number;
                supreme: number;
            }[];
        }[];
    }[]>;
}
