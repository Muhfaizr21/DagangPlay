import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrderFulfillmentStatus, OrderPaymentStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('digiflazz-fulfillment') private fulfillmentQueue: Queue,
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

        // 4. Check Balance (Use Merchant Ledger)
        if (merchant.availableBalance < modalPrice) {
            throw new BadRequestException('Saldo Toko Anda tidak mencukupi untuk pesanan direct ini. Silakan top-up terlebih dahulu.');
        }

        // 5. Deduct Balance & Create Order
        const orderNumber = `DIR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return this.prisma.$transaction(async (tx) => {
            // Deduct from Merchant Ledger atomically
            const updatedMerchant = await tx.merchant.update({
                where: { 
                    id: merchantId,
                    availableBalance: { gte: modalPrice }
                },
                data: { availableBalance: { decrement: modalPrice } }
            });

            if (!updatedMerchant) {
                throw new BadRequestException('Saldo Toko tidak mencukupi atau sedang dikunci sistem.');
            }

            // Create Ledger Movement Log
            await tx.merchantLedgerMovement.create({
                data: {
                    merchantId,
                    type: 'AVAILABLE_OUT',
                    amount: -modalPrice,
                    description: `Pembelian Produk (Direct): ${sku.product.name} - ${sku.name} (${orderNumber})`,
                    availableBefore: merchant.availableBalance,
                    availableAfter: updatedMerchant.availableBalance,
                    escrowBefore: updatedMerchant.escrowBalance,
                    escrowAfter: updatedMerchant.escrowBalance
                }
            });

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

        // Return order immediately — fulfillment dispatched via persistent BullMQ queue
        return order;
        }).then(async (order) => {
            // FIX #19: Route through BullMQ instead of direct sync call to prevent Ghost Orders
            await this.fulfillmentQueue.add('process-fulfillment', { orderId: order.id }, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true
            });
            console.log(`[DirectOrder] Enqueued fulfillment for order: ${order.orderNumber}`);
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

        // FIX #20: Route retry through BullMQ queue instead of sync call
        await this.fulfillmentQueue.add('process-fulfillment', { orderId }, {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true
        });
        console.log(`[RetryOrder] Enqueued retry for order: ${orderId}`);

        const updated = await this.prisma.order.findUnique({ where: { id: orderId } });
        return { message: 'Order retry triggered via persistent BullMQ queue', order: updated };
    }

    async refundOrder(merchantId: string, orderId: string, reason: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId },
            include: { user: true }
        });

        if (!order) throw new NotFoundException('Order not found');
        if (order.fulfillmentStatus === 'SUCCESS' || order.paymentStatus === 'REFUNDED') {
            throw new BadRequestException(`Order cannot be refunded (status: ${order.fulfillmentStatus}, payment: ${order.paymentStatus})`);
        }

        const isDirectOrder = order.orderNumber.startsWith('DIR-');

        return this.prisma.$transaction(async (tx) => {
            // ATOMIC STATUS LOCK: Check fulfillment and payment status inside the transaction
            const orderCheck = await tx.order.updateMany({
                where: { 
                    id: orderId, 
                    fulfillmentStatus: { not: 'SUCCESS' },
                    paymentStatus: { in: ['PAID', 'PENDING'] } // Ensure not already REFUNDED
                },
                data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'FAILED' }
            });

            if (orderCheck.count === 0) {
                throw new BadRequestException('Order tidak dapat direfund (Mungkin sudah Sukses atau sudah Direfund sebelumnya)');
            }

            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: 'FAILED',
                    note: `Refunded manually by Merchant: ${reason}`,
                    changedBy: 'MERCHANT'
                }
            });

            if (isDirectOrder) {
                // FIXED 6.1: Refund Direct Order to Merchant Ledger
                const refundAmount = order.merchantModalPrice || 0;
                const merchant = await tx.merchant.findUnique({ where: { id: merchantId } });
                
                if (merchant && refundAmount > 0) {
                    const updatedMerchant = await tx.merchant.update({
                        where: { id: merchantId },
                        data: { availableBalance: { increment: refundAmount } }
                    });

                    await tx.merchantLedgerMovement.create({
                        data: {
                            merchantId,
                            orderId: order.id,
                            type: 'AVAILABLE_IN',
                            amount: refundAmount,
                            description: `Refund Modal (Direct Order Gagal): ${order.orderNumber}`,
                            availableBefore: merchant.availableBalance,
                            availableAfter: updatedMerchant.availableBalance,
                            escrowBefore: updatedMerchant.escrowBalance,
                            escrowAfter: updatedMerchant.escrowBalance
                        }
                    });

                    await tx.balanceTransaction.create({
                        data: {
                            userId: order.userId,
                            type: 'REFUND',
                            amount: refundAmount,
                            description: `Refund Modal Direct Order: ${order.orderNumber}`
                        }
                    });
                }
            } else {
                // FIXED 6.2: Refund Store Order (Customer)
                // 1. Refund sellingPrice to Customer Balance (if applicable)
                if (order.paymentMethod === 'BALANCE') {
                    const refundAmount = order.totalPrice;
                    const user = await tx.user.update({
                        where: { id: order.userId },
                        data: { balance: { increment: refundAmount } }
                    });

                    await tx.balanceTransaction.create({
                        data: {
                            userId: order.userId,
                            type: 'REFUND',
                            amount: refundAmount,
                            description: `Refund Dana Pelanggan (Store Order): ${order.orderNumber}`
                        }
                    });
                }

                // 2. CLAW BACK PROFIT from Merchant
                // Must check BOTH PENDING (in escrow) AND SETTLED (already available) commissions
                const commissions = await tx.commission.findMany({
                    where: { orderId: order.id, type: 'MERCHANT_RETAIL_PROFIT', status: { in: ['PENDING', 'SETTLED'] } }
                });

                for (const commission of commissions) {
                    const merchant = await tx.merchant.findUnique({ where: { id: merchantId } });
                    if (!merchant) continue;

                    if (commission.status === 'PENDING') {
                        // Funds are still in escrow — deduct from escrowBalance
                        const updatedMerchant = await tx.merchant.update({
                            where: { id: merchantId },
                            data: { escrowBalance: { decrement: commission.amount } }
                        });

                        await tx.merchantLedgerMovement.create({
                            data: {
                                merchantId: merchantId,
                                orderId: order.id,
                                type: 'ESCROW_OUT',
                                amount: -commission.amount,
                                description: `Clawback Laba (Refund Pembeli): ${order.orderNumber}`,
                                availableBefore: merchant.availableBalance,
                                availableAfter: merchant.availableBalance,
                                escrowBefore: merchant.escrowBalance,
                                escrowAfter: updatedMerchant.escrowBalance
                            }
                        });
                    } else if (commission.status === 'SETTLED') {
                        // FIX #18: Funds already settled into availableBalance — must deduct from there
                        const updatedMerchant = await tx.merchant.update({
                            where: { id: merchantId },
                            data: { availableBalance: { decrement: commission.amount } }
                        });

                        await tx.merchantLedgerMovement.create({
                            data: {
                                merchantId: merchantId,
                                orderId: order.id,
                                type: 'AVAILABLE_OUT',
                                amount: -commission.amount,
                                description: `Clawback Laba yang sudah Cair (Refund Pembeli): ${order.orderNumber}`,
                                availableBefore: merchant.availableBalance,
                                availableAfter: updatedMerchant.availableBalance,
                                escrowBefore: updatedMerchant.escrowBalance,
                                escrowAfter: updatedMerchant.escrowBalance
                            }
                        });
                    }

                    await tx.commission.update({
                        where: { id: commission.id },
                        data: { status: 'CANCELLED' }
                    });
                }
            }

            return tx.order.findUnique({ where: { id: orderId } });
        });
    }
}
