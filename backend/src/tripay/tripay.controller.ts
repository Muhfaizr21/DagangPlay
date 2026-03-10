import { Controller, Get, Post, Body, Headers, Req, Res, HttpStatus } from '@nestjs/common';
import { TripayService } from './tripay.service';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma.service';

import { DigiflazzService } from '../admin/digiflazz/digiflazz.service';

@Controller('tripay')
export class TripayController {
    constructor(
        private readonly tripayService: TripayService,
        private prisma: PrismaService,
        private digiflazz: DigiflazzService
    ) { }

    /**
     * Get available payment channels for checkout page
     */
    @Get('payment-channels')
    async getPaymentChannels() {
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
            // Raw body should be used for accurate signature verification
            // In NestJS, we often need a custom middleware or pipe to get rawBody.
            // Using JSON.stringify(req.body) as a fallback if request is already parsed.
            const rawBody = JSON.stringify(req.body);

            const isValid = this.tripayService.verifySignature(signature, rawBody);

            if (!isValid) {
                console.warn('[TripayCallback] Invalid signature from', req.ip);
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: 'Invalid signature' });
            }

            const data = req.body;
            const ref = data.merchant_ref;

            console.log(`[TripayCallback] Received ${data.status} for Ref: ${ref}`);

            if (data.status === 'PAID') {
                // 1. Check if it's an ORDER (Ref: ORD-...)
                if (ref.startsWith('ORD-')) {
                    const order = await this.prisma.order.findUnique({
                        where: { orderNumber: ref }
                    });

                    if (order && order.paymentStatus !== 'PAID') {
                        const modalPrice = order.merchantModalPrice || order.sellingPrice;
                        const profit = order.sellingPrice - modalPrice;

                        await this.prisma.$transaction(async (tx) => {
                            // 1. Update Order Status
                            await tx.order.update({
                                where: { id: order.id },
                                data: {
                                    paymentStatus: 'PAID',
                                    paidAt: new Date()
                                }
                            });

                            // 2. Update Payment Status & Record Fee
                            const tripayFee = (Number(data.fee_merchant) || 0) + (Number(data.fee_customer) || 0);

                            await tx.payment.update({
                                where: { orderId: order.id },
                                data: {
                                    status: 'PAID',
                                    fee: tripayFee,
                                    paidAt: new Date(),
                                    tripayResponse: data as any
                                }
                            });

                            // 2.5 Credit Profit to Merchant (Protect Super Admin from Fees)
                            // Formula: (Selling Price - Modal Price) - Tripay Fee
                            const netProfit = profit - tripayFee;

                            if (netProfit > 0) {
                                const merchant = await tx.merchant.findUnique({
                                    where: { id: order.merchantId },
                                    select: { ownerId: true }
                                });

                                if (merchant) {
                                    const user = await tx.user.update({
                                        where: { id: merchant.ownerId },
                                        data: { balance: { increment: netProfit } }
                                    });

                                    // Create official Commission record
                                    const commission = await tx.commission.create({
                                        data: {
                                            orderId: order.id,
                                            userId: merchant.ownerId,
                                            type: 'MERCHANT_RETAIL_PROFIT',
                                            amount: netProfit,
                                            status: 'SETTLED',
                                            settledAt: new Date()
                                        }
                                    });

                                    await tx.balanceTransaction.create({
                                        data: {
                                            userId: merchant.ownerId,
                                            type: 'COMMISSION',
                                            amount: netProfit,
                                            balanceBefore: user.balance - netProfit,
                                            balanceAfter: user.balance,
                                            orderId: order.id,
                                            description: `Profit penjualan (bersih) ${order.orderNumber}`
                                        }
                                    });
                                }
                            }
                        });

                        // TRIGGER FULFILLMENT AUTOMATICALLY
                        try {
                            console.log(`[TripayCallback] Triggering fulfillment for order: ${order.orderNumber}`);
                            await this.digiflazz.placeOrder(order.id);
                        } catch (fulfillErr: any) {
                            console.error(`[TripayCallback] Fulfillment failed for ${order.orderNumber}:`, fulfillErr.message);
                        }
                    }
                }

                // 2. Check if it's a DEPOSIT (Ref: DEP-...)
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
                                    balanceBefore: user.balance - deposit.amount,
                                    balanceAfter: user.balance,
                                    depositId: deposit.id,
                                    description: `Deposit via Tripay (${data.payment_name})`
                                }
                            });

                            // Deduct conceptual balance from Super Admin
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

                // 3. Check if it's a SUBSCRIPTION INVOICE (Ref: INV-...)
                else if (ref.startsWith('INV-')) {
                    const invoice = await this.prisma.invoice.findUnique({
                        where: { invoiceNo: ref }
                    });

                    if (invoice && invoice.status !== 'PAID') {
                        await this.prisma.$transaction(async (tx) => {
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
                }
            }

            return res.status(HttpStatus.OK).json({ success: true });
        } catch (error: any) {
            console.error('[TripayCallback] Error:', error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }
}
