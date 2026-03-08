import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getSummary(): Promise<{
        totalDepositIn: number;
        totalWithdrawalOut: number;
        wdFeesCollected: number;
        grossSales: number;
        netMarginProfit: number;
        todaySales: number;
        saasRevenue: number;
    }>;
    getDeposits(status?: string, search?: string): Promise<({
        user: {
            id: string;
            email: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        merchant: {
            id: string;
            name: string;
            domain: string | null;
        };
        confirmedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.DepositStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        note: string | null;
        userId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        amount: import("@prisma/client-runtime-utils").Decimal;
        provider: import("@prisma/client").$Enums.PaymentProvider;
        paymentId: string | null;
        confirmedById: string | null;
        confirmedAt: Date | null;
        rejectedAt: Date | null;
        receipt: string | null;
    })[]>;
    confirmDeposit(id: string): Promise<any>;
    rejectDeposit(id: string, reason: string): Promise<any>;
    getWithdrawals(status?: string): Promise<({
        user: {
            id: string;
            email: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        processedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        createdAt: Date;
        updatedAt: Date;
        note: string | null;
        processedAt: Date | null;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        fee: import("@prisma/client-runtime-utils").Decimal;
        rejectedAt: Date | null;
        netAmount: import("@prisma/client-runtime-utils").Decimal;
        bankName: string;
        bankAccountNumber: string;
        bankAccountName: string;
        processedById: string | null;
        receiptImage: string | null;
    })[]>;
    processWithdrawal(id: string): Promise<any>;
    rejectWithdrawal(id: string, reason: string): Promise<any>;
}
