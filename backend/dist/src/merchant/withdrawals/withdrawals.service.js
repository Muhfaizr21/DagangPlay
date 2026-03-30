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
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: userId } });
        if (!merchant)
            throw new common_1.BadRequestException('Merchant data not found for this user');
        return this.prisma.$transaction(async (tx) => {
            const currentMerchant = await tx.merchant.findUnique({
                where: { id: merchant.id },
                select: { availableBalance: true, escrowBalance: true }
            });
            if (!currentMerchant || currentMerchant.availableBalance < amount) {
                throw new common_1.BadRequestException('Saldo Toko tidak mencukupi untuk penarikan ini.');
            }
            const updatedMerchant = await tx.merchant.update({
                where: { id: merchant.id },
                data: { availableBalance: { decrement: amount } }
            });
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
            const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
            if (!withdrawal || withdrawal.status !== 'PENDING') {
                throw new common_1.BadRequestException('Permintaan tidak ditemukan atau sudah diproses.');
            }
            const updateResult = await tx.withdrawal.updateMany({
                where: { id: withdrawalId, status: 'PENDING' },
                data: {
                    status: 'REJECTED',
                    processedById: adminId,
                    processedAt: new Date(),
                    note: reason
                }
            });
            if (updateResult.count === 0)
                return withdrawal;
            const merchant = await tx.merchant.findUnique({ where: { ownerId: withdrawal.userId } });
            if (!merchant)
                throw new Error('Merchant not found for refund');
            const merchantPrior = await tx.merchant.findUnique({ where: { id: merchant.id } });
            const updatedMerchant = await tx.merchant.update({
                where: { id: merchant.id },
                data: { availableBalance: { increment: withdrawal.amount } }
            });
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
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map