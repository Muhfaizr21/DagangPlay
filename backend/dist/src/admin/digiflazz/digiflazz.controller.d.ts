import { DigiflazzService } from './digiflazz.service';
export declare class DigiflazzController {
    private readonly digiflazzService;
    constructor(digiflazzService: DigiflazzService);
    getProductsList(): Promise<{
        buyer_sku_code: any;
        product_name: any;
        category: any;
        brand: any;
        type: any;
        seller_name: any;
        price: any;
        buyer_product_status: any;
        seller_product_status: any;
        is_mapped: boolean;
        local_info: {
            id: any;
            productId: any;
            productName: any;
            categoryId: any;
            categoryName: any;
            sellingPrice: any;
            status: any;
        } | null;
    }[]>;
    syncProduct(dto: any): Promise<{
        success: boolean;
        message: string;
        sku: any;
    }>;
    bulkSyncProducts(payload: any[]): Promise<{
        success: boolean;
        message: string;
    }>;
}
