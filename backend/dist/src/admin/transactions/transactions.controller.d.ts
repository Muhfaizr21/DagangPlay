import { TransactionsService } from './transactions.service';
import { OrderPaymentStatus, OrderFulfillmentStatus } from '@prisma/client';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    getAllTransactions(search?: string, paymentStatus?: string, fulfillmentStatus?: string, merchantId?: string, resellerId?: string, productId?: string, startDate?: string, endDate?: string): Promise<{
        data: {
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
        }[];
        meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    getTransactionDetail(id: string): Promise<{
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
