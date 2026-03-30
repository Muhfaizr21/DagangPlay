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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const subscriptions_service_1 = require("../../admin/subscriptions/subscriptions.service");
let OrdersService = class OrdersService {
    prisma;
    fulfillmentQueue;
    subscriptionsService;
    constructor(prisma, fulfillmentQueue, subscriptionsService) {
        this.prisma = prisma;
        this.fulfillmentQueue = fulfillmentQueue;
        this.subscriptionsService = subscriptionsService;
    }
    async createDirectOrder(merchantId, userId, body) {
        const { skuId, gameId, serverId, whatsapp } = body;
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            include: { owner: true }
        });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant not found');
        const sku = await this.prisma.productSku.findUnique({
            where: { id: skuId },
            include: { product: { include: { category: true } } }
        });
        if (!sku)
            throw new common_1.NotFoundException('Produk tidak ditemukan');
        const mapping = await this.prisma.planTierMapping.findUnique({
            where: { plan: merchant.plan }
        });
        const activeTier = mapping?.tier || 'NORMAL';
        let modalPrice = Number(sku.priceNormal);
        if (activeTier === 'PRO')
            modalPrice = Number(sku.pricePro);
        if (activeTier === 'LEGEND')
            modalPrice = Number(sku.priceLegend);
        if (activeTier === 'SUPREME')
            modalPrice = Number(sku.priceSupreme);
        if (merchant.availableBalance < modalPrice) {
            throw new common_1.BadRequestException('Saldo Toko Anda tidak mencukupi untuk pesanan direct ini. Silakan top-up terlebih dahulu.');
        }
        const orderNumber = `DIR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return this.prisma.$transaction(async (tx) => {
            const updatedMerchant = await tx.merchant.update({
                where: {
                    id: merchantId,
                    availableBalance: { gte: modalPrice }
                },
                data: { availableBalance: { decrement: modalPrice } }
            });
            if (!updatedMerchant) {
                throw new common_1.BadRequestException('Saldo Toko tidak mencukupi atau sedang dikunci sistem.');
            }
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
            await tx.balanceTransaction.create({
                data: {
                    userId: merchant.ownerId,
                    type: 'PURCHASE',
                    amount: -modalPrice,
                    description: `Pembelian Produk (Direct): ${sku.product.name} - ${sku.name} (${orderNumber})`
                }
            });
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
                    sellingPrice: modalPrice,
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
            return order;
        }).then(async (order) => {
            await this.fulfillmentQueue.add('process-fulfillment', { orderId: order.id }, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 5000 },
                removeOnComplete: true
            });
            console.log(`[DirectOrder] Enqueued fulfillment for order: ${order.orderNumber}`);
            return order;
        });
    }
    async getOrders(merchantId, filters) {
        const whereClause = { merchantId };
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
            take: 100
        });
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
    async getOrderDetails(merchantId, orderId) {
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
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async retryOrder(merchantId, orderId) {
        const updatedCount = await this.prisma.order.updateMany({
            where: {
                id: orderId,
                merchantId,
                paymentStatus: 'PAID',
                fulfillmentStatus: { in: ['PENDING', 'FAILED'] }
            },
            data: { fulfillmentStatus: 'PROCESSING', failReason: null }
        });
        if (updatedCount.count === 0) {
            throw new common_1.BadRequestException('Order tidak bisa diretry. Pastikan order sudah terbayar dan tidak sedang/sudah diproses (SUCCESS/PROCESSING).');
        }
        await this.prisma.orderStatusHistory.create({
            data: {
                orderId,
                status: 'PROCESSING',
                note: 'Order retried manually by Merchant',
                changedBy: 'MERCHANT'
            }
        });
        await this.fulfillmentQueue.add('process-fulfillment', { orderId }, {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true
        });
        console.log(`[RetryOrder] Enqueued retry for order: ${orderId}`);
        const updated = await this.prisma.order.findUnique({ where: { id: orderId } });
        return { message: 'Order retry triggered via persistent BullMQ queue', order: updated };
    }
    async refundOrder(merchantId, orderId, reason) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId },
            include: { user: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.fulfillmentStatus === 'SUCCESS' || order.paymentStatus === 'REFUNDED') {
            throw new common_1.BadRequestException(`Order cannot be refunded (status: ${order.fulfillmentStatus}, payment: ${order.paymentStatus})`);
        }
        const isDirectOrder = order.orderNumber.startsWith('DIR-');
        return this.prisma.$transaction(async (tx) => {
            const orderCheck = await tx.order.updateMany({
                where: {
                    id: orderId,
                    fulfillmentStatus: { not: 'SUCCESS' },
                    paymentStatus: { in: ['PAID', 'PENDING'] }
                },
                data: { paymentStatus: 'REFUNDED', fulfillmentStatus: 'FAILED' }
            });
            if (orderCheck.count === 0) {
                throw new common_1.BadRequestException('Order tidak dapat direfund (Mungkin sudah Sukses atau sudah Direfund sebelumnya)');
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
            }
            else {
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
                const commissions = await tx.commission.findMany({
                    where: { orderId: order.id, status: { in: ['PENDING', 'SETTLED'] } },
                    include: { user: true }
                });
                for (const commission of commissions) {
                    const beneficiary = commission.user;
                    if (!beneficiary)
                        continue;
                    if (commission.status === 'PENDING') {
                        const merchant = await tx.merchant.findUnique({ where: { ownerId: beneficiary.id } });
                        if (merchant) {
                            const updatedMerchant = await tx.merchant.update({
                                where: { id: merchant.id },
                                data: { escrowBalance: { decrement: commission.amount } }
                            });
                            await tx.merchantLedgerMovement.create({
                                data: {
                                    merchantId: merchant.id,
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
                        }
                    }
                    else if (commission.status === 'SETTLED') {
                        if (beneficiary.role === 'MERCHANT') {
                            const merchant = await tx.merchant.findUnique({ where: { ownerId: beneficiary.id } });
                            if (merchant) {
                                const updatedMerchant = await tx.merchant.update({
                                    where: { id: merchant.id },
                                    data: { availableBalance: { decrement: commission.amount } }
                                });
                                await tx.merchantLedgerMovement.create({
                                    data: {
                                        merchantId: merchant.id,
                                        orderId: order.id,
                                        type: 'AVAILABLE_OUT',
                                        amount: -commission.amount,
                                        description: `Clawback Laba Cair (Refund Pembeli): ${order.orderNumber}`,
                                        availableBefore: merchant.availableBalance,
                                        availableAfter: updatedMerchant.availableBalance,
                                        escrowBefore: updatedMerchant.escrowBalance,
                                        escrowAfter: updatedMerchant.escrowBalance
                                    }
                                });
                            }
                        }
                        else if (beneficiary.role === 'SUPER_ADMIN' || beneficiary.role === 'ADMIN_STAFF') {
                            await tx.user.update({
                                where: { id: beneficiary.id },
                                data: { balance: { decrement: commission.amount } }
                            });
                            await tx.balanceTransaction.create({
                                data: {
                                    userId: beneficiary.id,
                                    type: 'REFUND',
                                    amount: -commission.amount,
                                    description: `Clawback Profit Platform (Refund): ${order.orderNumber}`
                                }
                            });
                        }
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('digiflazz-fulfillment')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        subscriptions_service_1.SubscriptionsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map