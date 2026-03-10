import { ProductsService } from './products.service';
export declare class PublicProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getCategories(): Promise<any[]>;
    getCategoryBySlug(slug: string): Promise<{
        name: string;
        slug: string;
        products: {
            id: string;
            name: string;
            gameIdLabel: string | null;
            gameServerId: boolean;
            serverLabel: string | null;
            skus: {
                id: string;
                name: string;
                status: import("@prisma/client").$Enums.SkuStatus;
                priceNormal: number;
            }[];
        }[];
        id: string;
        image: string | null;
    } | null>;
    getContent(): Promise<{
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
    getResellerPrices(): Promise<{
        name: string;
        normal: number;
        pro: number;
        legend: number;
        supreme: number;
        img: string;
    }[]>;
    getFullCatalog(): Promise<{
        id: string;
        name: string;
        icon: string | null;
        image: string | null;
        products: {
            id: string;
            name: string;
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
