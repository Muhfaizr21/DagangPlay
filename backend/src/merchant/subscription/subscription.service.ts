import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SubscriptionService {
    constructor(private prisma: PrismaService) { }

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
        // Dummy logic to generate a new manual invoice for plan upgrade
        return this.prisma.invoice.create({
            data: {
                merchantId,
                invoiceNo: 'INV-' + Date.now(),
                plan: data.plan || 'PRO',
                amount: data.amount || 250000,
                totalAmount: data.amount || 250000,
                status: 'UNPAID',
                dueDate: new Date(Date.now() + 86400000 * 3) // 3 days
            }
        });
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
