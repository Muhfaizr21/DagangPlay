import { PrismaService } from '../../prisma.service';
export declare class WithdrawalsService {
    private prisma;
    constructor(prisma: PrismaService);
    requestWithdrawal(userId: string, dto: {
        amount: number;
        bankName: string;
        accountNumber: string;
        accountName: string;
    }): Promise<any>;
    getMerchantWithdrawals(userId: string): Promise<{
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
    approveWithdrawal(withdrawalId: string, adminId: string, receiptImage?: string): Promise<{
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
    rejectWithdrawal(withdrawalId: string, adminId: string, reason: string): Promise<any>;
}
