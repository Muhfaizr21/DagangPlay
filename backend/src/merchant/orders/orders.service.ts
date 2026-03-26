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
            // Deduct from owner atomically (Race Condition Fix)
            const updatedUsers = await tx.user.updateMany({
                where: { 
                    id: merchant.ownerId,
                    balance: { gte: modalPrice }
                },
                data: { balance: { decrement: modalPrice } }
            });

            if (updatedUsers.count === 0) {
                throw new BadRequestException('Saldo Anda tidak mencukupi atau sedang dikunci oleh sistem. Silakan top-up terlebih dahulu.');
            }

            // Create Transaction Log
            await tx.balanceTransaction.create({
                data: {
                    userId: merchant.ownerId,
                    type: 'PURCHASE',
                    amount: -modalPrice,
                    description: `Pembelian Produk (Direct): ${sku.product.name} - ${sku.name} (${orderNumber})`
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

        // Tautan (Chain) pemenuhan asinkron tapi tetap dimonitor untuk notifikasi
        return order;
        }).then(async (order) => {
            try {
                // Berusaha hit Digiflazz
                await this.digiflazz.placeOrder(order.id);
            } catch (err: any) {
                console.error('[DirectOrder] Ghost timeout saat fulfillment, Order PAID tapi Digiflazz gagal/timeout.', err.message);
                // Flagging the order explicitly so the merchant knows why it's stuck
                await this.prisma.order.update({
                    where: { id: order.id },
                    data: { failReason: 'Koneksi ke server pusat terputus (Timeout). Silakan lakukan RETRY manual.' }
                });
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
        // CRITICAL FIX: Lock the order ATOMICALLY to prevent Concurrent Double Retry
        const updatedCount = await this.prisma.order.updateMany({
            where: { 
                id: orderId, 
                merchantId,
                paymentStatus: 'PAID',
                fulfillmentStatus: { in: ['PENDING', 'FAILED'] } // Hanya boleh retry kalau PENDING atau FAILED
            },
            data: { fulfillmentStatus: 'PROCESSING', failReason: null }
        });

        if (updatedCount.count === 0) {
            throw new BadRequestException('Order tidak bisa diretry. Pastikan order sudah terbayar dan tidak sedang/sudah diproses (SUCCESS/PROCESSING).');
        }

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
            if (order.paymentStatus === 'PAID' && order.paymentMethod === 'BALANCE') {
                const buyerId = order.userId; // The Merchant Owner / Caller
                const refundAmount = order.merchantModalPrice || order.sellingPrice;
                
                if (buyerId) {
                    await tx.user.update({
                        where: { id: buyerId },
                        data: { balance: { increment: refundAmount } }
                    });

                    await tx.balanceTransaction.create({
                        data: {
                            userId: buyerId,
                            type: 'REFUND',
                            amount: refundAmount,
                            description: `Refund Modal untuk order langsung ${order.orderNumber}`
                        }
                    });
                }
            }

            return updated;
        });
    }
}
