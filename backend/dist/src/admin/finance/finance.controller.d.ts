import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getSummary(): Promise<any>;
    getDeposits(status?: string, search?: string): Promise<({
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
    confirmDeposit(id: string, req: any): Promise<any>;
    rejectDeposit(id: string, reason: string, req: any): Promise<any>;
    getWithdrawals(status?: string): Promise<({
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
    processWithdrawal(id: string, body: {
        note?: string;
        receiptImage?: string;
    }, req: any): Promise<any>;
    rejectWithdrawal(id: string, reason: string, req: any): Promise<any>;
}
