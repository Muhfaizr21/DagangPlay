import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrderFulfillmentStatus, OrderPaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async getOrders(merchantId: string, filters: any) {
        const whereClause: any = { merchantId };

        if (filters.search) {
            whereClause.OR = [
                { id: { contains: filters.search, mode: 'insensitive' } },
                { orderNumber: { contains: filters.search, mode: 'insensitive' } },
                { gameUserId: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters.fulfillmentStatus) {
            whereClause.fulfillmentStatus = filters.fulfillmentStatus;
        }

        if (filters.paymentStatus) {
            whereClause.paymentStatus = filters.paymentStatus;
        }

        const orders = await this.prisma.order.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, name: true, email: true } },
                productSku: {
                    select: {
                        name: true,
                        product: { select: { name: true, thumbnail: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // limit to 100 for now
        });

        // get stats to fulfill specs
        const totalCount = await this.prisma.order.count({ where: { merchantId } });
        const successCount = await this.prisma.order.count({ where: { merchantId, fulfillmentStatus: 'SUCCESS' } });

        return {
            orders,
            stats: {
                totalCount,
                successRate: totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0
            }
        };
    }

    async getOrderDetails(merchantId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                productSku: {
                    select: {
                        name: true,
                        product: { select: { name: true, categoryId: true, thumbnail: true } }
                    }
                },
                statusHistories: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async retryOrder(merchantId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId }
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.fulfillmentStatus === 'SUCCESS') throw new BadRequestException('Order already SUCCESS');

        // Logic for retry: mark as PROCESSING and add to queue
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { fulfillmentStatus: 'PROCESSING' }
        });

        // mock adding to queue:
        await this.prisma.orderStatusHistory.create({
            data: {
                orderId,
                status: 'PROCESSING',
                note: 'Order retried manually by Merchant',
                changedBy: 'MERCHANT'
            }
        });

        return { message: 'Order added to retry queue', order: updated };
    }

    async refundOrder(merchantId: string, orderId: string, reason: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId }
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.fulfillmentStatus === 'SUCCESS' || order.paymentStatus === 'REFUNDED') {
            throw new BadRequestException('Order cannot be refunded (status is ' + order.fulfillmentStatus + ')');
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'FAILED' }
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: 'FAILED',
                    note: `Refunded manually: ${reason}`,
                    changedBy: 'MERCHANT'
                }
            });

            // Add balance back if it was paid
            if (order.paymentStatus === 'PAID') {
                const buyerId = order.userId;
                if (buyerId) {
                    await tx.user.update({
                        where: { id: buyerId },
                        data: { balance: { increment: order.totalPrice } }
                    });

                    await tx.balanceTransaction.create({
                        data: {
                            userId: buyerId,
                            type: 'REFUND',
                            amount: order.totalPrice,
                            description: `Refund for order ${order.orderNumber}`
                        }
                    });
                }
            }

            return updated;
        });
    }
}
