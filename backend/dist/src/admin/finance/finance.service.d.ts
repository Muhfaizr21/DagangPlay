import { PrismaService } from '../../prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getDeposits(filters: any): Promise<({
        merchant: {
            id: string;
            name: string;
            domain: string | null;
        };
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        confirmedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.DepositStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        userId: string;
        expiredAt: Date | null;
        note: string | null;
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
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        note: string | null;
        processedAt: Date | null;
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
    processWithdrawal(id: string, operatorId: string, note?: string, receiptImage?: string): Promise<any>;
    rejectWithdrawal(id: string, reason: string, operatorId: string): Promise<any>;
    private summaryCache;
    getFinanceSummary(): Promise<any>;
}
