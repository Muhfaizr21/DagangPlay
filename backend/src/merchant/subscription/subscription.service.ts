import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TripayService } from '../../tripay/tripay.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private tripay: TripayService,
  ) {}

  async getSubscriptionStatus(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');

    // Look up the latest invoice
    const invoice = await this.prisma.invoice.findFirst({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    // Look up latest subscription history to find when it started
    const latestHistory = await this.prisma.subscriptionHistory.findFirst({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
    const startedAt = latestHistory
      ? latestHistory.startDate
      : merchant.createdAt;

    return {
      plan: merchant.plan,
      planStartedAt: startedAt,
      planExpiredAt: merchant.planExpiredAt,
      // FREE plan (no planExpiredAt) is always considered active
      isActive:
        !merchant.planExpiredAt ||
        new Date() < new Date(merchant.planExpiredAt),
      latestInvoice: invoice,
    };
  }

  async getInvoiceHistory(merchantId: string) {
    return this.prisma.invoice.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
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
        dueDate: new Date(Date.now() + 86400000 * 3), // 3 days
      },
    });

    // 2. Request Tripay Payment
    // Frontend now sends valid Tripay codes directly (QRISC, BRIVA, etc.)
    // Only need to map legacy 'QRIS' -> 'QRISC' for backward compatibility
    const tripayMethod = method === 'QRIS' ? 'QRISC' : method || 'QRISC';

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
          quantity: 1,
        },
      ],
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant/subscription`,
    };

    try {
      const tripayRes = await this.tripay.requestTransaction(tripayPayload);
      return this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          tripayReference: tripayRes.data.reference,
          tripayPaymentUrl: tripayRes.data.checkout_url,
          tripayResponse: tripayRes.data,
        },
      });
    } catch (err: any) {
      console.error('[SubscriptionService] Tripay error:', err);
      return invoice; // Return unpaid invoice anyway
    }
  }

  async uploadProof(merchantId: string, invoiceId: string, proofUrl: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, merchantId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        proofUrl,
        status: 'PENDING', // Changed to PENDING to wait for Admin approval
      },
    });
  }
}
