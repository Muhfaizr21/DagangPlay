import { TransactionsService } from './transactions.service';
import { OrderPaymentStatus, OrderFulfillmentStatus } from '@prisma/client';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getAllTransactions(search?: string, paymentStatus?: string, fulfillmentStatus?: string, merchantId?: string, resellerId?: string, productId?: string, startDate?: string, endDate?: string): Promise<import("../../common/utils/pagination").PaginatedResult<unknown>>;
    getTransactionDetail(id: string): Promise<{
        merchant: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            name: string;
            email: string | null;
        };
        fraudDetections: {
            id: string;
            createdAt: Date;
            userId: string;
            reason: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            orderId: string | null;
            resolvedBy: string | null;
            resolvedAt: Date | null;
            riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
            isResolved: boolean;
        }[];
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
            userId: string;
            expiredAt: Date | null;
            paidAt: Date | null;
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
    retryTransaction(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refundTransaction(id: string): Promise<any>;
    markAsFraud(id: string, body: {
        reason: string;
    }): Promise<any>;
    overrideStatus(id: string, body: {
        fulfillmentStatus: OrderFulfillmentStatus;
        paymentStatus: OrderPaymentStatus;
        reason: string;
    }): Promise<any>;
}
