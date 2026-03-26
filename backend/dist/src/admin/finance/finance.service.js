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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDeposits(filters) {
        const { status, search } = filters;
        const where = {};
        if (status && status !== 'ALL')
            where.status = status;
        return this.prisma.deposit.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                merchant: { select: { id: true, name: true, domain: true } },
                confirmedBy: { select: { id: true, name: true } }
            },
            take: 100
        });
    }
    async confirmDeposit(id, operatorId) {
        return this.prisma.$transaction(async (tx) => {
            const deposit = await tx.deposit.findUnique({ where: { id } });
            if (!deposit)
                throw new common_1.NotFoundException('Deposit tidak ditemukan');
            if (deposit.status !== 'PENDING')
                throw new common_1.BadRequestException(`Status tidak bisa dikonfirmasi (${deposit.status})`);
            const updated = await tx.deposit.update({
                where: { id },
                data: {
                    status: 'CONFIRMED',
                    confirmedById: operatorId,
                    confirmedAt: new Date()
                }
            });
            const amount = Number(deposit.amount);
            const user = await tx.user.update({
                where: { id: deposit.userId },
                data: { balance: { increment: amount } }
            });
            await tx.balanceTransaction.create({
                data: {
                    userId: user.id,
                    type: 'DEPOSIT',
                    amount,
                    balanceBefore: Number(user.balance) - amount,
                    balanceAfter: Number(user.balance),
                    depositId: id,
                    note: `Manual confirmation of deposit #${id}`
                }
            });
            await tx.auditLog.create({
                data: {
                    action: 'CONFIRM_DEPOSIT',
                    entity: 'Deposit',
                    entityId: id,
                    newData: { status: 'CONFIRMED' },
                    oldData: { status: 'PENDING' }
                }
            });
            return updated;
        });
    }
    async rejectDeposit(id, reason, operatorId) {
        return this.prisma.$transaction(async (tx) => {
            const deposit = await tx.deposit.findUnique({ where: { id } });
            if (!deposit)
                throw new common_1.NotFoundException('Deposit tidak ditemukan');
            if (deposit.status !== 'PENDING')
                throw new common_1.BadRequestException(`Status tidak bisa ditolak (${deposit.status})`);
            const updated = await tx.deposit.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    rejectedAt: new Date(),
                    note: reason,
                    confirmedById: operatorId
                }
            });
            await tx.auditLog.create({
                data: {
                    action: 'REJECT_DEPOSIT',
                    entity: 'Deposit',
                    entityId: id,
                    userId: operatorId,
                    newData: { status: 'REJECTED', reason },
                    oldData: { status: 'PENDING' }
                }
            });
            return updated;
        });
    }
    async getWithdrawals(filters) {
        const { status } = filters;
        const where = {};
        if (status && status !== 'ALL')
            where.status = status;
        return this.prisma.withdrawal.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                processedBy: { select: { id: true, name: true } }
            },
            take: 100
        });
    }
    async processWithdrawal(id, operatorId, note, receiptImage) {
        return this.prisma.$transaction(async (tx) => {
            const updateResult = await tx.withdrawal.updateMany({
                where: { id, status: 'PENDING' },
                data: {
                    status: 'COMPLETED',
                    processedById: operatorId,
                    processedAt: new Date(),
                    note: note || 'Proses manual sukses',
                    receiptImage: receiptImage || null
                }
            });
            if (updateResult.count === 0)
                throw new common_1.BadRequestException('Status tidak PENDING atau sudah diproses');
            const updated = await tx.withdrawal.findUnique({ where: { id } });
            await tx.auditLog.create({
                data: { action: 'PROCESS_WITHDRAWAL', entity: 'Withdrawal', entityId: id, newData: { status: 'COMPLETED' }, oldData: { status: 'PENDING' } }
            });
            return updated;
        });
    }
    async rejectWithdrawal(id, reason, operatorId) {
        return this.prisma.$transaction(async (tx) => {
            const updateResult = await tx.withdrawal.updateMany({
                where: { id, status: 'PENDING' },
                data: {
                    status: 'REJECTED',
                    rejectedAt: new Date(),
                    processedById: operatorId,
                    note: reason
                }
            });
            if (updateResult.count === 0)
                throw new common_1.BadRequestException('Status tidak PENDING atau sudah diproses');
            const updated = await tx.withdrawal.findUnique({ where: { id } });
            const amount = Number(updated.amount);
            const user = await tx.user.update({
                where: { id: updated.userId },
                data: { balance: { increment: amount } }
            });
            await tx.balanceTransaction.create({
                data: {
                    userId: user.id,
                    type: 'REFUND',
                    amount,
                    balanceBefore: Number(user.balance) - amount,
                    balanceAfter: Number(user.balance),
                    withdrawalId: id,
                    note: `Refund for rejected WD #${id} - ${reason}`
                }
            });
            await tx.auditLog.create({
                data: { action: 'REJECT_WITHDRAWAL', entity: 'Withdrawal', entityId: id, newData: { status: 'REJECTED', reason }, oldData: { status: 'PENDING' } }
            });
            return updated;
        });
    }
    summaryCache = { data: null, expiresAt: 0 };
    async getFinanceSummary() {
        if (this.summaryCache.expiresAt > Date.now()) {
            return this.summaryCache.data;
        }
        const totalDepositConfirmedAgg = await this.prisma.deposit.aggregate({
            where: { status: 'CONFIRMED' },
            _sum: { amount: true }
        });
        const totalWDAgg = await this.prisma.withdrawal.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true, fee: true }
        });
        const orderSalesAgg = await this.prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalPrice: true, basePrice: true }
        });
        const revenueFromMargin = Number(orderSalesAgg._sum.totalPrice || 0) - Number(orderSalesAgg._sum.basePrice || 0);
        const saasInvoicesAgg = await this.prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { totalAmount: true }
        });
        const saasRevenue = Number(saasInvoicesAgg._sum.totalAmount || 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySalesAgg = await this.prisma.order.aggregate({
            where: { paymentStatus: 'PAID', createdAt: { gte: today } },
            _sum: { totalPrice: true }
        });
        const result = {
            totalDepositIn: Number(totalDepositConfirmedAgg._sum.amount || 0),
            totalWithdrawalOut: Number(totalWDAgg._sum.amount || 0),
            wdFeesCollected: Number(totalWDAgg._sum.fee || 0),
            grossSales: Number(orderSalesAgg._sum.totalPrice || 0),
            netMarginProfit: revenueFromMargin,
            todaySales: Number(todaySalesAgg._sum.totalPrice || 0),
            saasRevenue
        };
        this.summaryCache = { data: result, expiresAt: Date.now() + 5 * 60 * 1000 };
        return result;
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map