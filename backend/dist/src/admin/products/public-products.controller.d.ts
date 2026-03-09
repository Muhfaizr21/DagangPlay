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
}
