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
        icon: string | null;
        image: string | null;
        description: string | null;
        sortOrder: number;
        isActive: boolean;
        parentId: string | null;
        digiflazzCategory: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getContent(merchantSlug?: string, domain?: string): Promise<{
        banners: never[];
        announcements: never[];
        popupPromos?: undefined;
    } | {
        banners: any;
        announcements: any;
        popupPromos: any;
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
