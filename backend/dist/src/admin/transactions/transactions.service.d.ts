import { PrismaService } from '../../prisma.service';
import { OrderPaymentStatus, OrderFulfillmentStatus } from '@prisma/client';
import { PublicOrdersService } from '../../public/orders/public-orders.service';
export declare class TransactionsService {
    private prisma;
    private publicOrders;
    constructor(prisma: PrismaService, publicOrders: PublicOrdersService);
    getAllTransactions(filters: any): Promise<import("../../common/utils/pagination").PaginatedResult<unknown>>;
    getTransactionDetail(id: string): Promise<{
        merchant: {
            id: string;
            name: string;
        };
        fraudDetections: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            userId: string;
            orderId: string | null;
            reason: string;
            riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
            isResolved: boolean;
            resolvedBy: string | null;
            resolvedAt: Date | null;
        }[];
        user: {
            id: string;
            name: string;
            email: string | null;
        };
        supplierLogs: {
            id: string;
            createdAt: Date;
            supplierId: string;
            method: string;
            orderId: string | null;
            endpoint: string;
            requestBody: import("@prisma/client/runtime/client").JsonValue | null;
            responseBody: import("@prisma/client/runtime/client").JsonValue | null;
            httpStatus: number | null;
            duration: number | null;
            isSuccess: boolean;
        }[];
        statusHistories: {
            id: string;
            status: string;
            createdAt: Date;
            note: string | null;
            orderId: string;
            changedBy: string;
        }[];
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            paidAt: Date | null;
            expiredAt: Date | null;
            userId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: number;
            fee: number;
            totalAmount: number;
            tripayReference: string | null;
            tripayMerchantRef: string | null;
            tripayPaymentUrl: string | null;
            tripayQrUrl: string | null;
            tripayVaNumber: string | null;
            tripayExpiredTime: Date | null;
            tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
            orderId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
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
        merchantModalPrice: number | null;
        userId: string;
        productSkuId: string;
        promoCodeId: string | null;
    }>;
    retryTransaction(id: string, operatorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refundTransaction(id: string, operatorId: string): Promise<any>;
    markAsFraud(id: string, reason: string, operatorId: string): Promise<any>;
    overrideStatus(id: string, fulfillmentStatus: OrderFulfillmentStatus, paymentStatus: OrderPaymentStatus, reason: string, operatorId: string): Promise<any>;
}
