import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma.service';
export declare class OrdersController {
    private readonly ordersService;
    private prisma;
    constructor(ordersService: OrdersService, prisma: PrismaService);
    createDirectOrder(req: any, body: any): Promise<any>;
    getOrders(req: any, filters: any): Promise<{
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
    getOrderDetails(req: any, orderId: string): Promise<{
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
    retryOrder(req: any, orderId: string): Promise<{
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
        } | null;
    }>;
    refundOrder(req: any, orderId: string, reason: string): Promise<any>;
}
