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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const schedule_1 = require("@nestjs/schedule");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    prisma;
    logger = new common_1.Logger(SubscriptionsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInvoices(search, status) {
        const where = {};
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { invoiceNo: { contains: search, mode: 'insensitive' } },
                { merchant: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }
        return this.prisma.invoice.findMany({
            where,
            include: {
                merchant: { select: { id: true, name: true, domain: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async confirmInvoice(id, operator) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { merchant: true }
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        if (invoice.status === 'PAID')
            throw new common_1.BadRequestException('Invoice already paid');
        return this.prisma.$transaction(async (tx) => {
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    confirmedBy: operator
                }
            });
            const durationDays = 30;
            const now = new Date();
            const currentExpiry = invoice.merchant.planExpiredAt || now;
            const baseDate = currentExpiry > now ? currentExpiry : now;
            const newExpiry = new Date(baseDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
            await tx.merchant.update({
                where: { id: invoice.merchantId },
                data: {
                    plan: invoice.plan,
                    planExpiredAt: newExpiry,
                    status: 'ACTIVE'
                }
            });
            await tx.subscriptionHistory.create({
                data: {
                    merchantId: invoice.merchantId,
                    oldPlan: invoice.merchant.plan,
                    newPlan: invoice.plan,
                    startDate: baseDate,
                    endDate: newExpiry,
                    amount: invoice.totalAmount,
                    note: `Manual Confirmation of Invoice ${invoice.invoiceNo}`
                }
            });
            return updatedInvoice;
        });
    }
    async rejectInvoice(id, notes) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return this.prisma.invoice.update({
            where: { id },
            data: {
                status: 'UNPAID',
                notes: notes,
                proofUrl: null
            }
        });
    }
    async updateMerchantPlanManual(merchantId, plan, durationDays, operator) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant not found');
        const now = new Date();
        const newExpiry = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000));
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.merchant.update({
                where: { id: merchantId },
                data: {
                    plan: plan,
                    planExpiredAt: newExpiry,
                    status: 'ACTIVE'
                }
            });
            await tx.subscriptionHistory.create({
                data: {
                    merchantId,
                    oldPlan: merchant.plan,
                    newPlan: plan,
                    startDate: now,
                    endDate: newExpiry,
                    amount: 0,
                    note: `Manual adjustment by ${operator}`
                }
            });
            return updated;
        });
    }
    async getPlanFeatures() {
        const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'saas_plan_features' } });
        if (!setting) {
            return {
                FREE: { maxProducts: 10, customDomain: false, multiUser: false },
                PRO: { maxProducts: 50, customDomain: true, multiUser: false, price: 74917 },
                LEGEND: { maxProducts: 500, customDomain: true, multiUser: true, price: 82250 },
                SUPREME: { maxProducts: 99999, customDomain: true, multiUser: true, whiteLabel: true, price: 99917 }
            };
        }
        return JSON.parse(setting.value);
    }
    async getMerchantPlanFeatures(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            select: { plan: true, planExpiredAt: true }
        });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant tidak ditemukan');
        const now = new Date();
        const isExpired = merchant.planExpiredAt && merchant.planExpiredAt < now;
        const allFeatures = await this.getPlanFeatures();
        const planFeatures = allFeatures[merchant.plan || 'FREE'] || allFeatures['FREE'];
        return {
            ...planFeatures,
            isExpired,
            plan: merchant.plan
        };
    }
    async checkFeatureLimit(merchantId, feature) {
        const features = await this.getMerchantPlanFeatures(merchantId);
        if (features.isExpired) {
            throw new common_1.BadRequestException('Masa aktif paket Anda telah habis. Silakan lakukan perpanjangan.');
        }
        if (feature === 'multiUser' && !features.multiUser) {
            throw new common_1.BadRequestException('Paket Anda tidak mendukung fitur Multi-User (Staff). Silakan upgrade ke LEGEND/SUPREME.');
        }
        if (feature === 'whiteLabel' && !features.whiteLabel) {
            throw new common_1.BadRequestException('Paket Anda tidak mendukung fitur White-Label. Silakan upgrade ke SUPREME.');
        }
        if (feature === 'customDomain' && !features.customDomain) {
            throw new common_1.BadRequestException('Paket Anda tidak mendukung fitur Custom Domain. Silakan upgrade ke PRO+');
        }
        if (feature === 'maxProducts') {
            const count = await this.prisma.merchantProductPrice.count({
                where: { merchantId, isActive: true }
            });
            if (features.maxProducts !== undefined && count >= features.maxProducts) {
                throw new common_1.BadRequestException(`Limit produk aktif terlampaui (${count}/${features.maxProducts}). Silakan upgrade paket Anda.`);
            }
        }
        return true;
    }
    async updatePlanFeatures(features, operator) {
        return this.prisma.systemSetting.upsert({
            where: { key: 'saas_plan_features' },
            update: { value: JSON.stringify(features), updatedBy: operator },
            create: { key: 'saas_plan_features', value: JSON.stringify(features), group: 'SAAS', updatedBy: operator }
        });
    }
    async getSaaSPerformance() {
        const invoices = await this.prisma.invoice.findMany({
            where: { status: 'PAID' },
            select: { totalAmount: true, paidAt: true }
        });
        const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
        const activeMerchants = await this.prisma.merchant.count({
            where: { planExpiredAt: { gt: new Date() }, status: 'ACTIVE' }
        });
        const expiredMerchants = await this.prisma.merchant.count({
            where: { planExpiredAt: { lte: new Date() } }
        });
        const churnRate = activeMerchants + expiredMerchants > 0
            ? (expiredMerchants / (activeMerchants + expiredMerchants)) * 100
            : 0;
        return {
            totalRevenue,
            activeMerchants,
            expiredMerchants,
            churnRate: churnRate.toFixed(2) + '%'
        };
    }
    async handleSaaSCron() {
        this.logger.log('Menjalankan pengecekan harian untuk Subscription SaaS...');
        const now = new Date();
        const expiredMerchants = await this.prisma.merchant.findMany({
            where: { planExpiredAt: { lte: now }, status: 'ACTIVE' }
        });
        for (const merchant of expiredMerchants) {
            await this.prisma.merchant.update({
                where: { id: merchant.id },
                data: { status: 'INACTIVE' }
            });
            this.logger.log(`Men-suspend merchant ${merchant.name} (${merchant.id}) karena plan kedaluwarsa.`);
        }
        const overdueInvoices = await this.prisma.invoice.findMany({
            where: { dueDate: { lt: now }, status: { in: ['UNPAID', 'PENDING'] } }
        });
        for (const invoice of overdueInvoices) {
            await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: { status: 'OVERDUE' }
            });
            this.logger.log(`Tandai invoice ${invoice.invoiceNo} sebagai OVERDUE.`);
        }
    }
    async createManualInvoice(merchantId, plan, amount, dueDate, operator) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant tidak ditemukan');
        const invoiceNo = `S-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
        return this.prisma.invoice.create({
            data: {
                merchantId,
                invoiceNo,
                plan,
                amount,
                tax: 0,
                totalAmount: amount,
                status: 'UNPAID',
                dueDate: new Date(dueDate),
                notes: `Dibuat secara manual oleh ${operator}`
            }
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsService.prototype, "handleSaaSCron", null);
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map