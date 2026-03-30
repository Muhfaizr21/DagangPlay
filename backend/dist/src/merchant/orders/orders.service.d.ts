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
                name: string;
                email: string | null;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            productSkuId: string;
            userId: string;
            expiredAt: Date | null;
            productId: string;
            supplierId: string | null;
            basePrice: number;
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
            whatsapp: string | null;
            promoCodeId: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        productSkuId: string;
        userId: string;
        expiredAt: Date | null;
        productId: string;
        supplierId: string | null;
        basePrice: number;
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
        whatsapp: string | null;
        promoCodeId: string | null;
    }>;
    retryOrder(merchantId: string, orderId: string): Promise<{
        message: string;
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            productSkuId: string;
            userId: string;
            expiredAt: Date | null;
            productId: string;
            supplierId: string | null;
            basePrice: number;
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
            whatsapp: string | null;
            promoCodeId: string | null;
        } | null;
    }>;
    refundOrder(merchantId: string, orderId: string, reason: string): Promise<any>;
}
