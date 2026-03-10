import { TransactionsService } from './transactions.service';
import { OrderPaymentStatus, OrderFulfillmentStatus } from '@prisma/client';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getAllTransactions(search?: string, paymentStatus?: string, fulfillmentStatus?: string, merchantId?: string, resellerId?: string, productId?: string, startDate?: string, endDate?: string): Promise<{
        data: ({
            merchant: {
                id: string;
                name: string;
            };
            user: {
                id: string;
                email: string | null;
                name: string;
            };
            payment: {
                id: string;
                paidAt: Date | null;
                expiredAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                merchantId: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                orderId: string;
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
            } | null;
        } & {
            id: string;
            orderNumber: string;
            productId: string;
            productName: string;
            productSkuName: string;
            priceTierUsed: import("@prisma/client").$Enums.PriceTier;
            basePrice: number;
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
            userId: string;
            merchantId: string;
            productSkuId: string;
            promoCodeId: string | null;
        })[];
        meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    getTransactionDetail(id: string): Promise<{
        fraudDetections: {
            id: string;
            createdAt: Date;
            userId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
        payment: {
            id: string;
            paidAt: Date | null;
            expiredAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            merchantId: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            orderId: string;
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
        } | null;
        supplierLogs: {
            id: string;
            supplierId: string;
            createdAt: Date;
            orderId: string | null;
            method: string;
            endpoint: string;
            requestBody: import("@prisma/client/runtime/client").JsonValue | null;
            responseBody: import("@prisma/client/runtime/client").JsonValue | null;
            httpStatus: number | null;
            duration: number | null;
            isSuccess: boolean;
        }[];
    } & {
        id: string;
        orderNumber: string;
        productId: string;
        productName: string;
        productSkuName: string;
        priceTierUsed: import("@prisma/client").$Enums.PriceTier;
        basePrice: number;
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
        userId: string;
        merchantId: string;
        productSkuId: string;
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
