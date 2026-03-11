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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const public_orders_service_1 = require("../../public/orders/public-orders.service");
const pagination_1 = require("../../common/utils/pagination");
let TransactionsService = class TransactionsService {
    prisma;
    publicOrders;
    constructor(prisma, publicOrders) {
        this.prisma = prisma;
        this.publicOrders = publicOrders;
    }
    async getAllTransactions(filters) {
        const { search, paymentStatus, fulfillmentStatus, merchantId, productId, startDate, endDate, page = 1, limit = 50 } = filters;
        const where = {};
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { gameUserName: { contains: search, mode: 'insensitive' } },
                { gameUserId: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (paymentStatus && paymentStatus !== 'ALL')
            where.paymentStatus = paymentStatus;
        if (fulfillmentStatus && fulfillmentStatus !== 'ALL')
            where.fulfillmentStatus = fulfillmentStatus;
        if (merchantId && merchantId !== 'ALL')
            where.merchantId = merchantId;
        if (productId && productId !== 'ALL')
            where.productId = productId;
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        return (0, pagination_1.paginate)(this.prisma.order, {
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                merchant: { select: { id: true, name: true } },
                payment: true,
            },
        }, { page, perPage: limit });
    }
    async getTransactionDetail(id) {
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
        if (!order)
            throw new common_1.NotFoundException('Transaksi tidak ditemukan');
        return order;
    }
    async retryTransaction(id, operatorId) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Transaksi tidak ditemukan');
        if (order.fulfillmentStatus === 'SUCCESS')
            throw new common_1.BadRequestException('Transaksi sudah sukses');
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
    async refundTransaction(id, operatorId) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Transaksi tidak ditemukan');
        if (order.fulfillmentStatus === 'REFUNDED')
            throw new common_1.BadRequestException('Trx sudah direfund');
        if (order.paymentStatus !== 'PAID')
            throw new common_1.BadRequestException('Trx belum dibayar, tidak bisa refund');
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
            await this.publicOrders.reverseCommission(id, tx);
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
    async markAsFraud(id, reason, operatorId) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Transaksi tidak ditemukan');
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
    async overrideStatus(id, fulfillmentStatus, paymentStatus, reason, operatorId) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id } });
            if (!order)
                throw new common_1.NotFoundException();
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
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        public_orders_service_1.PublicOrdersService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map