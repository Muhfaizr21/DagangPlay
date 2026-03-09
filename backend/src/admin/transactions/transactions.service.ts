import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrderPaymentStatus, OrderFulfillmentStatus, FraudRiskLevel } from '@prisma/client';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

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

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    merchant: { select: { id: true, name: true } },
                    payment: true,
                },
                skip,
                take
            }),
            this.prisma.order.count({ where })
        ]);

        return {
            data,
            meta: {
                totalItems: total,
                totalPages: Math.ceil(total / take),
                currentPage: Number(page),
                itemsPerPage: take
            }
        };
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
                    note: `Transasi di-retry manual`,
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

        return { success: true, message: 'Transaksi dimasukkan antrian retry' };
    }

    async refundTransaction(id: string, operatorId: string) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) throw new NotFoundException('Transaksi tidak ditemukan');

        if (order.fulfillmentStatus === 'REFUNDED') throw new BadRequestException('Trx sudah direfund');
        if (order.paymentStatus !== 'PAID') throw new BadRequestException('Trx belum dibayar, tidak bisa refund');

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

            // Kembalikan dana ke user balance
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
                        note: `Refund trx: ${order.orderNumber}`
                    }
                });
            }

            await tx.auditLog.create({
                data: { action: 'REFUND_TRANSACTION', entity: 'Order', entityId: id, newData: { refunded: true }, oldData: {} }
            });

            return { success: true, message: 'Refund berhasil diproses' };
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
