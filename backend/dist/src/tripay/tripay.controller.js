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
const whatsapp_service_1 = require("../common/notifications/whatsapp.service");
let TripayController = class TripayController {
    tripayService;
    prisma;
    digiflazz;
    whatsappService;
    constructor(tripayService, prisma, digiflazz, whatsappService) {
        this.tripayService = tripayService;
        this.prisma = prisma;
        this.digiflazz = digiflazz;
        this.whatsappService = whatsappService;
    }
    async getPaymentChannels() {
        return this.tripayService.getPaymentChannels();
    }
    async tripayCallback(signature, req, res) {
        try {
            const allowedIps = ['95.111.200.230', '127.0.0.1'];
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            const isAllowed = allowedIps.some(ip => clientIp.includes(ip)) || process.env.NODE_ENV !== 'production';
            if (!isAllowed) {
                console.warn(`[TripayCallback] Blocked unauthorized IP: ${clientIp}`);
                return res.status(common_1.HttpStatus.FORBIDDEN).json({ success: false, message: 'Unauthorized IP Source' });
            }
            const rawBody = req.rawBody || JSON.stringify(req.body);
            const isValid = this.tripayService.verifySignature(signature, rawBody);
            if (!isValid) {
                console.warn('[TripayCallback] Invalid signature signature verification failed.');
                return res.status(common_1.HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }
            const data = req.body;
            const ref = data.merchant_ref;
            console.log(`[TripayCallback] Received ${data.status} for Ref: ${ref}`);
            if (data.status === 'PAID') {
                if (ref.startsWith('ORD-')) {
                    try {
                        const order = await this.prisma.order.findUnique({
                            where: { orderNumber: ref },
                            include: { user: true }
                        });
                        if (!order) {
                            console.warn(`[TripayCallback] Order ${ref} not found.`);
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        }
                        if (order.paymentStatus !== 'PENDING') {
                            console.log(`[TripayCallback] Order ${ref} already processed (${order.paymentStatus}). Skipping.`);
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        }
                        const modalPrice = order.merchantModalPrice || order.sellingPrice;
                        const rawProfit = order.sellingPrice - modalPrice;
                        const tripayFeeMerchant = Number(data.fee_merchant) || 0;
                        const tripayFeeCustomer = Number(data.fee_customer) || 0;
                        const totalTripayFee = tripayFeeMerchant + tripayFeeCustomer;
                        const netProfit = Math.max(0, rawProfit - tripayFeeMerchant);
                        await this.prisma.$transaction(async (tx) => {
                            const updatedOrder = await tx.order.update({
                                where: { id: order.id, paymentStatus: 'PENDING' },
                                data: {
                                    paymentStatus: 'PAID',
                                    paidAt: new Date()
                                }
                            });
                            await tx.payment.update({
                                where: { orderId: order.id },
                                data: {
                                    status: 'PAID',
                                    fee: totalTripayFee,
                                    paidAt: new Date(),
                                    tripayResponse: data
                                }
                            });
                            if (netProfit > 0) {
                                const merchant = await tx.merchant.findUnique({
                                    where: { id: order.merchantId },
                                    select: { ownerId: true, settings: true }
                                });
                                if (merchant) {
                                    let platformFeePct = 0;
                                    if (merchant.settings && typeof merchant.settings === 'object' && 'platformFee' in merchant.settings) {
                                        platformFeePct = Number(merchant.settings.platformFee) || 0;
                                    }
                                    const platformFeeAmount = Math.round(netProfit * (platformFeePct / 100));
                                    const merchantNetProfit = netProfit - platformFeeAmount;
                                    if (merchantNetProfit > 0) {
                                        const user = await tx.user.update({
                                            where: { id: merchant.ownerId },
                                            data: { balance: { increment: merchantNetProfit } }
                                        });
                                        await tx.commission.create({
                                            data: {
                                                orderId: order.id,
                                                userId: merchant.ownerId,
                                                type: 'MERCHANT_RETAIL_PROFIT',
                                                amount: merchantNetProfit,
                                                status: 'SETTLED',
                                                settledAt: new Date()
                                            }
                                        });
                                        await tx.balanceTransaction.create({
                                            data: {
                                                userId: merchant.ownerId,
                                                type: 'COMMISSION',
                                                amount: merchantNetProfit,
                                                balanceBefore: Number(user.balance) - merchantNetProfit,
                                                balanceAfter: Number(user.balance),
                                                orderId: order.id,
                                                description: `Profit penjualan bersih ${order.orderNumber} (Tripay M-Fee: ${tripayFeeMerchant}, Platform: ${platformFeeAmount})`
                                            }
                                        });
                                    }
                                    const saasMarkup = Math.max(0, Number(order.merchantModalPrice || 0) - Number(order.basePrice || 0));
                                    const totalPlatformProfit = platformFeeAmount + saasMarkup;
                                    if (totalPlatformProfit > 0) {
                                        const superAdmin = await tx.user.findFirst({
                                            where: { role: 'SUPER_ADMIN' },
                                            orderBy: { createdAt: 'asc' }
                                        });
                                        if (superAdmin) {
                                            const su = await tx.user.update({
                                                where: { id: superAdmin.id },
                                                data: { balance: { increment: totalPlatformProfit } }
                                            });
                                            await tx.commission.create({
                                                data: {
                                                    orderId: order.id,
                                                    userId: superAdmin.id,
                                                    type: 'PLATFORM_FEE',
                                                    amount: totalPlatformProfit,
                                                    status: 'SETTLED',
                                                    settledAt: new Date()
                                                }
                                            });
                                            await tx.balanceTransaction.create({
                                                data: {
                                                    userId: superAdmin.id,
                                                    type: 'COMMISSION',
                                                    amount: totalPlatformProfit,
                                                    balanceBefore: Number(su.balance) - totalPlatformProfit,
                                                    balanceAfter: Number(su.balance),
                                                    orderId: order.id,
                                                    description: `Platform Profit ${order.orderNumber} (Fee: ${platformFeeAmount}, Markup: ${saasMarkup})`
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        });
                        this.whatsappService.sendMessage(order.user.phone || '', `✅ *PEMBAYARAN DITERIMA - ${order.orderNumber}*\n\n` +
                            `Terima kasih, pembayaran sebesar *Rp ${order.totalPrice.toLocaleString('id-ID')}* telah kami terima.\n` +
                            `Pesanan *${order.productName} - ${order.productSkuName}* sedang diproses ke akun Anda.\n\n` +
                            `Tunggu update selanjutnya ya!`).catch(err => console.error(`[TripayCallback] Failed notification:`, err.message));
                        const adminMarkup = Math.max(0, Number(order.merchantModalPrice || 0) - Number(order.basePrice || 0));
                        this.whatsappService.sendAdminSummary(`💰 *PEMBAYARAN SUKSES*\n` +
                            `Order: ${order.orderNumber}\n` +
                            `Produk: ${order.productName}\n` +
                            `Total: Rp ${order.totalPrice.toLocaleString('id-ID')}\n` +
                            `Metode: ${order.paymentMethod}\n` +
                            `Markup SA: Rp ${adminMarkup.toLocaleString('id-ID')}`).catch(() => { });
                        try {
                            console.log(`[TripayCallback] Triggering fulfillment for order: ${order.orderNumber}`);
                            await this.digiflazz.placeOrder(order.id);
                        }
                        catch (fulfillErr) {
                            console.error(`[TripayCallback] Fulfillment failed for ${order.orderNumber}:`, fulfillErr.message);
                        }
                    }
                    catch (err) {
                        if (err.code === 'P2025') {
                            console.log(`[TripayCallback] Race condition prevented for order ${ref}. Already processed.`);
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        }
                        throw err;
                    }
                }
                else if (ref.startsWith('DEP-')) {
                    try {
                        const depositId = ref.replace('DEP-', '');
                        const deposit = await this.prisma.deposit.findUnique({
                            where: { id: depositId }
                        });
                        if (deposit && deposit.status === 'PENDING') {
                            await this.prisma.$transaction(async (tx) => {
                                const updatedDeposit = await tx.deposit.update({
                                    where: { id: deposit.id, status: 'PENDING' },
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
                                        balanceBefore: Number(user.balance) - Number(deposit.amount),
                                        balanceAfter: Number(user.balance),
                                        depositId: deposit.id,
                                        description: `Deposit via Tripay (${data.payment_name})`
                                    }
                                });
                            });
                            console.log(`[TripayCallback] Deposit ${depositId} confirmed.`);
                        }
                    }
                    catch (err) {
                        if (err.code === 'P2025')
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                }
                else if (ref.startsWith('INV-')) {
                    try {
                        const invoice = await this.prisma.invoice.findUnique({
                            where: { invoiceNo: ref }
                        });
                        if (invoice && (invoice.status === 'UNPAID' || invoice.status === 'PENDING')) {
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
                    catch (err) {
                        if (err.code === 'P2025')
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                }
            }
            else if (data.status === 'EXPIRED' || data.status === 'FAILED') {
                if (ref.startsWith('ORD-')) {
                    try {
                        const order = await this.prisma.order.findUnique({
                            where: { orderNumber: ref }
                        });
                        if (order && order.paymentStatus === 'PENDING') {
                            await this.prisma.$transaction(async (tx) => {
                                await tx.order.update({
                                    where: { id: order.id, paymentStatus: 'PENDING' },
                                    data: { paymentStatus: data.status }
                                });
                                await tx.payment.update({
                                    where: { orderId: order.id },
                                    data: { status: data.status, tripayResponse: data }
                                });
                            });
                            console.log(`[TripayCallback] Order ${ref} updated to ${data.status}.`);
                        }
                    }
                    catch (err) {
                        if (err.code === 'P2025')
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                }
                else if (ref.startsWith('DEP-')) {
                    try {
                        const depositId = ref.replace('DEP-', '');
                        const deposit = await this.prisma.deposit.findUnique({
                            where: { id: depositId }
                        });
                        if (deposit && deposit.status === 'PENDING') {
                            await this.prisma.$transaction(async (tx) => {
                                await tx.deposit.update({
                                    where: { id: deposit.id, status: 'PENDING' },
                                    data: { status: data.status, tripayResponse: data }
                                });
                            });
                            console.log(`[TripayCallback] Deposit ${depositId} updated to ${data.status}.`);
                        }
                    }
                    catch (err) {
                        if (err.code === 'P2025')
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                }
                else if (ref.startsWith('INV-')) {
                    try {
                        const invoice = await this.prisma.invoice.findUnique({
                            where: { invoiceNo: ref }
                        });
                        if (invoice && (invoice.status === 'UNPAID' || invoice.status === 'PENDING')) {
                            await this.prisma.$transaction(async (tx) => {
                                await tx.invoice.update({
                                    where: { id: invoice.id },
                                    data: { status: data.status, tripayResponse: data }
                                });
                            });
                            console.log(`[TripayCallback] Invoice ${ref} updated to ${data.status}.`);
                        }
                    }
                    catch (err) {
                        if (err.code === 'P2025')
                            return res.status(common_1.HttpStatus.OK).json({ success: true });
                        throw err;
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
        digiflazz_service_1.DigiflazzService,
        whatsapp_service_1.WhatsappService])
], TripayController);
//# sourceMappingURL=tripay.controller.js.map