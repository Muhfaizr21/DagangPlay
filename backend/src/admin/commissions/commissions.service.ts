import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CommissionsService {
    private readonly logger = new Logger(CommissionsService.name);

    constructor(private prisma: PrismaService) { }

    // =====================
    // COMMISSIONS List
    // =====================
    // Used for querying both normal commissions (merchant/reseller basic logic) and MLM commissions if needed
    // For simplicity we will query basic `Commission` table.
    async getPendingCommissions(search?: string) {
        // Only pending to be settled
        const where: any = { status: 'PENDING' };

        // In real app, search could filter by userId or order.orderNumber
        const commissions = await this.prisma.commission.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, role: true, email: true } },
                order: { select: { id: true, orderNumber: true, productName: true, totalPrice: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return commissions;
    }

    async settleCommission(id: string, operatorId: string) {
        const commission = await this.prisma.commission.findUnique({ where: { id } });
        if (!commission) throw new NotFoundException('Komisi tidak ditemukan');
        if (commission.status !== 'PENDING') throw new BadRequestException('Bukan status PENDING');

        return this.prisma.$transaction(async (tx) => {
            // 1. Update status
            const updated = await tx.commission.update({
                where: { id },
                data: { status: 'SETTLED', settledAt: new Date() }
            });

            // 2. Add balance to user
            const user = await tx.user.findUnique({ where: { id: commission.userId } });
            if (user) {
                const amount = Number(commission.amount);
                const current = Number(user.balance);

                await tx.user.update({
                    where: { id: user.id },
                    data: { balance: current + amount }
                });

                await tx.balanceTransaction.create({
                    data: {
                        userId: user.id,
                        type: 'COMMISSION',
                        amount,
                        balanceBefore: current,
                        balanceAfter: current + amount,
                        orderId: commission.orderId,
                        note: `Pencairan Komisi Order #${commission.orderId}`
                    }
                });
            }

            await tx.auditLog.create({
                data: {
                    action: 'SETTLE_COMMISSION',
                    entity: 'Commission',
                    entityId: id,
                    newData: { status: 'SETTLED' },
                    oldData: { status: 'PENDING' }
                }
            });

            return updated;
        });
    }

    async settleBulkCommissions(operatorId: string) {
        // Settle all pending commissions
        const pendingComms = await this.prisma.commission.findMany({
            where: { status: 'PENDING' },
            take: 100 // Batching
        });

        if (pendingComms.length === 0) return { message: 'Tidak ada komisi pending' };

        let settledCount = 0;
        for (const comm of pendingComms) {
            try {
                await this.settleCommission(comm.id, operatorId);
                settledCount++;
            } catch (err) {
                // Ignore error for individual failure, proceed to next
            }
        }

        return { message: `Berhasil mencairkan ${settledCount} komisi.` };
    }

    /**
     * FIXED 1: TWO-LEDGER SETTLEMENT (AUTO-CAIR H+1)
     * Berjalan setiap jam untuk mencairkan saldo komisi yang umurnya melebihi 24 jam.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async autoSettleCommissions() {
        this.logger.log('[Cashflow Protect] Menjalankan settlement otomatis untuk komisi PENDING >24 jam...');
        
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const pendingComms = await this.prisma.commission.findMany({
            where: { 
                status: 'PENDING',
                createdAt: { lte: oneDayAgo }
            },
            take: 200 // Batching
        });

        if (pendingComms.length === 0) return;

        let settledCount = 0;
        for (const comm of pendingComms) {
            try {
                // Jangan cairkan komisi dari Order yang FAILED
                const order = await this.prisma.order.findUnique({ where: { id: comm.orderId } });
                if (order && order.fulfillmentStatus !== 'FAILED') {
                    await this.settleCommission(comm.id, 'SystemCron');
                    settledCount++;
                }
            } catch (err) {
                // Ignore per error
            }
        }

        if (settledCount > 0) {
            this.logger.log(`[Cashflow Protect] Berhasil mencairkan ${settledCount} komisi secara otomatis.`);
        }
    }

    // =====================
    // MLM TREES (Downlines)
    // =====================
    async getDownlineTree(userId?: string) {
        // If userId provided, fetch tree below them. Otherwise fetch root level
        const where: any = {};
        if (userId) {
            where.parentId = userId;
        }

        return this.prisma.downlineTree.findMany({
            where,
            include: {
                parent: { select: { id: true, name: true, role: true } },
                child: { select: { id: true, name: true, role: true } }
            },
            take: 50
        });
    }
}
