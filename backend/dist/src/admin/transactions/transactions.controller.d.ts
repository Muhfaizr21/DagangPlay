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
                name: string;
                email: string | null;
            };
            payment: {
                method: import("@prisma/client").$Enums.PaymentMethod;
                id: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                merchantId: string;
                expiredAt: Date | null;
                paidAt: Date | null;
                orderId: string;
                amount: number;
                tripayReference: string | null;
                tripayMerchantRef: string | null;
                tripayPaymentUrl: string | null;
                tripayVaNumber: string | null;
                tripayQrUrl: string | null;
                tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
                totalAmount: number;
                fee: number;
                tripayExpiredTime: Date | null;
            } | null;
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
        meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    getTransactionDetail(id: string): Promise<{
        supplierLogs: {
            method: string;
            id: string;
            supplierId: string;
            createdAt: Date;
            endpoint: string;
            requestBody: import("@prisma/client/runtime/client").JsonValue | null;
            responseBody: import("@prisma/client/runtime/client").JsonValue | null;
            httpStatus: number | null;
            duration: number | null;
            isSuccess: boolean;
            orderId: string | null;
        }[];
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
            reason: string;
            id: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            createdAt: Date;
            userId: string;
            orderId: string | null;
            riskLevel: import("@prisma/client").$Enums.FraudRiskLevel;
            isResolved: boolean;
            resolvedBy: string | null;
            resolvedAt: Date | null;
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
            method: import("@prisma/client").$Enums.PaymentMethod;
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            merchantId: string;
            expiredAt: Date | null;
            paidAt: Date | null;
            orderId: string;
            amount: number;
            tripayReference: string | null;
            tripayMerchantRef: string | null;
            tripayPaymentUrl: string | null;
            tripayVaNumber: string | null;
            tripayQrUrl: string | null;
            tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
            totalAmount: number;
            fee: number;
            tripayExpiredTime: Date | null;
        } | null;
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
