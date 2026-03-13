import { PrismaService } from '../../prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getDeposits(filters: any): Promise<({
        confirmedBy: {
            id: string;
            name: string;
        } | null;
        merchant: {
            id: string;
            name: string;
            domain: string | null;
        };
        user: {
            id: string;
            email: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        userId: string;
        merchantId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        status: import("@prisma/client").$Enums.DepositStatus;
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
        note: string | null;
        expiredAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
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
        userId: string;
        amount: number;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        receiptImage: string | null;
        rejectedAt: Date | null;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
        fee: number;
        netAmount: number;
        bankName: string;
        bankAccountNumber: string;
        bankAccountName: string;
        processedById: string | null;
        processedAt: Date | null;
    })[]>;
    processWithdrawal(id: string, operatorId: string, note?: string, receiptImage?: string): Promise<any>;
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
