import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma.service';
export declare class OrdersController {
    private readonly ordersService;
    private prisma;
    constructor(ordersService: OrdersService, prisma: PrismaService);
    getOrders(req: any, filters: any): Promise<{
        orders: ({
            user: {
                id: string;
                email: string | null;
                name: string;
            };
            productSku: {
                name: string;
                product: {
                    name: string;
                    thumbnail: string | null;
                };
            };
        } & {
            id: string;
            merchantId: string;
            createdAt: Date;
            updatedAt: Date;
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
            expiredAt: Date | null;
            userId: string;
            productSkuId: string;
            promoCodeId: string | null;
        })[];
        stats: {
            totalCount: number;
            successRate: string | number;
        };
    }>;
    getOrderDetails(req: any, orderId: string): Promise<{
        user: {
            id: string;
            email: string | null;
            name: string;
        };
        productSku: {
            name: string;
            product: {
                name: string;
                categoryId: string;
                thumbnail: string | null;
            };
        };
        statusHistories: {
            id: string;
            status: string;
            createdAt: Date;
            note: string | null;
            changedBy: string;
            orderId: string;
        }[];
    } & {
        id: string;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
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
        expiredAt: Date | null;
        userId: string;
        productSkuId: string;
        promoCodeId: string | null;
    }>;
    retryOrder(req: any, orderId: string): Promise<{
        message: string;
        order: {
            id: string;
            merchantId: string;
            createdAt: Date;
            updatedAt: Date;
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
            expiredAt: Date | null;
            userId: string;
            productSkuId: string;
            promoCodeId: string | null;
        };
    }>;
    refundOrder(req: any, orderId: string, reason: string): Promise<any>;
}
