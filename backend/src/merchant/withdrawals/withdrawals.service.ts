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

        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
        if (!merchant) throw new BadRequestException('Merchant data not found for this user');

        // 2. Process Withdrawal (Deduct from Merchant Ledger)
        return this.prisma.$transaction(async (tx) => {
            const currentMerchant = await tx.merchant.findUnique({ 
                where: { id: merchant.id },
                select: { availableBalance: true, escrowBalance: true }
            });

            if (!currentMerchant || currentMerchant.availableBalance < amount) {
                throw new BadRequestException('Saldo Toko tidak mencukupi untuk penarikan ini.');
            }

            // Atomic Deduction from Merchant
            const updatedMerchant = await tx.merchant.update({
                where: { id: merchant.id },
                data: { availableBalance: { decrement: amount } }
            });

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

            // Log Merchant Ledger Movement
            await tx.merchantLedgerMovement.create({
                data: {
                    merchantId: merchant.id,
                    type: 'AVAILABLE_OUT',
                    amount: -amount,
                    description: `Penarikan Dana Toko ke ${bankName} (${accountNumber})`,
                    availableBefore: currentMerchant.availableBalance,
                    availableAfter: updatedMerchant.availableBalance,
                    escrowBefore: updatedMerchant.escrowBalance,
                    escrowAfter: updatedMerchant.escrowBalance
                }
            });

            // Log legacy balanceTransaction for audit log consistency
            await tx.balanceTransaction.create({
                data: {
                    userId,
                    type: 'WITHDRAWAL',
                    amount: -amount,
                    withdrawalId: withdrawal.id,
                    description: `Withdrawal dari Toko ${merchant.name}`
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
            const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
            if (!withdrawal || withdrawal.status !== 'PENDING') {
                throw new BadRequestException('Permintaan tidak ditemukan atau sudah diproses.');
            }

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

            if (updateResult.count === 0) return withdrawal; // Already processed

            // Identify merchant of this user
            const merchant = await tx.merchant.findUnique({ where: { ownerId: withdrawal.userId } });
            if (!merchant) throw new Error('Merchant not found for refund');

            const merchantPrior = await tx.merchant.findUnique({ where: { id: merchant.id } });

            // Refund balance to MERCHANT ledger
            const updatedMerchant = await tx.merchant.update({
                where: { id: merchant.id },
                data: { availableBalance: { increment: withdrawal.amount } }
            });

            // Log Merchant Ledger movement
            await tx.merchantLedgerMovement.create({
                data: {
                    merchantId: merchant.id,
                    type: 'AVAILABLE_IN',
                    amount: withdrawal.amount,
                    description: `Refund Penarikan Ditolak: ${reason}`,
                    availableBefore: merchantPrior?.availableBalance || 0,
                    availableAfter: updatedMerchant.availableBalance,
                    escrowBefore: updatedMerchant.escrowBalance,
                    escrowAfter: updatedMerchant.escrowBalance
                }
            });

            // Log legacy transaction for user audit
            await tx.balanceTransaction.create({
                data: {
                    userId: withdrawal.userId,
                    type: 'REFUND',
                    amount: withdrawal.amount,
                    withdrawalId: withdrawal.id,
                    description: `Refund penarikan ditolak: ${reason}`
                }
            });

            return tx.withdrawal.findUnique({ where: { id: withdrawalId } });
        });
    }
}
