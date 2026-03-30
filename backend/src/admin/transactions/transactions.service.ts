import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrderPaymentStatus, OrderFulfillmentStatus, FraudRiskLevel } from '@prisma/client';
import { PublicOrdersService } from '../../public/orders/public-orders.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { paginate } from '../../common/utils/pagination';

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
        private publicOrders: PublicOrdersService,
        @InjectQueue('digiflazz-fulfillment') private fulfillmentQueue: Queue
    ) { }

    async getAllTransactions(filters: any) {
        const {
            search,
            paymentStatus,
            fulfillmentStatus,
            merchantId,
            productId,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = filters;

        const where: any = {};
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { gameUserName: { contains: search, mode: 'insensitive' } },
                { gameUserId: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (paymentStatus && paymentStatus !== 'ALL') where.paymentStatus = paymentStatus;
        if (fulfillmentStatus && fulfillmentStatus !== 'ALL') where.fulfillmentStatus = fulfillmentStatus;
        if (merchantId && merchantId !== 'ALL') where.merchantId = merchantId;

        if (productId && productId !== 'ALL') where.productId = productId;

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        return paginate(this.prisma.order, {
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                merchant: { select: { id: true, name: true } },
                payment: true,
            },
        }, { page, perPage: limit });
    }

    async getTransactionDetail(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                merchant: { select: { id: true, name: true } },
                payment: true,
                statusHistories: { orderBy: { createdAt: 'desc' } },
                supplierLogs: { orderBy: { createdAt: 'desc' } },
                fraudDetections: true,
            }
        });

        if (!order) throw new NotFoundException('Transaksi tidak ditemukan');
        return order;
    }

    async retryTransaction(id: string, operatorId: string) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Transaksi tidak ditemukan');
        if (order.fulfillmentStatus === 'SUCCESS') throw new BadRequestException('Transaksi sudah sukses');

        // Here we would typically trigger the queue/worker to reprocess
        // For now we mutate local state
        await this.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id },
                data: { fulfillmentStatus: 'PROCESSING', note: 'Retried by operator' }
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: 'PROCESSING',
                    note: `Transaksi di-retry manual oleh operator`,
                    changedBy: operatorId
                }
            });

            await tx.auditLog.create({
                data: {
                    action: 'RETRY_TRANSACTION',
                    entity: 'Order',
                    entityId: id,
                    newData: { fulfillmentStatus: 'PROCESSING' },
                    oldData: { fulfillmentStatus: order.fulfillmentStatus }
                }
            });
        });

        // FIX A: Actually dispatch to BullMQ persistent queue
        await this.fulfillmentQueue.add('process-fulfillment', { orderId: id }, {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true
        });

        return { success: true, message: 'Transaksi dimasukkan antrian BullMQ untuk diproses ulang' };
    }

    async refundTransaction(id: string, operatorId: string) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Transaksi tidak ditemukan');

        if (order.fulfillmentStatus === 'REFUNDED') throw new BadRequestException('Trx sudah direfund');
        if (order.paymentStatus !== 'PAID') throw new BadRequestException('Trx belum dibayar, tidak bisa refund');
        // FIX B: Prevent refunding an order that was already fulfilled — prevents double benefit
        if (order.fulfillmentStatus === 'SUCCESS') throw new BadRequestException('Tidak bisa refund: Produk sudah berhasil dikirim ke pelanggan. Hubungi supplier terlebih dahulu untuk pembatalan.');

        return this.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id },
                data: { fulfillmentStatus: 'REFUNDED', paymentStatus: 'REFUNDED' }
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: 'REFUNDED',
                    note: 'Refund manual oleh Admin',
                    changedBy: operatorId
                }
            });

            // 1. Reversal Profit Merchant (Anti-Leakage)
            await this.publicOrders.reverseCommission(id, tx as any);

            // 2. Kembalikan dana ke user balance (Customer)
            const user = await tx.user.findUnique({ where: { id: order.userId } });
            const currentBalance = user?.balance || 0;
            const refundAmount = Number(order.totalPrice);

            if (user) {
                await tx.user.update({
                    where: { id: user.id },
                    data: { balance: Number(currentBalance) + refundAmount }
                });

                await tx.balanceTransaction.create({
                    data: {
                        userId: user.id,
                        type: 'REFUND',
                        amount: refundAmount,
                        balanceBefore: currentBalance,
                        balanceAfter: Number(currentBalance) + refundAmount,
                        orderId: order.id,
                        note: `Refund trx: ${order.orderNumber}`
                    }
                });
            }

            await tx.auditLog.create({
                data: { action: 'REFUND_TRANSACTION', entity: 'Order', entityId: id, newData: { refunded: true }, oldData: {} }
            });

            return { success: true, message: 'Refund berhasil diproses & Profit merchant ditarik balik' };
        });
    }

    async markAsFraud(id: string, reason: string, operatorId: string) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Transaksi tidak ditemukan');

        return this.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id },
                data: { note: 'Ditandai FRAUD oleh system/admin' }
            });

            await tx.fraudDetection.create({
                data: {
                    userId: order.userId,
                    orderId: id,
                    riskLevel: 'HIGH',
                    reason: reason || 'Manual flag of fraud by Super Admin',
                    metadata: { operatorId, ip: 'unknown' }
                }
            });

            await tx.auditLog.create({
                data: { action: 'MARK_FRAUD', entity: 'Order', entityId: id, newData: { fraud: true, reason }, oldData: {} }
            });

            return { success: true };
        });
    }

    async overrideStatus(id: string, fulfillmentStatus: OrderFulfillmentStatus, paymentStatus: OrderPaymentStatus, reason: string, operatorId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id } });
            if (!order) throw new NotFoundException();

            const updated = await tx.order.update({
                where: { id },
                data: { fulfillmentStatus, paymentStatus, note: reason }
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: `MANUAL_OVERRIDE_${fulfillmentStatus}_${paymentStatus}`,
                    note: reason,
                    changedBy: operatorId
                }
            });

            return updated;
        });
    }
}
