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
        return this.prisma.$transaction(async (tx) => {
            const updateResult = await tx.withdrawal.updateMany({
                where: { id: withdrawalId, status: 'PENDING' },
                data: {
                    status: 'COMPLETED',
                    processedById: adminId,
                    processedAt: new Date(),
                    receiptImage
                }
            });

            if (updateResult.count === 0) {
                throw new BadRequestException('Permintaan penarikan tidak ditemukan, diproses ganda, atau bukan PENDING.');
            }

            return tx.withdrawal.findUnique({ where: { id: withdrawalId } });
        });
    }

    async rejectWithdrawal(withdrawalId: string, adminId: string, reason: string) {
        return this.prisma.$transaction(async (tx) => {
            // ATOMIC CHECK: Move inside transaction with updateMany to prevent double execution
            const updateResult = await tx.withdrawal.updateMany({
                where: { id: withdrawalId, status: 'PENDING' },
                data: {
                    status: 'REJECTED',
                    processedById: adminId,
                    processedAt: new Date(),
                    note: reason
                }
            });

            if (updateResult.count === 0) {
                throw new BadRequestException('Permintaan penarikan tidak ditemukan, diproses ganda, atau status bukan PENDING.');
            }

            const updatedWd = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
            if (!updatedWd) throw new Error('Withdrawal not found after atomic update');

            // Refund balance to user
            const user = await tx.user.update({
                where: { id: updatedWd.userId },
                data: { balance: { increment: updatedWd.amount } }
            });

            // Log Refund Transaction
            await tx.balanceTransaction.create({
                data: {
                    userId: updatedWd.userId,
                    type: 'REFUND',
                    amount: updatedWd.amount,
                    balanceBefore: Number(user.balance) - Number(updatedWd.amount),
                    balanceAfter: Number(user.balance),
                    withdrawalId: updatedWd.id,
                    description: `Refund penarikan saldo ditolak: ${reason}`
                }
            });

            return updatedWd;
        });
    }
}
