import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MerchantPlan, InvoiceStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionsService {
    private readonly logger = new Logger(SubscriptionsService.name);

    constructor(private prisma: PrismaService) { }

    async getInvoices(search?: string, status?: string) {
        const where: any = {};
        if (status) where.status = status as InvoiceStatus;
        if (search) {
            where.OR = [
                { invoiceNo: { contains: search, mode: 'insensitive' } },
                { merchant: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        return this.prisma.invoice.findMany({
            where,
            include: {
                merchant: { select: { id: true, name: true, domain: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async confirmInvoice(id: string, operator: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { merchant: true }
        });

        if (!invoice) throw new NotFoundException('Invoice not found');
        if (invoice.status === 'PAID') throw new BadRequestException('Invoice already paid');

        return this.prisma.$transaction(async (tx) => {
            // 1. Update Invoice
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    confirmedBy: operator
                }
            });

            // 2. Update Merchant Plan & Expiry
            // Assume sub is for 30 days if not defined. 
            // In real world, we'd check if they are paying for 1 month, 6 months, or 1 year.
            const durationDays = 30;
            const now = new Date();
            const currentExpiry = invoice.merchant.planExpiredAt || now;
            const baseDate = currentExpiry > now ? currentExpiry : now;
            const newExpiry = new Date(baseDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));

            await tx.merchant.update({
                where: { id: invoice.merchantId },
                data: {
                    plan: invoice.plan,
                    planExpiredAt: newExpiry,
                    status: 'ACTIVE' // Ensure they are active
                }
            });

            // 3. Record History
            await tx.subscriptionHistory.create({
                data: {
                    merchantId: invoice.merchantId,
                    oldPlan: invoice.merchant.plan,
                    newPlan: invoice.plan,
                    startDate: baseDate,
                    endDate: newExpiry,
                    amount: invoice.totalAmount,
                    note: `Manual Confirmation of Invoice ${invoice.invoiceNo}`
                }
            });

            return updatedInvoice;
        });
    }

    async rejectInvoice(id: string, notes: string) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice) throw new NotFoundException('Invoice not found');

        return this.prisma.invoice.update({
            where: { id },
            data: {
                status: 'UNPAID', // Or CANCELLED
                notes: notes,
                proofUrl: null // Clear proof if rejected
            }
        });
    }

    async updateMerchantPlanManual(merchantId: string, plan: string, durationDays: number, operator: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant) throw new NotFoundException('Merchant not found');

        const now = new Date();
        const newExpiry = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000));

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.merchant.update({
                where: { id: merchantId },
                data: {
                    plan: plan as MerchantPlan,
                    planExpiredAt: newExpiry,
                    status: 'ACTIVE'
                }
            });

            await tx.subscriptionHistory.create({
                data: {
                    merchantId,
                    oldPlan: merchant.plan,
                    newPlan: plan as MerchantPlan,
                    startDate: now,
                    endDate: newExpiry,
                    amount: 0,
                    note: `Manual adjustment by ${operator}`
                }
            });

            return updated;
        });
    }

    async getPlanFeatures() {
        const setting = await this.prisma.systemSetting.findUnique({ where: { key: 'saas_plan_features' } });
        if (!setting) {
            // Default features if not found
            return {
                FREE: { maxProducts: 10, customDomain: false, multiUser: false },
                PRO: { maxProducts: 50, customDomain: true, multiUser: false, price: 74917 },
                LEGEND: { maxProducts: 500, customDomain: true, multiUser: true, price: 82250 },
                SUPREME: { maxProducts: 99999, customDomain: true, multiUser: true, whiteLabel: true, price: 99917 }
            };
        }
        return JSON.parse(setting.value);
    }

    async getMerchantPlanFeatures(merchantId: string) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            select: { plan: true, planExpiredAt: true }
        });

        if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');

        // Check expiry
        const now = new Date();
        const isExpired = merchant.planExpiredAt && merchant.planExpiredAt < now;

        const allFeatures = await this.getPlanFeatures();
        const planFeatures = allFeatures[merchant.plan || 'FREE'] || allFeatures['FREE'];

        return {
            ...planFeatures,
            isExpired,
            plan: merchant.plan
        };
    }

    async checkFeatureLimit(merchantId: string, feature: 'maxProducts' | 'multiUser' | 'whiteLabel' | 'customDomain', addingCount: number = 0) {
        const features = await this.getMerchantPlanFeatures(merchantId);

        if (features.isExpired) {
            throw new BadRequestException('Masa aktif paket Anda telah habis. Silakan lakukan perpanjangan.');
        }

        if (feature === 'multiUser' && !features.multiUser) {
            throw new BadRequestException('Paket Anda tidak mendukung fitur Multi-User (Staff). Silakan upgrade ke LEGEND/SUPREME.');
        }

        if (feature === 'whiteLabel' && !features.whiteLabel) {
            throw new BadRequestException('Paket Anda tidak mendukung fitur White-Label. Silakan upgrade ke SUPREME.');
        }

        if (feature === 'customDomain' && !features.customDomain) {
            throw new BadRequestException('Paket Anda tidak mendukung fitur Custom Domain. Silakan upgrade ke PRO+');
        }

        if (feature === 'maxProducts') {
            const count = await this.prisma.merchantProductPrice.count({
                where: { merchantId, isActive: true }
            });

            const totalAfterAdd = count + addingCount;

            if (features.maxProducts !== undefined && totalAfterAdd > features.maxProducts && addingCount > 0) {
                throw new BadRequestException(`Limit produk aktif terlampaui. Paket Anda hanya mengizinkan ${features.maxProducts} produk. (Saat ini ${count}, akan ditambah ${addingCount})`);
            } else if (features.maxProducts !== undefined && count >= features.maxProducts && addingCount === 0) {
                throw new BadRequestException(`Limit produk aktif terlampaui (${count}/${features.maxProducts}). Silakan upgrade paket Anda.`);
            }
        }

        return true;
    }

    async updatePlanFeatures(features: any, operator: string) {
        return this.prisma.systemSetting.upsert({
            where: { key: 'saas_plan_features' },
            update: { value: JSON.stringify(features), updatedBy: operator },
            create: { key: 'saas_plan_features', value: JSON.stringify(features), group: 'SAAS', updatedBy: operator }
        });
    }

    async getSaaSPerformance() {
        const invoices = await this.prisma.invoice.findMany({
            where: { status: 'PAID' },
            select: { totalAmount: true, paidAt: true }
        });

        const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
        const activeMerchants = await this.prisma.merchant.count({
            where: { planExpiredAt: { gt: new Date() }, status: 'ACTIVE' }
        });
        const expiredMerchants = await this.prisma.merchant.count({
            where: { planExpiredAt: { lte: new Date() } }
        });

        // Simple churn calculation: expired / (active + expired)
        const churnRate = activeMerchants + expiredMerchants > 0
            ? (expiredMerchants / (activeMerchants + expiredMerchants)) * 100
            : 0;

        return {
            totalRevenue,
            activeMerchants,
            expiredMerchants,
            churnRate: churnRate.toFixed(2) + '%'
        };
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleSaaSCron() {
        this.logger.log('Menjalankan pengecekan harian untuk Subscription SaaS...');
        const now = new Date();

        // 1. Suspend merchants yg expired
        const expiredMerchants = await this.prisma.merchant.findMany({
            where: { planExpiredAt: { lte: now }, status: 'ACTIVE' }
        });

        for (const merchant of expiredMerchants) {
            await this.prisma.merchant.update({
                where: { id: merchant.id },
                data: { status: 'INACTIVE' } // SUSPEND
            });
            this.logger.log(`Men-suspend merchant ${merchant.name} (${merchant.id}) karena plan kedaluwarsa.`);
            // NOTE: Dalam real-world kita akan trigger notifikasi WA/Email ke merchant.
        }

        // 2. Mark OVERDUE invoices
        const overdueInvoices = await this.prisma.invoice.findMany({
            where: { dueDate: { lt: now }, status: { in: ['UNPAID', 'PENDING'] } }
        });

        for (const invoice of overdueInvoices) {
            await this.prisma.invoice.update({
                where: { id: invoice.id },
                data: { status: 'OVERDUE' }
            });
            this.logger.log(`Tandai invoice ${invoice.invoiceNo} sebagai OVERDUE.`);
        }
    }

    async createManualInvoice(merchantId: string, plan: MerchantPlan, amount: number, dueDate: Date, operator: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');

        const invoiceNo = `S-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
        return this.prisma.invoice.create({
            data: {
                merchantId,
                invoiceNo,
                plan,
                amount,
                tax: 0,
                totalAmount: amount,
                status: 'UNPAID',
                dueDate: new Date(dueDate),
                notes: `Dibuat secara manual oleh ${operator}`
            }
        });
    }
}
