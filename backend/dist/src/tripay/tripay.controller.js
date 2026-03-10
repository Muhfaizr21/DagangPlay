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
exports.TripayController = void 0;
const common_1 = require("@nestjs/common");
const tripay_service_1 = require("./tripay.service");
const prisma_service_1 = require("../prisma.service");
const digiflazz_service_1 = require("../admin/digiflazz/digiflazz.service");
let TripayController = class TripayController {
    tripayService;
    prisma;
    digiflazz;
    constructor(tripayService, prisma, digiflazz) {
        this.tripayService = tripayService;
        this.prisma = prisma;
        this.digiflazz = digiflazz;
    }
    async getPaymentChannels() {
        return this.tripayService.getPaymentChannels();
    }
    async tripayCallback(signature, req, res) {
        try {
            const rawBody = JSON.stringify(req.body);
            const isValid = this.tripayService.verifySignature(signature, rawBody);
            if (!isValid) {
                console.warn('[TripayCallback] Invalid signature from', req.ip);
                return res.status(common_1.HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }
            const data = req.body;
            const ref = data.merchant_ref;
            console.log(`[TripayCallback] Received ${data.status} for Ref: ${ref}`);
            if (data.status === 'PAID') {
                if (ref.startsWith('ORD-')) {
                    const order = await this.prisma.order.findUnique({
                        where: { orderNumber: ref }
                    });
                    if (order && order.paymentStatus !== 'PAID') {
                        const modalPrice = order.merchantModalPrice || order.sellingPrice;
                        const profit = order.sellingPrice - modalPrice;
                        await this.prisma.$transaction(async (tx) => {
                            await tx.order.update({
                                where: { id: order.id },
                                data: {
                                    paymentStatus: 'PAID',
                                    paidAt: new Date()
                                }
                            });
                            await tx.payment.update({
                                where: { orderId: order.id },
                                data: {
                                    status: 'PAID',
                                    paidAt: new Date(),
                                    tripayResponse: data
                                }
                            });
                            if (profit > 0) {
                                const merchant = await tx.merchant.findUnique({
                                    where: { id: order.merchantId },
                                    select: { ownerId: true }
                                });
                                if (merchant) {
                                    const user = await tx.user.update({
                                        where: { id: merchant.ownerId },
                                        data: { balance: { increment: profit } }
                                    });
                                    await tx.balanceTransaction.create({
                                        data: {
                                            userId: merchant.ownerId,
                                            type: 'COMMISSION',
                                            amount: profit,
                                            balanceBefore: user.balance - profit,
                                            balanceAfter: user.balance,
                                            orderId: order.id,
                                            description: `Profit penjualan ${order.orderNumber}`
                                        }
                                    });
                                }
                            }
                        });
                        try {
                            console.log(`[TripayCallback] Triggering fulfillment for order: ${order.orderNumber}`);
                            await this.digiflazz.placeOrder(order.id);
                        }
                        catch (fulfillErr) {
                            console.error(`[TripayCallback] Fulfillment failed for ${order.orderNumber}:`, fulfillErr.message);
                        }
                    }
                }
                else if (ref.startsWith('DEP-')) {
                    const depositId = ref.replace('DEP-', '');
                    const deposit = await this.prisma.deposit.findUnique({
                        where: { id: depositId }
                    });
                    if (deposit && deposit.status !== 'CONFIRMED') {
                        await this.prisma.$transaction(async (tx) => {
                            await tx.deposit.update({
                                where: { id: deposit.id },
                                data: {
                                    status: 'CONFIRMED',
                                    tripayResponse: data
                                }
                            });
                            const user = await tx.user.update({
                                where: { id: deposit.userId },
                                data: { balance: { increment: deposit.amount } }
                            });
                            await tx.balanceTransaction.create({
                                data: {
                                    userId: deposit.userId,
                                    type: 'DEPOSIT',
                                    amount: deposit.amount,
                                    balanceBefore: user.balance - deposit.amount,
                                    balanceAfter: user.balance,
                                    depositId: deposit.id,
                                    description: `Deposit via Tripay (${data.payment_name})`
                                }
                            });
                            const superAdmin = await tx.user.findFirst({
                                where: { role: 'SUPER_ADMIN' }
                            });
                            if (superAdmin) {
                                await tx.user.update({
                                    where: { id: superAdmin.id },
                                    data: { balance: { decrement: deposit.amount } }
                                });
                            }
                        });
                        console.log(`[TripayCallback] Deposit ${depositId} confirmed.`);
                    }
                }
                else if (ref.startsWith('INV-')) {
                    const invoice = await this.prisma.invoice.findUnique({
                        where: { invoiceNo: ref }
                    });
                    if (invoice && invoice.status !== 'PAID') {
                        await this.prisma.$transaction(async (tx) => {
                            await tx.invoice.update({
                                where: { id: invoice.id },
                                data: { status: 'PAID', paidAt: new Date(), tripayResponse: data }
                            });
                            const expireAt = new Date();
                            expireAt.setDate(expireAt.getDate() + 30);
                            await tx.merchant.update({
                                where: { id: invoice.merchantId },
                                data: {
                                    plan: invoice.plan,
                                    planExpiredAt: expireAt,
                                    status: 'ACTIVE'
                                }
                            });
                            await tx.subscriptionHistory.create({
                                data: {
                                    merchantId: invoice.merchantId,
                                    newPlan: invoice.plan,
                                    amount: invoice.totalAmount,
                                    startDate: new Date(),
                                    endDate: expireAt,
                                    note: `Subscription via Tripay (${ref})`
                                }
                            });
                        });
                        console.log(`[TripayCallback] Invoice ${ref} paid. Merchant plan upgraded.`);
                    }
                }
            }
            return res.status(common_1.HttpStatus.OK).json({ success: true });
        }
        catch (error) {
            console.error('[TripayCallback] Error:', error.message);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }
};
exports.TripayController = TripayController;
__decorate([
    (0, common_1.Get)('payment-channels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TripayController.prototype, "getPaymentChannels", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Headers)('x-callback-signature')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TripayController.prototype, "tripayCallback", null);
exports.TripayController = TripayController = __decorate([
    (0, common_1.Controller)('tripay'),
    __metadata("design:paramtypes", [tripay_service_1.TripayService,
        prisma_service_1.PrismaService,
        digiflazz_service_1.DigiflazzService])
], TripayController);
//# sourceMappingURL=tripay.controller.js.map