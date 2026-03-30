import { Controller, Get, Post, Body, Headers, Req, Res, HttpStatus } from '@nestjs/common';
import { TripayService } from './tripay.service';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DigiflazzService } from '../admin/digiflazz/digiflazz.service';
import { WhatsappService } from '../common/notifications/whatsapp.service';

@Controller('tripay')
export class TripayController {
    constructor(
        private readonly tripayService: TripayService,
        private prisma: PrismaService,
        private digiflazz: DigiflazzService,
        private whatsappService: WhatsappService,
        @InjectQueue('digiflazz-fulfillment') private fulfillmentQueue: Queue
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

            // Deferred Signature Verification
            const data = req.body;
            const ref = data.merchant_ref;
            const rawBody = (req as any).rawBody || JSON.stringify(req.body);

            if (!ref) {
                console.warn('[TripayCallback] Missing merchant_ref in payload.');
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Missing merchant_ref' });
            }

            // FIND MERCHANT ID based on Reference
            let merchantId: string | undefined;

            if (ref.startsWith('ORD-')) {
                const order = await this.prisma.order.findUnique({ where: { orderNumber: ref }, select: { merchantId: true } });
                merchantId = order?.merchantId;
            } else if (ref.startsWith('DEP-')) {
                const depId = ref.replace('DEP-', '');
                const deposit = await this.prisma.deposit.findUnique({ where: { id: depId }, select: { merchantId: true } });
                merchantId = deposit?.merchantId;
            } else if (ref.startsWith('INV-')) {
                const invoice = await this.prisma.invoice.findUnique({ where: { invoiceNo: ref }, select: { merchantId: true } });
                merchantId = merchantId || invoice?.merchantId;
            }

            // VERIFY SIGNATURE with correct Tenant Context
            const isValid = await this.tripayService.verifySignature(signature, rawBody, merchantId);

            if (!isValid) {
                console.warn(`[TripayCallback] Invalid signature for Ref: ${ref} (Merchant: ${merchantId || 'PLATFORM'}). Verification failed.`);
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }

            console.log(`[TripayCallback] Received ${data.status} for Ref: ${ref} (Merchant: ${merchantId || 'PLATFORM'})`);

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
                                        // FIXED: TWO-LEDGER SYSTEM (PENDING BALANCE)
                                        // Masukkan laba bersih (setelah platform fee) ke Escrow Merchant.
                                        const updatedMerchantEscrow = await tx.merchant.update({
                                            where: { id: order.merchantId },
                                            data: { escrowBalance: { increment: merchantNetProfit } }
                                        });

                                        // Log the movement in Merchant Ledger
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

                                    // 3.1 Credit SaaS Markup to Super Admin (modalPrice - basePrice)
                                    // This is the markup from wholesale price (modal) - supplier price (base)
                                    const saasMarkup = Math.max(0, Number(order.merchantModalPrice || 0) - Number(order.basePrice || 0));
                                    const totalPlatformProfit = platformFeeAmount + saasMarkup;

                                    if (totalPlatformProfit > 0) {
                                        const superAdmin = await tx.user.findFirst({
                                            where: { role: 'SUPER_ADMIN' },
                                            orderBy: { createdAt: 'asc' } // Ensure deterministic original Super Admin
                                        });
                                        if (superAdmin) {
                                            // FIXED 1 (Lapis 2): Tahan saldo SuperAdmin (PENDING BALANCE)
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

                        // FIXED 2: GHOST ORDER PROTECTION (BULLMQ)
                        // Menggunakan Message Queue yang persisten (Redis).
                        // Jika server mati pun, antrean ini akan diproses ulang saat menyala.
                        await this.fulfillmentQueue.add('process-fulfillment', { 
                            orderId: order.id 
                        }, {
                            attempts: 5,
                            backoff: { type: 'exponential', delay: 5000 },
                            removeOnComplete: true
                        });
                        console.log(`[TripayQueue / Persisted] Enqueued fulfillment specifically for order: ${order.orderNumber}`);
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
                            where: { id: depositId },
                            include: { merchant: true }
                        });

                        if (deposit && deposit.status === 'PENDING') {
                            // FIXED: Penanganan Biaya (Fee) Tripay pada Deposit
                            // Platform tidak boleh nombok. Saldo yang masuk adalah NET (Setelah potong fee merchant).
                            const tripayFeeMerchant = Number(data.fee_merchant) || 0;
                            const netDepositAmount = Math.max(0, Number(data.amount) - tripayFeeMerchant);

                            await this.prisma.$transaction(async (tx) => {
                                // IDEMPOTENCY: Atomic status update
                                const updatedDeposit = await tx.deposit.update({
                                    where: { id: deposit.id, status: 'PENDING' },
                                    data: {
                                        status: 'CONFIRMED',
                                        tripayResponse: data as any
                                    }
                                });

                                // FIXED: Gunakan Merchant Ledger (availableBalance)
                                const merchantPrior = await tx.merchant.findUnique({
                                    where: { id: deposit.merchantId }
                                });

                                const updatedMerchant = await tx.merchant.update({
                                    where: { id: deposit.merchantId },
                                    data: { availableBalance: { increment: netDepositAmount } }
                                });

                                // Log the movement in Merchant Ledger
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

                                // Also log to traditional balanceTransaction for compatibility
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
                                const updatedInvoice = await tx.invoice.updateMany({
                                    where: { 
                                        id: invoice.id,
                                        status: { in: ['UNPAID', 'PENDING'] }
                                    },
                                    data: { status: 'PAID', paidAt: new Date(), tripayResponse: data as any }
                                });

                                if (updatedInvoice.count === 0) {
                                    console.log(`[TripayCallback] Race condition detected for invoice ${ref}. Already processed.`);
                                    return;
                                }

                                // Calculate Expiry (usually +365 days / 1 year) - Stacking logic
                                const merchant = await tx.merchant.findUnique({ where: { id: invoice.merchantId } });
                                const now = new Date();
                                const currentExpiry = (merchant?.planExpiredAt && merchant.planExpiredAt > now) ? merchant.planExpiredAt : now;
                                const expireAt = new Date(currentExpiry.getTime() + (365 * 24 * 60 * 60 * 1000));

                                // Plan Ranking: Safeguard against downgrades if current plan is higher
                                const planWeights: Record<string, number> = { 'SUPREME': 4, 'LEGEND': 3, 'PRO': 2, 'FREE': 1 };
                                const currentPlanWeight = planWeights[merchant?.plan || 'FREE'] || 1;
                                const newPlanWeight = planWeights[invoice.plan] || 1;
                                const targetPlan = newPlanWeight > currentPlanWeight ? invoice.plan : (merchant?.plan || invoice.plan);

                                // Update Merchant Plan
                                await tx.merchant.update({
                                    where: { id: invoice.merchantId },
                                    data: {
                                        plan: targetPlan as any,
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
