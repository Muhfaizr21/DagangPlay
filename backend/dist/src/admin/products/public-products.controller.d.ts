import { ProductsService } from './products.service';
export declare class PublicProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getCategories(merchantSlug?: string): Promise<any[]>;
    getCategoryBySlug(slug: string, merchantSlug?: string): Promise<{
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
    getContent(merchantSlug?: string): Promise<{
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
    getResellerPrices(merchantSlug?: string): Promise<{
        name: string;
        normal: number;
        pro: number;
        legend: number;
        supreme: number;
        img: string;
    }[]>;
    getFullCatalog(merchantSlug?: string): Promise<{
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
