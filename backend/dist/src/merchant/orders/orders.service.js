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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const digiflazz_service_1 = require("../../admin/digiflazz/digiflazz.service");
const subscriptions_service_1 = require("../../admin/subscriptions/subscriptions.service");
let OrdersService = class OrdersService {
    prisma;
    digiflazz;
    subscriptionsService;
    constructor(prisma, digiflazz, subscriptionsService) {
        this.prisma = prisma;
        this.digiflazz = digiflazz;
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
        if (merchant.owner.balance < modalPrice) {
            throw new common_1.BadRequestException('Saldo Anda tidak mencukupi. Silakan top-up terlebih dahulu.');
        }
        const orderNumber = `DIR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: merchant.ownerId },
                data: { balance: { decrement: modalPrice } }
            });
            await tx.balanceTransaction.create({
                data: {
                    userId: merchant.ownerId,
                    type: 'PURCHASE',
                    amount: -modalPrice,
                    description: `Pembelian Produk: ${sku.product.name} - ${sku.name} (${orderNumber})`
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
            try {
                await this.digiflazz.placeOrder(order.id);
            }
            catch (err) {
                console.error('[DirectOrder] Fulfillment failed, but order is paid. Merchant should retry manually.', err);
            }
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
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.fulfillmentStatus === 'SUCCESS')
            throw new common_1.BadRequestException('Order already SUCCESS');
        if (order.paymentStatus !== 'PAID')
            throw new common_1.BadRequestException('Order belum terbayar, tidak bisa diretry');
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
        try {
            await this.digiflazz.placeOrder(orderId);
        }
        catch (err) {
            console.error('[RetryOrder] Retry fulfillment failed:', err);
        }
        const updated = await this.prisma.order.findUnique({ where: { id: orderId } });
        return { message: 'Order retry triggered via Digiflazz', order: updated };
    }
    async refundOrder(merchantId, orderId, reason) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, merchantId }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.fulfillmentStatus === 'SUCCESS' || order.paymentStatus === 'REFUNDED') {
            throw new common_1.BadRequestException('Order cannot be refunded (status is ' + order.fulfillmentStatus + ')');
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        digiflazz_service_1.DigiflazzService,
        subscriptions_service_1.SubscriptionsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map