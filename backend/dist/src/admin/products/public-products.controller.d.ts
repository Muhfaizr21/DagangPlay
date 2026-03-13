import { ProductsService } from './products.service';
export declare class PublicProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getCategories(merchantSlug?: string, domain?: string): Promise<any[]>;
    getCategoryBySlug(slug: string, merchantSlug?: string, domain?: string): Promise<{
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
    getContent(merchantSlug?: string, domain?: string): Promise<{
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
    getResellerPrices(merchantSlug?: string, domain?: string): Promise<{
        name: string;
        normal: number;
        pro: number;
        legend: number;
        supreme: number;
        img: string;
    }[]>;
    getFullCatalog(merchantSlug?: string, domain?: string): Promise<any>;
}
