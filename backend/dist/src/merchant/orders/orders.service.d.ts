import { PrismaService } from '../../prisma.service';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
export declare class OrdersService {
    private prisma;
    private digiflazz;
    private subscriptionsService;
    constructor(prisma: PrismaService, digiflazz: DigiflazzService, subscriptionsService: SubscriptionsService);
    createDirectOrder(merchantId: string, userId: string, body: {
        skuId: string;
        gameId: string;
        serverId?: string;
        whatsapp: string;
    }): Promise<any>;
    getOrders(merchantId: string, filters: any): Promise<{
        orders: ({
            productSku: {
                name: string;
                product: {
                    name: string;
                    thumbnail: string | null;
                };
            };
            user: {
                id: string;
                name: string;
                email: string | null;
            };
        } & {
            id: string;
            productId: string;
            supplierId: string | null;
            basePrice: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            merchantId: string;
            productSkuId: string;
            expiredAt: Date | null;
            orderNumber: string;
            productName: string;
            productSkuName: string;
            priceTierUsed: import("@prisma/client").$Enums.PriceTier;
            sellingPrice: number;
            totalPrice: number;
            gameUserId: string;
            gameUserServerId: string | null;
            gameUserName: string | null;
            quantity: number;
            promoCodeId: string | null;
            discountAmount: number;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
            fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
            supplierRefId: string | null;
            supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
            serialNumber: string | null;
            note: string | null;
            failReason: string | null;
            paidAt: Date | null;
            processedAt: Date | null;
            completedAt: Date | null;
            failedAt: Date | null;
            merchantModalPrice: number | null;
        })[];
        stats: {
            totalCount: number;
            successRate: string | number;
        };
    }>;
    getOrderDetails(merchantId: string, orderId: string): Promise<{
        productSku: {
            name: string;
            product: {
                name: string;
                categoryId: string;
                thumbnail: string | null;
            };
        };
        user: {
            id: string;
            name: string;
            email: string | null;
        };
        statusHistories: {
            id: string;
            status: string;
            createdAt: Date;
            note: string | null;
            orderId: string;
            changedBy: string;
        }[];
    } & {
        id: string;
        productId: string;
        supplierId: string | null;
        basePrice: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        merchantId: string;
        productSkuId: string;
        expiredAt: Date | null;
        orderNumber: string;
        productName: string;
        productSkuName: string;
        priceTierUsed: import("@prisma/client").$Enums.PriceTier;
        sellingPrice: number;
        totalPrice: number;
        gameUserId: string;
        gameUserServerId: string | null;
        gameUserName: string | null;
        quantity: number;
        promoCodeId: string | null;
        discountAmount: number;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
        fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
        supplierRefId: string | null;
        supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
        serialNumber: string | null;
        note: string | null;
        failReason: string | null;
        paidAt: Date | null;
        processedAt: Date | null;
        completedAt: Date | null;
        failedAt: Date | null;
        merchantModalPrice: number | null;
    }>;
    retryOrder(merchantId: string, orderId: string): Promise<{
        message: string;
        order: {
            id: string;
            productId: string;
            supplierId: string | null;
            basePrice: number;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            merchantId: string;
            productSkuId: string;
            expiredAt: Date | null;
            orderNumber: string;
            productName: string;
            productSkuName: string;
            priceTierUsed: import("@prisma/client").$Enums.PriceTier;
            sellingPrice: number;
            totalPrice: number;
            gameUserId: string;
            gameUserServerId: string | null;
            gameUserName: string | null;
            quantity: number;
            promoCodeId: string | null;
            discountAmount: number;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
            fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
            supplierRefId: string | null;
            supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
            serialNumber: string | null;
            note: string | null;
            failReason: string | null;
            paidAt: Date | null;
            processedAt: Date | null;
            completedAt: Date | null;
            failedAt: Date | null;
            merchantModalPrice: number | null;
        };
    }>;
    refundOrder(merchantId: string, orderId: string, reason: string): Promise<any>;
}
