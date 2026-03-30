import { PrismaService } from '../../prisma.service';
import { Queue } from 'bullmq';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
export declare class OrdersService {
    private prisma;
    private fulfillmentQueue;
    private subscriptionsService;
    constructor(prisma: PrismaService, fulfillmentQueue: Queue, subscriptionsService: SubscriptionsService);
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
                email: string | null;
                phone: string | null;
                name: string;
            };
        } & {
            id: string;
            orderNumber: string;
            userId: string;
            merchantId: string;
            productId: string;
            productSkuId: string;
            productName: string;
            productSkuName: string;
            priceTierUsed: import("@prisma/client").$Enums.PriceTier;
            basePrice: number;
            sellingPrice: number;
            totalPrice: number;
            gameUserId: string;
            gameUserServerId: string | null;
            gameUserName: string | null;
            whatsapp: string | null;
            quantity: number;
            promoCodeId: string | null;
            discountAmount: number;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
            fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
            supplierId: string | null;
            supplierRefId: string | null;
            supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
            serialNumber: string | null;
            note: string | null;
            failReason: string | null;
            paidAt: Date | null;
            processedAt: Date | null;
            completedAt: Date | null;
            failedAt: Date | null;
            expiredAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
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
            email: string | null;
            name: string;
        };
        statusHistories: {
            id: string;
            note: string | null;
            createdAt: Date;
            status: string;
            orderId: string;
            changedBy: string;
        }[];
    } & {
        id: string;
        orderNumber: string;
        userId: string;
        merchantId: string;
        productId: string;
        productSkuId: string;
        productName: string;
        productSkuName: string;
        priceTierUsed: import("@prisma/client").$Enums.PriceTier;
        basePrice: number;
        sellingPrice: number;
        totalPrice: number;
        gameUserId: string;
        gameUserServerId: string | null;
        gameUserName: string | null;
        whatsapp: string | null;
        quantity: number;
        promoCodeId: string | null;
        discountAmount: number;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
        fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
        supplierId: string | null;
        supplierRefId: string | null;
        supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
        serialNumber: string | null;
        note: string | null;
        failReason: string | null;
        paidAt: Date | null;
        processedAt: Date | null;
        completedAt: Date | null;
        failedAt: Date | null;
        expiredAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        merchantModalPrice: number | null;
    }>;
    retryOrder(merchantId: string, orderId: string): Promise<{
        message: string;
        order: {
            id: string;
            orderNumber: string;
            userId: string;
            merchantId: string;
            productId: string;
            productSkuId: string;
            productName: string;
            productSkuName: string;
            priceTierUsed: import("@prisma/client").$Enums.PriceTier;
            basePrice: number;
            sellingPrice: number;
            totalPrice: number;
            gameUserId: string;
            gameUserServerId: string | null;
            gameUserName: string | null;
            whatsapp: string | null;
            quantity: number;
            promoCodeId: string | null;
            discountAmount: number;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
            fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
            supplierId: string | null;
            supplierRefId: string | null;
            supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
            serialNumber: string | null;
            note: string | null;
            failReason: string | null;
            paidAt: Date | null;
            processedAt: Date | null;
            completedAt: Date | null;
            failedAt: Date | null;
            expiredAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            merchantModalPrice: number | null;
        } | null;
    }>;
    refundOrder(merchantId: string, orderId: string, reason: string): Promise<any>;
}
