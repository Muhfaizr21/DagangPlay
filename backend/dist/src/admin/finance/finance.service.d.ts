import { PrismaService } from '../../prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getDeposits(filters: any): Promise<({
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
        expiredAt: Date | null;
        userId: string;
        method: import("@prisma/client").$Enums.PaymentMethod;
        amount: number;
        tripayReference: string | null;
        tripayMerchantRef: string | null;
        tripayPaymentUrl: string | null;
        tripayVaNumber: string | null;
        tripayQrUrl: string | null;
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
        amount: number;
        receiptImage: string | null;
        rejectedAt: Date | null;
        fee: number;
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
