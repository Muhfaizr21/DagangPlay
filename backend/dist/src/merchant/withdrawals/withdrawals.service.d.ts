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
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
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
    }[]>;
    approveWithdrawal(withdrawalId: string, adminId: string, receiptImage?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.WithdrawalStatus;
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
    }>;
    rejectWithdrawal(withdrawalId: string, adminId: string, reason: string): Promise<any>;
}
