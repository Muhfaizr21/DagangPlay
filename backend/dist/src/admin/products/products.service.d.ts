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
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        image: string | null;
        sortOrder: number;
        isActive: boolean;
        icon: string | null;
        parentId: string | null;
        digiflazzCategory: string | null;
    }[]>;
    updateCategoryImage(name: string, imageUrl: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getProducts(): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            image: string | null;
            sortOrder: number;
            isActive: boolean;
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
    updateSkuStatus(id: string, status: string): Promise<{
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
    private resolveMerchant;
    getPublicCategories(merchantSlug?: string, domain?: string): Promise<any[]>;
    getPublicCategoryBySlug(slug: string, merchantSlug?: string, domain?: string): Promise<{
        name: string;
        slug: string;
        products: any;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        image: string | null;
        sortOrder: number;
        isActive: boolean;
        icon: string | null;
        parentId: string | null;
        digiflazzCategory: string | null;
    } | null>;
    getPublicContent(merchantSlug?: string, domain?: string): Promise<{
        banners: never[];
        announcements: never[];
        popupPromos?: undefined;
    } | {
        banners: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string | null;
            title: string;
            image: string;
            linkUrl: string | null;
            position: import("@prisma/client").$Enums.BannerPosition;
            sortOrder: number;
            startDate: Date | null;
            endDate: Date | null;
            isActive: boolean;
            clickCount: number;
        }[];
        announcements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string | null;
            title: string;
            startDate: Date | null;
            endDate: Date | null;
            isActive: boolean;
            content: string;
            imageUrl: string | null;
        }[];
        popupPromos: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string | null;
            title: string;
            image: string | null;
            linkUrl: string | null;
            startDate: Date | null;
            endDate: Date | null;
            isActive: boolean;
            content: string | null;
        }[];
    }>;
    getPublicResellerPrices(merchantSlug?: string, domain?: string): Promise<{
        name: string;
        normal: number;
        pro: number;
        legend: number;
        supreme: number;
        img: string;
    }[]>;
    getPublicFullCatalog(merchantSlug?: string, domain?: string): Promise<any>;
}
