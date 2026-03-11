import { WithdrawalsService } from './withdrawals.service';
export declare class WithdrawalsController {
    private readonly withdrawalsService;
    constructor(withdrawalsService: WithdrawalsService);
    requestWithdrawal(req: any, dto: any): Promise<any>;
    getHistory(req: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        note: string | null;
        processedAt: Date | null;
        amount: number;
        receiptImage: string | null;
        rejectedAt: Date | null;
        fee: number;
        netAmount: number;
        bankName: string;
        bankAccountNumber: string;
        bankAccountName: string;
        processedById: string | null;
    }[]>;
    approve(id: string, req: any, body: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        note: string | null;
        processedAt: Date | null;
        amount: number;
        receiptImage: string | null;
        rejectedAt: Date | null;
        fee: number;
        netAmount: number;
        bankName: string;
        bankAccountNumber: string;
        bankAccountName: string;
        processedById: string | null;
    }>;
    reject(id: string, req: any, body: any): Promise<any>;
}
