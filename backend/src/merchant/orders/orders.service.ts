import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrderFulfillmentStatus, OrderPaymentStatus } from '@prisma/client';

import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private digiflazz: DigiflazzService,
        private subscriptionsService: SubscriptionsService
    ) { }

    async createDirectOrder(merchantId: string, userId: string, body: { skuId: string, gameId: string, serverId?: string, whatsapp: string }) {
        const { skuId, gameId, serverId, whatsapp } = body;

        // 1. Get Merchant & User Balance
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            include: { owner: true }
        });

        if (!merchant) throw new NotFoundException('Merchant not found');

        // 2. Get Product & SKU
        const sku = await this.prisma.productSku.findUnique({
            where: { id: skuId },
            include: { product: { include: { category: true } } }
        });

        if (!sku) throw new NotFoundException('Produk tidak ditemukan');

        // 3. Calculate Price (Merchantpays modal price)
        const mapping = await this.prisma.planTierMapping.findUnique({
            where: { plan: merchant.plan }
        });

        const activeTier = mapping?.tier || 'NORMAL';
        let modalPrice = Number(sku.priceNormal);
        if (activeTier === 'PRO') modalPrice = Number(sku.pricePro);
        if (activeTier === 'LEGEND') modalPrice = Number(sku.priceLegend);
        if (activeTier === 'SUPREME') modalPrice = Number(sku.priceSupreme);

        // 4. Check Balance
        if (merchant.owner.balance < modalPrice) {
            throw new BadRequestException('Saldo Anda tidak mencukupi. Silakan top-up terlebih dahulu.');
        }

        // 5. Deduct Balance & Create Order
        const orderNumber = `DIR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return this.prisma.$transaction(async (tx) => {
            // Deduct from owner
            const updatedUser = await tx.user.update({
                where: { id: merchant.ownerId },
                data: { balance: { decrement: modalPrice } }
            });

            // Create Transaction Log
            await tx.balanceTransaction.create({
                data: {
                    userId: merchant.ownerId,
                    type: 'PURCHASE',
                    amount: -modalPrice,
                    description: `Pembelian Produk: ${sku.product.name} - ${sku.name} (${orderNumber})`
                }
            });

            // Create Order
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    merchantId,
                    productId: sku.product.id,
                    productSkuId: sku.id,
                    productName: sku.product.name,
                    productSkuName: sku.name,
                    priceTierUsed: activeTier,
                    basePrice: Number(sku.basePrice),
                    merchantModalPrice: modalPrice,
                    sellingPrice: modalPrice, // paying modal price
                    totalPrice: modalPrice,
                    paymentStatus: 'PAID',
                    fulfillmentStatus: 'PENDING',
                    paymentMethod: 'BALANCE',
                    gameUserId: gameId,
                    gameUserServerId: serverId,
                    whatsapp,
                    paidAt: new Date(),
                }
            });

            // Trigger Fulfillment (Async-ish or after transaction)
            // We'll call it after transaction to avoid keeping it open too long
            return order;
        }).then(async (order) => {
            // Attempt fulfillment via Digiflazz
            try {
                await this.digiflazz.placeOrder(order.id);
            } catch (err) {
                console.error('[DirectOrder] Fulfillment failed, but order is paid. Merchant should retry manually.', err);
            }
            return order;
        });
    }

    async getOrders(merchantId: string, filters: any) {
        const whereClause: any = { merchantId };

        if (filters.search) {
            whereClause.OR = [
                { id: { contains: filters.search, mode: 'insensitive' } },
                { orderNumber: { contains: filters.search, mode: 'insensitive' } },
                { gameUserId: { contains: filters.search, mode: 'insensitive' } },
                { whatsapp: { contains: filters.search, mode: 'insensitive' } },
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
                user: { select: { id: true, name: true, email: true, phone: true } },
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
        if (order.paymentStatus !== 'PAID') throw new BadRequestException('Order belum terbayar, tidak bisa diretry');

        // Mark as PROCESSING
        await this.prisma.order.update({
            where: { id: orderId },
            data: { fulfillmentStatus: 'PROCESSING' }
        });

        await this.prisma.orderStatusHistory.create({
            data: {
                orderId,
                status: 'PROCESSING',
                note: 'Order retried manually by Merchant',
                changedBy: 'MERCHANT'
            }
        });

        // CRITICAL FIX: Actually trigger Digiflazz fulfillment!
        try {
            await this.digiflazz.placeOrder(orderId);
        } catch (err) {
            console.error('[RetryOrder] Retry fulfillment failed:', err);
            // Don't throw — status already saved, admin can check logs
        }

        const updated = await this.prisma.order.findUnique({ where: { id: orderId } });
        return { message: 'Order retry triggered via Digiflazz', order: updated };
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

            // CRITICAL FIX: Only refund balance for WALLET orders (direct/internal)
            // For Tripay orders, refund must go through Tripay or manual bank transfer
            if (order.paymentStatus === 'PAID' && order.paymentMethod === 'BALANCE') {
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
