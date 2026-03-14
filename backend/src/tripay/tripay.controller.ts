import { Controller, Get, Post, Body, Headers, Req, Res, HttpStatus } from '@nestjs/common';
import { TripayService } from './tripay.service';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma.service';

import { DigiflazzService } from '../admin/digiflazz/digiflazz.service';
import { WhatsappService } from '../common/notifications/whatsapp.service';

@Controller('tripay')
export class TripayController {
    constructor(
        private readonly tripayService: TripayService,
        private prisma: PrismaService,
        private digiflazz: DigiflazzService,
        private whatsappService: WhatsappService
    ) { }

    /**
     * Get available payment channels for checkout page
     */
    @Get('payment-channels')
    async getPaymentChannels() {
        // Assuming tripayService.getPaymentChannels() already fetches channels with fee info
        return this.tripayService.getPaymentChannels();
    }

    /**
     * Webhook callback from Tripay
     */
    @Post('callback')
    async tripayCallback(
        @Headers('x-callback-signature') signature: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            // 1. IP WHITELISTING (Security Audit Requirement)
            const allowedIps = ['95.111.200.230', '127.0.0.1'];
            const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
            
            // Check if IP is allowed or if we are in dev mode
            const isAllowed = allowedIps.some(ip => clientIp.includes(ip)) || process.env.NODE_ENV !== 'production';

            if (!isAllowed) {
                console.warn(`[TripayCallback] Blocked unauthorized IP: ${clientIp}`);
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'Unauthorized IP Source' });
            }

            // 2. RAW BODY SIGNATURE VERIFICATION
            // rawBody is attached by NestJS because of 'rawBody: true' in main.ts
            const rawBody = (req as any).rawBody || JSON.stringify(req.body);

            const isValid = this.tripayService.verifySignature(signature, rawBody);

            if (!isValid) {
                console.warn('[TripayCallback] Invalid signature signature verification failed.');
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }

            const data = req.body;
            const ref = data.merchant_ref;

            console.log(`[TripayCallback] Received ${data.status} for Ref: ${ref}`);

            if (data.status === 'PAID') {
                // 1. Check if it's an ORDER (Ref: ORD-...)
                if (ref.startsWith('ORD-')) {
                    try {
                        const order = await this.prisma.order.findUnique({
                            where: { orderNumber: ref },
                            include: { user: true }
                        });

                        if (!order) {
                            console.warn(`[TripayCallback] Order ${ref} not found.`);
                            return res.status(HttpStatus.OK).json({ success: true }); // Acknowledge to stop retries
                        }

                        // IDEMPOTENCY: Only proceed if order is still PENDING
                        if (order.paymentStatus !== 'PENDING') {
                            console.log(`[TripayCallback] Order ${ref} already processed (${order.paymentStatus}). Skipping.`);
                            return res.status(HttpStatus.OK).json({ success: true });
                        }

                        const modalPrice = order.merchantModalPrice || order.sellingPrice;
                        const rawProfit = order.sellingPrice - modalPrice;

                        // We only deduct fee_merchant from our profit because fee_customer is paid directly by the buyer on top of the selling price
                        const tripayFeeMerchant = Number(data.fee_merchant) || 0;
                        const tripayFeeCustomer = Number(data.fee_customer) || 0;
                        const totalTripayFee = tripayFeeMerchant + tripayFeeCustomer;

                        // FORMULA: NET PROFIT = (SELL - MODAL) - FEE_MERCHANT
                        const netProfit = Math.max(0, rawProfit - tripayFeeMerchant);

                        await this.prisma.$transaction(async (tx) => {
                            // 1. Update Order Status (FAIL IF NOT PENDING - Atomic Check)
                            const updatedOrder = await tx.order.update({
                                where: { id: order.id, paymentStatus: 'PENDING' },
                                data: {
                                    paymentStatus: 'PAID',
                                    paidAt: new Date()
                                }
                            });

                            // 2. Update Payment Status & Record Fee
                            await tx.payment.update({
                                where: { orderId: order.id },
                                data: {
                                    status: 'PAID',
                                    fee: totalTripayFee,
                                    paidAt: new Date(),
                                    tripayResponse: data as any
                                }
                            });

                            // 3. Credit Profit to Merchant
                            if (netProfit > 0) {
                                const merchant = await tx.merchant.findUnique({
                                    where: { id: order.merchantId },
                                    select: { ownerId: true, settings: true }
                                });

                                if (merchant) {
                                    let platformFeePct = 0;
                                    if (merchant.settings && typeof merchant.settings === 'object' && 'platformFee' in (merchant.settings as any)) {
                                        platformFeePct = Number((merchant.settings as any).platformFee) || 0;
                                    }

                                    const platformFeeAmount = Math.round(netProfit * (platformFeePct / 100));
                                    const merchantNetProfit = netProfit - platformFeeAmount;

                                    if (merchantNetProfit > 0) {
                                        const user = await tx.user.update({
                                            where: { id: merchant.ownerId },
                                            data: { balance: { increment: merchantNetProfit } }
                                        });

                                        // Create official Commission record
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

                                    // 3.1 Credit SaaS Markup to Super Admin (modalPrice - basePrice)
                                    // This is the markup from wholesale price (modal) - supplier price (base)
                                    const saasMarkup = Math.max(0, Number(order.merchantModalPrice || 0) - Number(order.basePrice || 0));
                                    const totalPlatformProfit = platformFeeAmount + saasMarkup;

                                    if (totalPlatformProfit > 0) {
                                        const superAdmin = await tx.user.findFirst({
                                            where: { role: 'SUPER_ADMIN' }
                                        });
                                        if (superAdmin) {
                                            const su = await tx.user.update({
                                                where: { id: superAdmin.id },
                                                data: { balance: { increment: totalPlatformProfit } }
                                            });

                                            // Register commission to super admin
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

                        // SEND NOTIFICATION: Payment Received & Processing
                        this.whatsappService.sendMessage(
                            order.user.phone || '',
                            `✅ *PEMBAYARAN DITERIMA - ${order.orderNumber}*\n\n` +
                            `Terima kasih, pembayaran sebesar *Rp ${order.totalPrice.toLocaleString('id-ID')}* telah kami terima.\n` +
                            `Pesanan *${order.productName} - ${order.productSkuName}* sedang diproses ke akun Anda.\n\n` +
                            `Tunggu update selanjutnya ya!`
                        ).catch(err => console.error(`[TripayCallback] Failed notification:`, err.message));

                        // 3. Notify Admin (Async)
                        // Note: saasMarkup and platformFee are calculated during processing. 
                        // For simplicity in notification outside tx scope, we'll use order values.
                        const adminMarkup = Math.max(0, Number(order.merchantModalPrice || 0) - Number(order.basePrice || 0));
                        this.whatsappService.sendAdminSummary(
                            `💰 *PEMBAYARAN SUKSES*\n` +
                            `Order: ${order.orderNumber}\n` +
                            `Produk: ${order.productName}\n` +
                            `Total: Rp ${order.totalPrice.toLocaleString('id-ID')}\n` +
                            `Metode: ${order.paymentMethod}\n` +
                            `Markup SA: Rp ${adminMarkup.toLocaleString('id-ID')}`
                        ).catch(() => {});

                        // TRIGGER FULFILLMENT AUTOMATICALLY
                        try {
                            console.log(`[TripayCallback] Triggering fulfillment for order: ${order.orderNumber}`);
                            await this.digiflazz.placeOrder(order.id);
                        } catch (fulfillErr: any) {
                            console.error(`[TripayCallback] Fulfillment failed for ${order.orderNumber}:`, fulfillErr.message);
                        }
                    } catch (err: any) {
                        if (err.code === 'P2025') {
                            console.log(`[TripayCallback] Race condition prevented for order ${ref}. Already processed.`);
                            return res.status(HttpStatus.OK).json({ success: true });
                        }
                        throw err;
                    }
                }

                // 2. Check if it's a DEPOSIT (Ref: DEP-...)
                else if (ref.startsWith('DEP-')) {
                    try {
                        const depositId = ref.replace('DEP-', '');
                        const deposit = await this.prisma.deposit.findUnique({
                            where: { id: depositId }
                        });

                        if (deposit && deposit.status === 'PENDING') {
                            await this.prisma.$transaction(async (tx) => {
                                // IDEMPOTENCY: Atomic status update
                                const updatedDeposit = await tx.deposit.update({
                                    where: { id: deposit.id, status: 'PENDING' },
                                    data: {
                                        status: 'CONFIRMED',
                                        tripayResponse: data as any
                                    }
                                });

                                // Add balance to merchant
                                const user = await tx.user.update({
                                    where: { id: deposit.userId },
                                    data: { balance: { increment: deposit.amount } }
                                });

                                // Create Balance Transaction Record
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

                                // NOTE: Super Admin balance tidak dikurangi di sini.
                                // Dalam model bisnis ini, SA menerima platform fee dari order profit (sudah ada di callback ORD-).
                                // Deposit merchant adalah top-up dari luar (via Tripay), bukan dari SA balance.
                                // SA balance hanya mencatat revenue dari platform fee, bukan modal deposit merchant.
                            });
                            console.log(`[TripayCallback] Deposit ${depositId} confirmed.`);
                        }
                    } catch (err: any) {
                        if (err.code === 'P2025') return res.status(HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                }

                // 3. Check if it's a SUBSCRIPTION INVOICE (Ref: INV-...)
                else if (ref.startsWith('INV-')) {
                    try {
                        const invoice = await this.prisma.invoice.findUnique({
                            where: { invoiceNo: ref }
                        });

                        if (invoice && (invoice.status === 'UNPAID' || invoice.status === 'PENDING')) {
                            await this.prisma.$transaction(async (tx) => {
                                // IDEMPOTENCY: Atomic update (check both UNPAID and PENDING)
                                await tx.invoice.update({
                                    where: { id: invoice.id },
                                    data: { status: 'PAID', paidAt: new Date(), tripayResponse: data as any }
                                });

                                // Calculate Expiry (usually +30 days)
                                const expireAt = new Date();
                                expireAt.setDate(expireAt.getDate() + 30);

                                // Update Merchant Plan
                                await tx.merchant.update({
                                    where: { id: invoice.merchantId },
                                    data: {
                                        plan: invoice.plan,
                                        planExpiredAt: expireAt,
                                        status: 'ACTIVE'
                                    }
                                });

                                // Log History
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
                    } catch (err: any) {
                        if (err.code === 'P2025') return res.status(HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                }
            } else if (data.status === 'EXPIRED' || data.status === 'FAILED') {
                // Handle EXPIRED or FAILED status
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
                                    data: { status: data.status, tripayResponse: data as any }
                                });
                            });
                            console.log(`[TripayCallback] Order ${ref} updated to ${data.status}.`);
                        }
                    } catch (err: any) {
                        if (err.code === 'P2025') return res.status(HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                } else if (ref.startsWith('DEP-')) {
                    try {
                        const depositId = ref.replace('DEP-', '');
                        const deposit = await this.prisma.deposit.findUnique({
                            where: { id: depositId }
                        });

                        if (deposit && deposit.status === 'PENDING') {
                            await this.prisma.$transaction(async (tx) => {
                                await tx.deposit.update({
                                    where: { id: deposit.id, status: 'PENDING' },
                                    data: { status: data.status, tripayResponse: data as any }
                                });
                            });
                            console.log(`[TripayCallback] Deposit ${depositId} updated to ${data.status}.`);
                        }
                    } catch (err: any) {
                        if (err.code === 'P2025') return res.status(HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                } else if (ref.startsWith('INV-')) {
                    try {
                        const invoice = await this.prisma.invoice.findUnique({
                            where: { invoiceNo: ref }
                        });

                        if (invoice && (invoice.status === 'UNPAID' || invoice.status === 'PENDING')) {
                            await this.prisma.$transaction(async (tx) => {
                                await tx.invoice.update({
                                    where: { id: invoice.id },
                                    data: { status: data.status, tripayResponse: data as any }
                                });
                            });
                            console.log(`[TripayCallback] Invoice ${ref} updated to ${data.status}.`);
                        }
                    } catch (err: any) {
                        if (err.code === 'P2025') return res.status(HttpStatus.OK).json({ success: true });
                        throw err;
                    }
                }
            }

            return res.status(HttpStatus.OK).json({ success: true });
        } catch (error: any) {
            console.error('[TripayCallback] Error:', error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }
}
