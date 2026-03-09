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
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrders(merchantId, filters) {
        const whereClause = { merchantId };
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
                customer: { select: { id: true, name: true, email: true } },
                reseller: { select: { id: true, name: true, email: true } },
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
                customer: { select: { id: true, name: true, email: true } },
                reseller: { select: { id: true, name: true, email: true } },
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
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { fulfillmentStatus: 'PROCESSING' }
        });
        await this.prisma.orderStatusHistory.create({
            data: {
                orderId,
                status: 'PROCESSING',
                note: 'Order retried manually by Merchant',
            }
        });
        return { message: 'Order added to retry queue', order: updated };
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
                    note: `Refunded manually: ${reason}`
                }
            });
            if (order.paymentStatus === 'PAID') {
                const buyerId = order.resellerId || order.userId;
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map