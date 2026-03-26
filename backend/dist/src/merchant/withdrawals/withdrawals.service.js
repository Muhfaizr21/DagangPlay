"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let WithdrawalsService = class WithdrawalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async requestWithdrawal(userId, dto) {
        const { amount, bankName, accountNumber, accountName } = dto;
        if (amount < 10000) {
            throw new common_1.BadRequestException('Minimal penarikan adalah Rp 10.000');
        }
        return this.prisma.$transaction(async (tx) => {
            const updateResult = await tx.user.updateMany({
                where: {
                    id: userId,
                    balance: { gte: amount }
                },
                data: { balance: { decrement: amount } }
            });
            if (updateResult.count === 0) {
                throw new common_1.BadRequestException('Saldo tidak cukup atau sedang dikunci (Gagal pada sistem).');
            }
            const updatedUser = await tx.user.findUnique({ where: { id: userId } });
            if (!updatedUser)
                throw new Error('User not found after deduction');
            const withdrawal = await tx.withdrawal.create({
                data: {
                    userId,
                    amount,
                    netAmount: amount,
                    bankName,
                    bankAccountNumber: accountNumber,
                    bankAccountName: accountName,
                    status: 'PENDING'
                }
            });
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
    async getMerchantWithdrawals(userId) {
        return this.prisma.withdrawal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async approveWithdrawal(withdrawalId, adminId, receiptImage) {
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
                throw new common_1.BadRequestException('Permintaan penarikan tidak ditemukan, diproses ganda, atau bukan PENDING.');
            }
            return tx.withdrawal.findUnique({ where: { id: withdrawalId } });
        });
    }
    async rejectWithdrawal(withdrawalId, adminId, reason) {
        return this.prisma.$transaction(async (tx) => {
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
                throw new common_1.BadRequestException('Permintaan penarikan tidak ditemukan, diproses ganda, atau status bukan PENDING.');
            }
            const updatedWd = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
            if (!updatedWd)
                throw new Error('Withdrawal not found after atomic update');
            const user = await tx.user.update({
                where: { id: updatedWd.userId },
                data: { balance: { increment: updatedWd.amount } }
            });
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
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map