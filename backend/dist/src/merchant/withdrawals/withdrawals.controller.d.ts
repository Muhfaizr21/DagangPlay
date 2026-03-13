import { WithdrawalsService } from './withdrawals.service';
export declare class WithdrawalsController {
    private readonly withdrawalsService;
    constructor(withdrawalsService: WithdrawalsService);
    requestWithdrawal(req: any, dto: any): Promise<any>;
    getHistory(req: any): Promise<{
        id: string;
        userId: string;
        amount: number;
        fee: number;
        netAmount: number;
        bankName: string;
        bankAccountNumber: string;
        bankAccountName: string;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        processedById: string | null;
        processedAt: Date | null;
        rejectedAt: Date | null;
        note: string | null;
        receiptImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    approve(id: string, req: any, body: any): Promise<{
        id: string;
        userId: string;
        amount: number;
        fee: number;
        netAmount: number;
        bankName: string;
        bankAccountNumber: string;
        bankAccountName: string;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
        processedById: string | null;
        processedAt: Date | null;
        rejectedAt: Date | null;
        note: string | null;
        receiptImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reject(id: string, req: any, body: any): Promise<any>;
}
