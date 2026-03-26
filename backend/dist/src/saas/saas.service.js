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
exports.SaasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const schedule_1 = require("@nestjs/schedule");
let SaasService = class SaasService {
    prisma;
    webhookQueue;
    constructor(prisma, webhookQueue) {
        this.prisma = prisma;
        this.webhookQueue = webhookQueue;
    }
    async handleDailySettlement() {
        console.log('[SaasService] Menjalankan cron job Daily Settlement (Escrow -> Available)...');
        const merchants = await this.prisma.merchant.findMany({
            where: { escrowBalance: { gt: 0 } }
        });
        for (const m of merchants) {
            const amountToSettle = m.escrowBalance;
            try {
                await this.prisma.$transaction(async (tx) => {
                    await tx.merchant.update({
                        where: { id: m.id },
                        data: {
                            escrowBalance: { decrement: amountToSettle },
                            availableBalance: { increment: amountToSettle }
                        }
                    });
                    await tx.merchantLedgerMovement.create({
                        data: {
                            merchantId: m.id,
                            type: 'SETTLEMENT',
                            amount: amountToSettle,
                            description: 'Pencairan Otomatis Saldo Escrow Harian H-1',
                            escrowBefore: m.escrowBalance,
                            escrowAfter: 0,
                            availableBefore: m.availableBalance,
                            availableAfter: m.availableBalance + amountToSettle
                        }
                    });
                });
                console.log(`[SaasService] Selesai: Rp ${amountToSettle} dipindahkan untuk merchant ${m.name}`);
            }
            catch (e) {
                console.error(`[SaasService] Gagal memindahkan escrow merchant ${m.name}`, e);
            }
        }
    }
    async getGlobalLedgers() {
        const merchants = await this.prisma.merchant.findMany({
            select: {
                id: true,
                name: true,
                escrowBalance: true,
                availableBalance: true,
            }
        });
        const totalEscrow = merchants.reduce((sum, m) => sum + m.escrowBalance, 0);
        const totalAvailable = merchants.reduce((sum, m) => sum + m.availableBalance, 0);
        return { totalEscrow, totalAvailable, merchants };
    }
    async getDeadLetterQueue() {
        return this.prisma.deadLetterQueue.findMany({
            where: { isResolved: false },
            orderBy: { createdAt: 'desc' }
        });
    }
    async requeueDLQJob(dlqId) {
        const job = await this.prisma.deadLetterQueue.findUnique({ where: { id: dlqId } });
        if (!job)
            throw new common_1.NotFoundException('DLQ Job Not Found');
        if (job.queueName === 'webhook') {
            await this.webhookQueue.add('Requeued_Delivery', job.jobData);
        }
        await this.prisma.deadLetterQueue.update({
            where: { id: dlqId },
            data: { isResolved: true }
        });
        return { success: true, message: 'Job Requeued Successfully.' };
    }
    async getMerchantDomainsStatus() {
        return this.prisma.merchant.findMany({
            where: { domain: { not: null } },
            select: {
                id: true,
                name: true,
                domain: true,
                forceHttps: true,
            }
        });
    }
    async getMerchantLedger(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            select: {
                escrowBalance: true,
                availableBalance: true,
                autoPayoutEnabled: true,
                autoPayoutSchedule: true,
                autoPayoutThreshold: true
            }
        });
        const recentMovements = await this.prisma.merchantLedgerMovement.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return { ...merchant, movements: recentMovements };
    }
    async updateAutoPayoutConfig(body) {
        const { merchantId, enabled, threshold, schedule } = body;
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: {
                autoPayoutEnabled: enabled,
                autoPayoutThreshold: threshold,
                autoPayoutSchedule: schedule
            }
        });
    }
    async getMerchantWebhookLogs(merchantId) {
        return this.prisma.webhookDeliveryLog.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' },
            take: 25
        });
    }
    async retryMerchantWebhook(logId) {
        const log = await this.prisma.webhookDeliveryLog.findUnique({
            where: { id: logId }
        });
        if (!log)
            throw new common_1.NotFoundException('Log not found');
        await this.webhookQueue.add('ManualRetries', {
            merchantId: log.merchantId,
            endpointUrl: log.endpointUrl,
            event: log.event,
            payload: log.requestPayload
        });
        return { success: true, message: 'Webhook sent to queue for retrying' };
    }
};
exports.SaasService = SaasService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SaasService.prototype, "handleDailySettlement", null);
exports.SaasService = SaasService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('webhook')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], SaasService);
//# sourceMappingURL=saas.service.js.map