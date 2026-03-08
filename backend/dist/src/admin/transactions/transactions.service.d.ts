import { PrismaService } from '../../prisma.service';
import { OrderPaymentStatus, OrderFulfillmentStatus } from '@prisma/client';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllTransactions(filters: any): Promise<({
        merchant: {
            id: string;
            name: string;
        };
        customer: {
            id: string;
            email: string | null;
            name: string;
        };
        reseller: {
            id: string;
            name: string;
        } | null;
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            merchantId: string;
            createdAt: Date;
            updatedAt: Date;
            paidAt: Date | null;
            expiredAt: Date | null;
            userId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            orderId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            fee: import("@prisma/client-runtime-utils").Decimal;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            providerTransactionId: string | null;
            providerResponse: import("@prisma/client/runtime/client").JsonValue | null;
            snapToken: string | null;
            paymentUrl: string | null;
        } | null;
    } & {
        id: string;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        supplierId: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        orderNumber: string;
        productName: string;
        productSkuName: string;
        gameUserId: string | null;
        gameUserServerId: string | null;
        gameUserName: string | null;
        quantity: number;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
        fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
        supplierRefId: string | null;
        supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
        serialNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        note: string | null;
        failReason: string | null;
        paidAt: Date | null;
        processedAt: Date | null;
        completedAt: Date | null;
        failedAt: Date | null;
        expiredAt: Date | null;
        userId: string;
        resellerId: string | null;
        productSkuId: string;
        promoCodeId: string | null;
    })[]>;
    getTransactionDetail(id: string): Promise<{
        fraudDetections: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/client").JsonValue;
            userId: string;
            reason: string;
            orderId: string | null;
            riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
            isResolved: boolean;
            resolvedBy: string | null;
            resolvedAt: Date | null;
        }[];
        merchant: {
            id: string;
            name: string;
        };
        customer: {
            id: string;
            email: string | null;
            name: string;
        };
        reseller: {
            id: string;
            name: string;
        } | null;
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            merchantId: string;
            createdAt: Date;
            updatedAt: Date;
            paidAt: Date | null;
            expiredAt: Date | null;
            userId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            orderId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            provider: import("@prisma/client").$Enums.PaymentProvider;
            fee: import("@prisma/client-runtime-utils").Decimal;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            providerTransactionId: string | null;
            providerResponse: import("@prisma/client/runtime/client").JsonValue | null;
            snapToken: string | null;
            paymentUrl: string | null;
        } | null;
        statusHistories: {
            id: string;
            status: string;
            createdAt: Date;
            note: string | null;
            orderId: string;
            changedBy: string | null;
        }[];
        supplierLogs: {
            id: string;
            createdAt: Date;
            supplierId: string;
            method: string;
            endpoint: string | null;
            requestBody: import("@prisma/client/runtime/client").JsonValue | null;
            responseBody: import("@prisma/client/runtime/client").JsonValue | null;
            httpStatus: number | null;
            duration: number | null;
            isSuccess: boolean;
            orderId: string | null;
        }[];
    } & {
        id: string;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        supplierId: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        sellingPrice: import("@prisma/client-runtime-utils").Decimal;
        orderNumber: string;
        productName: string;
        productSkuName: string;
        gameUserId: string | null;
        gameUserServerId: string | null;
        gameUserName: string | null;
        quantity: number;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import("@prisma/client").$Enums.OrderPaymentStatus;
        fulfillmentStatus: import("@prisma/client").$Enums.OrderFulfillmentStatus;
        supplierRefId: string | null;
        supplierResponse: import("@prisma/client/runtime/client").JsonValue | null;
        serialNumber: string | null;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        note: string | null;
        failReason: string | null;
        paidAt: Date | null;
        processedAt: Date | null;
        completedAt: Date | null;
        failedAt: Date | null;
        expiredAt: Date | null;
        userId: string;
        resellerId: string | null;
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
