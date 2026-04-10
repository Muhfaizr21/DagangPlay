import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DepositStatus, WithdrawalStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // =====================
  // DEPOSIT (USER TOP-UP)
  // =====================
  async getDeposits(filters: any) {
    const { status, search } = filters;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    // For now we don't mock complex search as it requires joins sometimes
    // But we can join relation
    return this.prisma.deposit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        merchant: { select: { id: true, name: true, domain: true } },
        confirmedBy: { select: { id: true, name: true } },
      },
      take: 100,
    });
  }

  async confirmDeposit(id: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      // RELOAD INSIDE TRANSACTION (Pessimistic-like Lock)
      const deposit = await tx.deposit.findUnique({ where: { id } });
      if (!deposit) throw new NotFoundException('Deposit tidak ditemukan');
      if (deposit.status !== 'PENDING')
        throw new BadRequestException(
          `Status tidak bisa dikonfirmasi (${deposit.status})`,
        );

      // 1. Mark status
      const updated = await tx.deposit.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedById: operatorId,
          confirmedAt: new Date(),
        },
      });

      // 2. Add balance to user (ATOMIC)
      const amount = Number(deposit.amount);
      const user = await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: amount } },
      });

      // 3. Create balance transaction ledger
      await tx.balanceTransaction.create({
        data: {
          userId: user.id,
          type: 'DEPOSIT',
          amount,
          balanceBefore: Number(user.balance) - amount,
          balanceAfter: Number(user.balance),
          depositId: id,
          note: `Manual confirmation of deposit #${id}`,
        },
      });

      // 4. Audit
      await tx.auditLog.create({
        data: {
          action: 'CONFIRM_DEPOSIT',
          entity: 'Deposit',
          entityId: id,
          newData: { status: 'CONFIRMED' },
          oldData: { status: 'PENDING' },
        },
      });

      return updated;
    });
  }

  async rejectDeposit(id: string, reason: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({ where: { id } });
      if (!deposit) throw new NotFoundException('Deposit tidak ditemukan');
      if (deposit.status !== 'PENDING')
        throw new BadRequestException(
          `Status tidak bisa ditolak (${deposit.status})`,
        );

      const updated = await tx.deposit.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          note: reason,
          confirmedById: operatorId,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'REJECT_DEPOSIT',
          entity: 'Deposit',
          entityId: id,
          userId: operatorId,
          newData: { status: 'REJECTED', reason },
          oldData: { status: 'PENDING' },
        },
      });

      return updated;
    });
  }

  // ==========================
  // WITHDRAWAL (TARIK SALDO)
  // ==========================
  async getWithdrawals(filters: any) {
    const { status } = filters;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    return this.prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        processedBy: { select: { id: true, name: true } },
      },
      take: 100,
    });
  }

  async processWithdrawal(
    id: string,
    operatorId: string,
    note?: string,
    receiptImage?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.withdrawal.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: 'COMPLETED',
          processedById: operatorId,
          processedAt: new Date(),
          note: note || 'Proses manual sukses',
          receiptImage: receiptImage || null,
        },
      });

      if (updateResult.count === 0)
        throw new BadRequestException(
          'Status tidak PENDING atau sudah diproses',
        );

      const updated = await tx.withdrawal.findUnique({ where: { id } });

      await tx.auditLog.create({
        data: {
          action: 'PROCESS_WITHDRAWAL',
          entity: 'Withdrawal',
          entityId: id,
          newData: { status: 'COMPLETED' },
          oldData: { status: 'PENDING' },
        },
      });

      return updated;
    });
  }

  async rejectWithdrawal(id: string, reason: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.withdrawal.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          processedById: operatorId,
          note: reason,
        },
      });

      if (updateResult.count === 0)
        throw new BadRequestException(
          'Status tidak PENDING atau sudah diproses',
        );

      const updated = await tx.withdrawal.findUnique({ where: { id } });

      // Kembalikan uang (ATOMIC)
      const amount = Number(updated.amount);
      const user = await tx.user.update({
        where: { id: updated.userId },
        data: { balance: { increment: amount } },
      });

      await tx.balanceTransaction.create({
        data: {
          userId: user.id,
          type: 'REFUND',
          amount,
          balanceBefore: Number(user.balance) - amount,
          balanceAfter: Number(user.balance),
          withdrawalId: id,
          note: `Refund for rejected WD #${id} - ${reason}`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'REJECT_WITHDRAWAL',
          entity: 'Withdrawal',
          entityId: id,
          newData: { status: 'REJECTED', reason },
          oldData: { status: 'PENDING' },
        },
      });

      return updated;
    });
  }

  // ==========================
  // REPORTER KEUANGAN PUSAT
  // ==========================
  private summaryCache: { data: any; expiresAt: number } = {
    data: null,
    expiresAt: 0,
  };

  async getFinanceSummary() {
    if (this.summaryCache.expiresAt > Date.now()) {
      return this.summaryCache.data;
    }

    // Very naive aggregations for Dashboard UI
    const totalDepositConfirmedAgg = await this.prisma.deposit.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true },
    });

    const totalWDAgg = await this.prisma.withdrawal.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true, fee: true },
    });

    const orderSalesAgg = await this.prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalPrice: true, basePrice: true },
    });

    const revenueFromMargin =
      Number(orderSalesAgg._sum.totalPrice || 0) -
      Number(orderSalesAgg._sum.basePrice || 0);

    // Revenue from SaaS
    const saasInvoicesAgg = await this.prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true },
    });
    const saasRevenue = Number(saasInvoicesAgg._sum.totalAmount || 0);

    // Today's Sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySalesAgg = await this.prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: today } },
      _sum: { totalPrice: true },
    });

    const result = {
      totalDepositIn: Number(totalDepositConfirmedAgg._sum.amount || 0),
      totalWithdrawalOut: Number(totalWDAgg._sum.amount || 0),
      wdFeesCollected: Number(totalWDAgg._sum.fee || 0),
      grossSales: Number(orderSalesAgg._sum.totalPrice || 0),
      netMarginProfit: revenueFromMargin,
      todaySales: Number(todaySalesAgg._sum.totalPrice || 0),
      saasRevenue,
    };

    this.summaryCache = { data: result, expiresAt: Date.now() + 5 * 60 * 1000 };
    return result;
  }
}
