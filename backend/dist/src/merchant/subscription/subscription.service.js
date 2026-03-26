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
const tripay_service_1 = require("../../tripay/tripay.service");
let SubscriptionService = class SubscriptionService {
    prisma;
    tripay;
    constructor(prisma, tripay) {
        this.prisma = prisma;
        this.tripay = tripay;
    }
    async getSubscriptionStatus(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant not found');
        const invoice = await this.prisma.invoice.findFirst({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
        const latestHistory = await this.prisma.subscriptionHistory.findFirst({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
        const startedAt = latestHistory ? latestHistory.startDate : merchant.createdAt;
        return {
            plan: merchant.plan,
            planStartedAt: startedAt,
            planExpiredAt: merchant.planExpiredAt,
            isActive: !merchant.planExpiredAt || new Date() < new Date(merchant.planExpiredAt),
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
        const { plan, amount, method } = data;
        const invoiceNo = 'INV-' + Date.now();
        const invoice = await this.prisma.invoice.create({
            data: {
                merchantId,
                invoiceNo: invoiceNo,
                plan: plan || 'PRO',
                amount: amount || 250000,
                totalAmount: amount || 250000,
                status: 'UNPAID',
                dueDate: new Date(Date.now() + 86400000 * 3)
            }
        });
        const tripayMethod = method === 'QRIS' ? 'QRISC' : (method || 'QRISC');
        const tripayPayload = {
            method: tripayMethod,
            merchant_ref: invoiceNo,
            amount: invoice.totalAmount,
            customer_name: 'Merchant Partner',
            customer_email: 'merchant@dagangplay.com',
            order_items: [
                {
                    sku: 'SUB-' + invoice.plan,
                    name: `Subscription DagangPlay - ${invoice.plan}`,
                    price: invoice.totalAmount,
                    quantity: 1
                }
            ],
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/subscription`
        };
        try {
            const tripayRes = await this.tripay.requestTransaction(tripayPayload);
            return this.prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    tripayReference: tripayRes.data.reference,
                    tripayPaymentUrl: tripayRes.data.checkout_url,
                    tripayResponse: tripayRes.data
                }
            });
        }
        catch (err) {
            console.error('[SubscriptionService] Tripay error:', err);
            return invoice;
        }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, tripay_service_1.TripayService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map