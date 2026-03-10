import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TripayService } from '../../tripay/tripay.service';

@Injectable()
export class SubscriptionService {
    constructor(private prisma: PrismaService, private tripay: TripayService) { }

    async getSubscriptionStatus(merchantId: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant) throw new NotFoundException('Merchant not found');

        // Look up the latest invoice
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

    async getInvoiceHistory(merchantId: string) {
        return this.prisma.invoice.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createInvoice(merchantId: string, data: any) {
        const { plan, amount, method } = data;
        const invoiceNo = 'INV-' + Date.now();

        // 1. Create Invoice in DB
        const invoice = await this.prisma.invoice.create({
            data: {
                merchantId,
                invoiceNo: invoiceNo,
                plan: plan || 'PRO',
                amount: amount || 250000,
                totalAmount: amount || 250000,
                status: 'UNPAID',
                dueDate: new Date(Date.now() + 86400000 * 3) // 3 days
            }
        });

        // 2. Request Tripay Payment
        // Map common method codes
        const methodMap: Record<string, string> = {
            'QRIS': 'QRISC',
            'BCAVA': 'BCAVA',
            'BNIVA': 'BNIVA',
            'BRIVA': 'BRIVA',
            'MANDIRIVA': 'MANDIRIVA',
            'OVO': 'OVO',
            'DANA': 'DANA',
        };

        const tripayMethod = methodMap[method] || 'QRISC';

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
                    tripayResponse: tripayRes.data as any
                }
            });
        } catch (err: any) {
            console.error('[SubscriptionService] Tripay error:', err);
            return invoice; // Return unpaid invoice anyway
        }
    }

    async uploadProof(merchantId: string, invoiceId: string, proofUrl: string) {
        const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, merchantId } });
        if (!invoice) throw new NotFoundException('Invoice not found');

        return this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                proofUrl,
                status: 'PENDING' // Changed to PENDING to wait for Admin approval
            }
        });
    }
}
