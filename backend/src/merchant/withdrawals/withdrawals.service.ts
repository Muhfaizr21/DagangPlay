import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WithdrawalStatus } from '@prisma/client';

@Injectable()
export class WithdrawalsService {
    constructor(private prisma: PrismaService) { }

    async requestWithdrawal(userId: string, dto: { amount: number; bankName: string; accountNumber: string; accountName: string }) {
        const { amount, bankName, accountNumber, accountName } = dto;

        if (amount < 10000) {
            throw new BadRequestException('Minimal penarikan adalah Rp 10.000');
        }

        // 2. Process Withdrawal (Immediate deduction)
        return this.prisma.$transaction(async (tx) => {
            // Atomic Balance Check and Deduction using updateMany to prevent double-spending
            const updateResult = await tx.user.updateMany({
                where: {
                    id: userId,
                    balance: { gte: amount }
                },
                data: { balance: { decrement: amount } }
            });

            if (updateResult.count === 0) {
                throw new BadRequestException('Saldo tidak cukup atau sedang dikunci (Gagal pada sistem).');
            }

            // Fetch the updated user for the balance_transaction record
            const updatedUser = await tx.user.findUnique({ where: { id: userId } });
            if (!updatedUser) throw new Error('User not found after deduction');

            // Create Withdrawal Request
            const withdrawal = await tx.withdrawal.create({
                data: {
                    userId,
                    amount,
                    netAmount: amount, // Potential fee logic here
                    bankName,
                    bankAccountNumber: accountNumber,
                    bankAccountName: accountName,
                    status: 'PENDING'
                }
            });

            // Log Balance Transaction
            await tx.balanceTransaction.create({
                data: {
                    userId,
                    type: 'WITHDRAWAL',
                    amount: -amount,
                    balanceBefore: updatedUser.balance + amount,
                    balanceAfter: updatedUser.balance,
                    withdrawalId: withdrawal.id,
                    description: `Penarikan saldo ke ${bankName} (${accountNumber})`
                }
            });

            return withdrawal;
        });
    }

    async getMerchantWithdrawals(userId: string) {
        return this.prisma.withdrawal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Admin part: Approve Withdrawal
    async approveWithdrawal(withdrawalId: string, adminId: string, receiptImage?: string) {
        const withdrawal = await this.prisma.withdrawal.findUnique({
            where: { id: withdrawalId }
        });

        if (!withdrawal || withdrawal.status !== 'PENDING') {
            throw new BadRequestException('Permintaan penarikan tidak ditemukan atau sudah diproses.');
        }

        return this.prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: {
                status: 'COMPLETED',
                processedById: adminId,
                processedAt: new Date(),
                receiptImage
            }
        });
    }

    async rejectWithdrawal(withdrawalId: string, adminId: string, reason: string) {
        const withdrawal = await this.prisma.withdrawal.findUnique({
            where: { id: withdrawalId }
        });

        if (!withdrawal || withdrawal.status !== 'PENDING') {
            throw new BadRequestException('Permintaan penarikan tidak ditemukan atau sudah diproses.');
        }

        return this.prisma.$transaction(async (tx) => {
            // Refund balance to user
            const user = await tx.user.update({
                where: { id: withdrawal.userId },
                data: { balance: { increment: withdrawal.amount } }
            });

            // Update Withdrawal Status
            const updatedWd = await tx.withdrawal.update({
                where: { id: withdrawalId },
                data: {
                    status: 'REJECTED',
                    processedById: adminId,
                    processedAt: new Date(),
                    note: reason
                }
            });

            // Log Refund Transaction
            await tx.balanceTransaction.create({
                data: {
                    userId: withdrawal.userId,
                    type: 'REFUND',
                    amount: withdrawal.amount,
                    balanceBefore: user.balance - withdrawal.amount,
                    balanceAfter: user.balance,
                    withdrawalId: updatedWd.id,
                    description: `Refund penarikan saldo ditolak: ${reason}`
                }
            });

            return updatedWd;
        });
    }
}
