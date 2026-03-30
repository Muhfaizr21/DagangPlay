import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardSummary(): Promise<{
        stats: {
            label: string;
            value: string;
            change: string;
            isUp: boolean;
        }[];
        systemHealth: {
            supplierBalance: number;
            isLow: boolean;
            totalEscrow: number;
            totalSaasRevenue: number;
        };
        merchants: {
            top: {
                id: string;
                name: string;
                orders: number;
            }[];
            expiring: {
                id: string;
                name: string;
                contactWhatsapp: string | null;
                planExpiredAt: Date | null;
            }[];
        };
        disputes: {
            pending: ({
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
                };
            } & {
                id: string;
                status: import("@prisma/client").$Enums.DisputeStatus;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                reason: string;
                orderId: string;
                evidence: import("@prisma/client/runtime/client").JsonValue | null;
                resolution: string | null;
                resolvedBy: string | null;
                resolvedAt: Date | null;
            })[];
        };
        weeklyChart: {
            day: string;
            value: number;
        }[];
        recentTransactions: {
            id: string;
            game: string;
            amount: string;
            status: import("@prisma/client").$Enums.OrderFulfillmentStatus;
        }[];
    }>;
}
