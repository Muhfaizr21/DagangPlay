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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma.service");
const whatsapp_service_1 = require("../notifications/whatsapp.service");
let TasksService = TasksService_1 = class TasksService {
    prisma;
    whatsappService;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    async handleCleanup() {
        this.logger.log('Starting daily cleanup task...');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const expiredInvoices = await this.prisma.invoice.updateMany({
                where: {
                    status: 'UNPAID',
                    createdAt: { lt: thirtyDaysAgo },
                },
                data: {
                    status: 'OVERDUE',
                },
            });
            this.logger.log(`Cleaned up ${expiredInvoices.count} expired invoices.`);
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            const deletedLogs = await this.prisma.auditLog.deleteMany({
                where: {
                    createdAt: { lt: ninetyDaysAgo },
                    action: { notIn: ['SUBSCRIBE_MERCHANT', 'WITHDRAWAL_COMPLETED', 'ORDER_SUCCESS'] }
                },
            });
            this.logger.log(`Deleted ${deletedLogs.count} old audit logs.`);
            const deletedOtps = await this.prisma.otpVerification.deleteMany({
                where: {
                    expiresAt: { lt: new Date() },
                },
            });
            this.logger.log(`Deleted ${deletedOtps.count} expired OTP tokens.`);
            const thirtyDaysAgoLogs = new Date();
            thirtyDaysAgoLogs.setDate(thirtyDaysAgoLogs.getDate() - 30);
            await this.prisma.loginAttempt.deleteMany({
                where: { createdAt: { lt: thirtyDaysAgoLogs } }
            });
            await this.prisma.userSession.deleteMany({
                where: { expiresAt: { lt: new Date() } }
            });
        }
        catch (error) {
            this.logger.error('Error during cleanup task:', error);
        }
    }
    async handleFrequentChecks() {
        this.logger.log('Starting frequent checks (Expired Orders & Plans)...');
        try {
            const expiredOrders = await this.prisma.order.updateMany({
                where: {
                    paymentStatus: 'PENDING',
                    expiredAt: { lt: new Date() }
                },
                data: {
                    paymentStatus: 'EXPIRED',
                    fulfillmentStatus: 'FAILED',
                    failReason: 'Pesanan dibatalkan otomatis karena melewati batas waktu pembayaran.'
                }
            });
            if (expiredOrders.count > 0)
                this.logger.log(`Cancelled ${expiredOrders.count} expired orders.`);
            const gracePeriodCutoff = new Date();
            gracePeriodCutoff.setDate(gracePeriodCutoff.getDate() - 3);
            const expiredPlans = await this.prisma.merchant.updateMany({
                where: {
                    plan: { not: 'FREE' },
                    planExpiredAt: { lt: gracePeriodCutoff }
                },
                data: {
                    plan: 'FREE'
                }
            });
            if (expiredPlans.count > 0)
                this.logger.log(`Downgraded ${expiredPlans.count} merchants to FREE plan (after 3-day grace period).`);
            const pendingCommissions = await this.prisma.commission.findMany({
                where: {
                    status: 'PENDING',
                    order: { fulfillmentStatus: 'SUCCESS', paymentStatus: 'PAID' }
                },
                include: { user: { include: { ownedMerchant: true } } },
                take: 50
            });
            for (const comm of pendingCommissions) {
                await this.prisma.$transaction(async (tx) => {
                    const check = await tx.commission.findUnique({ where: { id: comm.id, status: 'PENDING' } });
                    if (!check)
                        return;
                    await tx.commission.update({ where: { id: comm.id }, data: { status: 'SETTLED', settledAt: new Date() } });
                    if (comm.user.role === 'MERCHANT' && comm.user.ownedMerchant) {
                        const mId = comm.user.ownedMerchant.id;
                        const merchant = await tx.merchant.findUnique({ where: { id: mId } });
                        if (merchant) {
                            const updatedMerchant = await tx.merchant.update({
                                where: { id: mId },
                                data: {
                                    escrowBalance: { decrement: comm.amount },
                                    availableBalance: { increment: comm.amount }
                                }
                            });
                            await tx.merchantLedgerMovement.create({
                                data: {
                                    merchantId: mId,
                                    orderId: comm.orderId,
                                    type: 'SETTLEMENT',
                                    amount: comm.amount,
                                    description: `Audit Settlement (Auto-Recovered): ${comm.orderId}`,
                                    availableBefore: merchant.availableBalance,
                                    availableAfter: updatedMerchant.availableBalance,
                                    escrowBefore: merchant.escrowBalance,
                                    escrowAfter: updatedMerchant.escrowBalance
                                }
                            });
                        }
                    }
                    else if (comm.user.role === 'SUPER_ADMIN') {
                        await tx.user.update({
                            where: { id: comm.userId },
                            data: { balance: { increment: comm.amount } }
                        });
                    }
                });
            }
            if (pendingCommissions.length > 0)
                this.logger.log(`Auto-settled ${pendingCommissions.length} orphaned commissions.`);
        }
        catch (error) {
            this.logger.error('Error during frequent checks:', error);
        }
    }
    async monitorFails() {
        const fifteenMinsAgo = new Date();
        fifteenMinsAgo.setMinutes(fifteenMinsAgo.getMinutes() - 15);
        try {
            const failedCount = await this.prisma.order.count({
                where: {
                    fulfillmentStatus: 'FAILED',
                    failedAt: { gte: fifteenMinsAgo }
                }
            });
            if (failedCount >= 3) {
                this.logger.error(`[ALERT] Detected ${failedCount} fulfillment failures in the last 15 minutes!`);
                await this.whatsappService.sendAdminSummary(`🚨 *CRITICAL ALERT: MASS FULFILLMENT FAILURE*\n\n` +
                    `Terdeteksi *${failedCount} pesanan GAGAL* diproses (fulfillment error) dalam 15 menit terakhir.\n\n` +
                    `Segera cek Dashboard / log sistem! Pastikan saldo Digiflazz mencukupi atau tidak ada maintenance dari supplier.`).catch(() => { });
            }
        }
        catch (e) {
            this.logger.error('Error monitoring failures:', e);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleCleanup", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleFrequentChecks", null);
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "monitorFails", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsappService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map