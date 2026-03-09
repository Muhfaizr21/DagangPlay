import { PrismaService } from '../../prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getDeposits(filters: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DepositStatus;
        merchantId: string;
        note: string | null;
        expiredAt: Date | null;
        userId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        amount: number;
        tripayReference: string | null;
        tripayMerchantRef: string | null;
        tripayPaymentUrl: string | null;
        tripayQrUrl: string | null;
        tripayVaNumber: string | null;
        tripayResponse: import("@prisma/client/runtime/client").JsonValue | null;
        receiptImage: string | null;
        confirmedById: string | null;
        confirmedAt: Date | null;
        rejectedAt: Date | null;
    })[]>;
    confirmDeposit(id: string, operatorId: string): Promise<any>;
    rejectDeposit(id: string, reason: string, operatorId: string): Promise<any>;
    getWithdrawals(filters: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        processedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        note: string | null;
        processedAt: Date | null;
        userId: string;
        amount: number;
        fee: number;
        receiptImage: string | null;
        rejectedAt: Date | null;
        netAmount: number;
        bankName: string;
        bankAccountNumber: string;
        bankAccountName: string;
        processedById: string | null;
    })[]>;
    processWithdrawal(id: string, operatorId: string): Promise<any>;
    rejectWithdrawal(id: string, reason: string, operatorId: string): Promise<any>;
    getFinanceSummary(): Promise<{
        totalDepositIn: number;
        totalWithdrawalOut: number;
        wdFeesCollected: number;
        grossSales: number;
        netMarginProfit: number;
        todaySales: number;
        saasRevenue: number;
    }>;
}
