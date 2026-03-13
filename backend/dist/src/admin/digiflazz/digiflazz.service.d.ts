import { PrismaService } from '../../prisma.service';
export declare class DigiflazzService {
    private prisma;
    constructor(prisma: PrismaService);
    private getDigiflazzConfig;
    private priceListCache;
    private lastFetchTime;
    getDigiflazzProducts(): Promise<{
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
            priceNormal: any;
            status: any;
        } | null;
    }[]>;
    syncProduct(dto: {
        buyer_sku_code: string;
        product_name: string;
        brand: string;
        category_digiflazz: string;
        digiflazz_price: number;
        categoryId?: string;
        productId?: string;
        priceNormal: number;
        pricePro?: number;
        priceLegend?: number;
        priceSupreme?: number;
        status: string;
    }): Promise<{
        success: boolean;
        message: string;
        sku: any;
    }>;
    bulkSyncProducts(payload: any[]): Promise<{
        success: boolean;
        message: string;
    }>;
    checkOrderStatus(orderId: string, supplierRefId: string, buyerSkuCode: string, customerNo: string): Promise<any>;
    checkBalance(): Promise<number>;
    checkAvailability(skuCode: string): Promise<{
        isAvailable: boolean;
        reason: any;
        item?: undefined;
    } | {
        isAvailable: boolean;
        item: {
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
                priceNormal: any;
                status: any;
            } | null;
        };
        reason?: undefined;
    }>;
    placeOrder(orderId: string): Promise<any>;
    handleCommissionReversal(orderId: string): Promise<void>;
    handleCustomerRefund(orderId: string): Promise<void>;
    processPriceWebhook(payload: any): Promise<void>;
    verifyWebhookSignature(signature: string, event: string, refId?: string): boolean;
    processTransactionWebhook(data: any): Promise<void>;
    private maskSensitiveData;
}
