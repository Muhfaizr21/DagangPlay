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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let SubscriptionService = class SubscriptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSubscriptionStatus(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant not found');
        const invoice = await this.prisma.invoice.findFirst({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
        return {
            plan: merchant.plan,
            planExpiredAt: merchant.planExpiredAt,
            isActive: merchant.planExpiredAt ? new Date() < new Date(merchant.planExpiredAt) : false,
            latestInvoice: invoice
        };
    }
    async getInvoiceHistory(merchantId) {
        return this.prisma.invoice.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createInvoice(merchantId, data) {
        return this.prisma.invoice.create({
            data: {
                merchantId,
                invoiceNo: 'INV-' + Date.now(),
                plan: data.plan || 'PRO',
                amount: data.amount || 250000,
                totalAmount: data.amount || 250000,
                status: 'UNPAID',
                dueDate: new Date(Date.now() + 86400000 * 3)
            }
        });
    }
    async uploadProof(merchantId, invoiceId, proofUrl) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, merchantId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                proofUrl,
                status: 'PENDING'
            }
        });
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map