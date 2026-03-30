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
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const digiflazz_service_1 = require("../admin/digiflazz/digiflazz.service");
const whatsapp_service_1 = require("../common/notifications/whatsapp.service");
let TripayController = class TripayController {
    tripayService;
    prisma;
    digiflazz;
    whatsappService;
    fulfillmentQueue;
    constructor(tripayService, prisma, digiflazz, whatsappService, fulfillmentQueue) {
        this.tripayService = tripayService;
        this.prisma = prisma;
        this.digiflazz = digiflazz;
        this.whatsappService = whatsappService;
        this.fulfillmentQueue = fulfillmentQueue;
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
            const data = req.body;
            const ref = data.merchant_ref;
            const rawBody = req.rawBody || JSON.stringify(req.body);
            if (!ref) {
                console.warn('[TripayCallback] Missing merchant_ref in payload.');
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({ success: false, message: 'Missing merchant_ref' });
            }
            let merchantId;
            if (ref.startsWith('ORD-')) {
                const order = await this.prisma.order.findUnique({ where: { orderNumber: ref }, select: { merchantId: true } });
                merchantId = order?.merchantId;
            }
            else if (ref.startsWith('DEP-')) {
                const depId = ref.replace('DEP-', '');
                const deposit = await this.prisma.deposit.findUnique({ where: { id: depId }, select: { merchantId: true } });
                merchantId = deposit?.merchantId;
            }
            else if (ref.startsWith('INV-')) {
                const invoice = await this.prisma.invoice.findUnique({ where: { invoiceNo: ref }, select: { merchantId: true } });
                merchantId = merchantId || invoice?.merchantId;
            }
            const isValid = await this.tripayService.verifySignature(signature, rawBody, merchantId);
            if (!isValid) {
                console.warn(`[TripayCallback] Invalid signature for Ref: ${ref} (Merchant: ${merchantId || 'PLATFORM'}). Verification failed.`);
                return res.status(common_1.HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }
            console.log(`[TripayCallback] Received ${data.status} for Ref: ${ref} (Merchant: ${merchantId || 'PLATFORM'})`);
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
                                        const updatedMerchantEscrow = await tx.merchant.update({
                                            where: { id: order.merchantId },
                                            data: { escrowBalance: { increment: merchantNetProfit } }
                                        });
                                        await tx.merchantLedgerMovement.create({
                                            data: {
                                                merchantId: order.merchantId,
                                                orderId: order.id,
                                                type: 'ESCROW_IN',
                                                amount: merchantNetProfit,
                                                description: `Laba Penjualan (Pending): ${order.orderNumber}`,
                                                availableBefore: updatedMerchantEscrow.availableBalance,
                                                availableAfter: updatedMerchantEscrow.availableBalance,
                                                escrowBefore: updatedMerchantEscrow.escrowBalance - merchantNetProfit,
                                                escrowAfter: updatedMerchantEscrow.escrowBalance
                                            }
                                        });
                                        await tx.commission.create({
                                            data: {
                                                orderId: order.id,
                                                userId: merchant.ownerId,
                                                type: 'MERCHANT_RETAIL_PROFIT',
                                                amount: merchantNetProfit,
                                                status: 'PENDING'
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
                                            await tx.commission.create({
                                                data: {
                                                    orderId: order.id,
                                                    userId: superAdmin.id,
                                                    type: 'PLATFORM_FEE',
                                                    amount: totalPlatformProfit,
                                                    status: 'PENDING'
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
                        await this.fulfillmentQueue.add('process-fulfillment', {
                            orderId: order.id
                        }, {
                            attempts: 5,
                            backoff: { type: 'exponential', delay: 5000 },
                            removeOnComplete: true
                        });
                        console.log(`[TripayQueue / Persisted] Enqueued fulfillment specifically for order: ${order.orderNumber}`);
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
                            where: { id: depositId },
                            include: { merchant: true }
                        });
                        if (deposit && deposit.status === 'PENDING') {
                            const tripayFeeMerchant = Number(data.fee_merchant) || 0;
                            const netDepositAmount = Math.max(0, Number(data.amount) - tripayFeeMerchant);
                            await this.prisma.$transaction(async (tx) => {
                                const updatedDeposit = await tx.deposit.update({
                                    where: { id: deposit.id, status: 'PENDING' },
                                    data: {
                                        status: 'CONFIRMED',
                                        tripayResponse: data
                                    }
                                });
                                const merchantPrior = await tx.merchant.findUnique({
                                    where: { id: deposit.merchantId }
                                });
                                const updatedMerchant = await tx.merchant.update({
                                    where: { id: deposit.merchantId },
                                    data: { availableBalance: { increment: netDepositAmount } }
                                });
                                await tx.merchantLedgerMovement.create({
                                    data: {
                                        merchantId: deposit.merchantId,
                                        type: 'AVAILABLE_IN',
                                        amount: netDepositAmount,
                                        description: `Top Up Saldo via Tripay (${data.payment_name}). Dipotong fee gateway: Rp ${tripayFeeMerchant}`,
                                        availableBefore: merchantPrior?.availableBalance || 0,
                                        availableAfter: updatedMerchant.availableBalance,
                                        escrowBefore: updatedMerchant.escrowBalance,
                                        escrowAfter: updatedMerchant.escrowBalance
                                    }
                                });
                                await tx.balanceTransaction.create({
                                    data: {
                                        userId: deposit.userId,
                                        type: 'DEPOSIT',
                                        amount: netDepositAmount,
                                        depositId: deposit.id,
                                        description: `Deposit via Tripay (${data.payment_name}) - Net: ${netDepositAmount}`
                                    }
                                });
                            });
                            console.log(`[TripayCallback] Deposit ${depositId} confirmed for Merchant: ${deposit.merchantId}. Net: ${netDepositAmount}`);
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
                                const updatedInvoice = await tx.invoice.updateMany({
                                    where: {
                                        id: invoice.id,
                                        status: { in: ['UNPAID', 'PENDING'] }
                                    },
                                    data: { status: 'PAID', paidAt: new Date(), tripayResponse: data }
                                });
                                if (updatedInvoice.count === 0) {
                                    console.log(`[TripayCallback] Race condition detected for invoice ${ref}. Already processed.`);
                                    return;
                                }
                                const merchant = await tx.merchant.findUnique({ where: { id: invoice.merchantId } });
                                const now = new Date();
                                const currentExpiry = (merchant?.planExpiredAt && merchant.planExpiredAt > now) ? merchant.planExpiredAt : now;
                                const expireAt = new Date(currentExpiry.getTime() + (365 * 24 * 60 * 60 * 1000));
                                const planWeights = { 'SUPREME': 4, 'LEGEND': 3, 'PRO': 2, 'FREE': 1 };
                                const currentPlanWeight = planWeights[merchant?.plan || 'FREE'] || 1;
                                const newPlanWeight = planWeights[invoice.plan] || 1;
                                const targetPlan = newPlanWeight > currentPlanWeight ? invoice.plan : (merchant?.plan || invoice.plan);
                                await tx.merchant.update({
                                    where: { id: invoice.merchantId },
                                    data: {
                                        plan: targetPlan,
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
    __param(4, (0, bullmq_1.InjectQueue)('digiflazz-fulfillment')),
    __metadata("design:paramtypes", [tripay_service_1.TripayService,
        prisma_service_1.PrismaService,
        digiflazz_service_1.DigiflazzService,
        whatsapp_service_1.WhatsappService,
        bullmq_2.Queue])
], TripayController);
//# sourceMappingURL=tripay.controller.js.map