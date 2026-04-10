import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MerchantPlan, InvoiceStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  async getInvoices(search?: string, status?: string) {
    const where: any = {};
    if (status) where.status = status as InvoiceStatus;
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: 'insensitive' } },
        { merchant: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        merchant: {
          select: { id: true, name: true, domain: true, plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmInvoice(id: string, operator: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'PAID')
      throw new BadRequestException('Invoice already paid');

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          confirmedBy: operator,
        },
      });

      // 2. Update Merchant Plan & Expiry
      // Assume sub is for 365 days (1 Year).
      const durationDays = 365;
      const now = new Date();
      const currentExpiry = invoice.merchant.planExpiredAt || now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(
        baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
      );

      // PLAN RANKING: SUPREME > LEGEND > PRO > FREE
      const planWeights: Record<string, number> = {
        SUPREME: 4,
        LEGEND: 3,
        PRO: 2,
        FREE: 1,
      };
      const currentPlanWeight = planWeights[invoice.merchant.plan] || 0;
      const newPlanWeight = planWeights[invoice.plan] || 0;

      // Only update the plan string if it's an UPGRADE. Otherwise, just extend the expiry of the current superior plan.
      const targetPlan =
        newPlanWeight > currentPlanWeight
          ? invoice.plan
          : invoice.merchant.plan;

      await tx.merchant.update({
        where: { id: invoice.merchantId },
        data: {
          plan: targetPlan,
          planExpiredAt: newExpiry,
          status: 'ACTIVE',
        },
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
          note: `Manual Confirmation of Invoice ${invoice.invoiceNo}`,
        },
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
        proofUrl: null, // Clear proof if rejected
      },
    });
  }

  async updateMerchantPlanManual(
    merchantId: string,
    plan: string,
    durationDays: number,
    operator: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const now = new Date();
    const newExpiry = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000,
    );

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.merchant.update({
        where: { id: merchantId },
        data: {
          plan: plan as MerchantPlan,
          planExpiredAt: newExpiry,
          status: 'ACTIVE',
        },
      });

      await tx.subscriptionHistory.create({
        data: {
          merchantId,
          oldPlan: merchant.plan,
          newPlan: plan as MerchantPlan,
          startDate: now,
          endDate: newExpiry,
          amount: 0,
          note: `Manual adjustment by ${operator}`,
        },
      });

      return updated;
    });
  }

  async getPlanFeatures() {
    const defaultFeatures: any = {
      FREE: {
        price: 0,
        yearlyPrice: 0,
        maxProfitLabel: '',
        maxProducts: 100,
        customDomain: false,
        domainChoices: 0,
        multiUser: false,
        whiteLabel: false,
        flashSale: false,
        templateVariants: false,
        seoPixel: false,
        couponManagement: false,
        instantWithdrawal: false,
        customProductDetail: false,
        buildApk: false,
        prioritySupport: false,
        resellerAcademy: false,
        tldDomain: false,
        maxMembers: 10,
        description: 'Coba platform gratis, cocok untuk pemula.',
      },
      PRO: {
        price: 83167,
        yearlyPrice: 998000,
        maxProfitLabel: 'Rp5jt/bln',
        maxProducts: 2000,
        customDomain: true,
        domainChoices: 2,
        multiUser: false,
        whiteLabel: false,
        flashSale: false,
        templateVariants: false,
        seoPixel: true,
        couponManagement: true,
        instantWithdrawal: false,
        customProductDetail: false,
        buildApk: false,
        prioritySupport: false,
        resellerAcademy: false,
        tldDomain: false,
        maxMembers: 100,
        description:
          'Mulai bisnis reseller game dengan domain sendiri dan harga modal murah.',
      },
      LEGEND: {
        price: 91500,
        yearlyPrice: 1098000,
        maxProfitLabel: 'Rp15jt/bln',
        resellerAcademy: false,
        tldDomain: false,
        maxMembers: 1000,
        description:
          'Skalakan bisnis dengan member staf, variasi tampilan, dan harga lebih kompetitif.',
      },
      SUPREME: {
        price: 110667,
        yearlyPrice: 1328000,
        maxProfitLabel: 'Rp30jt/bln',
        maxProducts: 99999,
        customDomain: true,
        domainChoices: 12,
        multiUser: true,
        whiteLabel: true,
        flashSale: true,
        templateVariants: true,
        seoPixel: true,
        couponManagement: true,
        instantWithdrawal: true,
        customProductDetail: true,
        buildApk: true,
        prioritySupport: true,
        resellerAcademy: true,
        tldDomain: true,
        maxMembers: 999999,
        description:
          'Platform bisnis game paling lengkap. Maksimalkan profit tanpa batas.',
      },
    };

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'saas_plan_features' },
    });
    if (!setting) {
      return defaultFeatures;
    }

    // Deep merge: DB values take priority for fields they have,
    // but any missing field is filled in from the current defaultFeatures.
    // This ensures new feature flags added to defaults always appear.
    const dbFeatures = JSON.parse(setting.value);
    for (const tier of Object.keys(defaultFeatures)) {
      if (dbFeatures[tier]) {
        // Fill in any missing keys from defaultFeatures
        for (const key of Object.keys(defaultFeatures[tier])) {
          if (
            dbFeatures[tier][key] === undefined ||
            dbFeatures[tier][key] === null
          ) {
            dbFeatures[tier][key] = defaultFeatures[tier][key];
          }
        }
        // Ensure maxProducts is at least the default minimum
        if (
          (dbFeatures[tier].maxProducts ?? 0) <
          defaultFeatures[tier].maxProducts
        ) {
          dbFeatures[tier].maxProducts = defaultFeatures[tier].maxProducts;
        }
        // Ensure maxMembers is at least the default minimum
        if (
          (dbFeatures[tier].maxMembers ?? 0) < defaultFeatures[tier].maxMembers
        ) {
          dbFeatures[tier].maxMembers = defaultFeatures[tier].maxMembers;
        }
      } else {
        // Tier not in DB at all – use full default
        dbFeatures[tier] = defaultFeatures[tier];
      }
    }
    return dbFeatures;
  }

  async getMerchantPlanFeatures(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { plan: true, planExpiredAt: true },
    });

    if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');

    // Check expiry
    const now = new Date();
    const isExpired = merchant.planExpiredAt && merchant.planExpiredAt < now;

    const allFeatures = await this.getPlanFeatures();
    const planFeatures =
      allFeatures[merchant.plan || 'FREE'] || allFeatures['FREE'];

    return {
      ...planFeatures,
      isExpired,
      plan: merchant.plan,
    };
  }

  async checkFeatureLimit(
    merchantId: string,
    feature:
      | 'maxProducts'
      | 'maxMembers'
      | 'multiUser'
      | 'whiteLabel'
      | 'customDomain'
      | 'flashSale'
      | 'templateVariants'
      | 'instantWithdrawal'
      | 'customProductDetail'
      | 'buildApk'
      | 'prioritySupport'
      | 'resellerAcademy'
      | 'tldDomain',
    addingCount: number = 0,
  ) {
    const features = await this.getMerchantPlanFeatures(merchantId);

    if (features.isExpired) {
      throw new BadRequestException(
        'Masa aktif paket Anda telah habis. Silakan lakukan perpanjangan.',
      );
    }

    const booleanFeatures: Record<string, string> = {
      multiUser: 'Multi-User (Staff). Silakan upgrade ke LEGEND/SUPREME.',
      whiteLabel: 'White-Label. Silakan upgrade ke SUPREME.',
      customDomain: 'Custom Domain. Silakan upgrade ke PRO+',
      flashSale: 'Flash Sale Countdown. Silakan upgrade ke SUPREME.',
      templateVariants:
        'Variasi Template Website. Silakan upgrade ke LEGEND/SUPREME.',
      instantWithdrawal: 'Penarikan Saldo Instan. Silakan upgrade ke SUPREME.',
      customProductDetail:
        'Kustomisasi Detail Produk. Silakan upgrade ke SUPREME.',
      buildApk: 'Build Your APK. Silakan upgrade ke SUPREME.',
      prioritySupport:
        'Prioritized Support (WhatsApp). Silakan upgrade ke SUPREME.',
      resellerAcademy: 'Reseller Academy. Silakan upgrade ke SUPREME.',
      tldDomain: 'Domain TLD. Silakan upgrade ke SUPREME.',
    };

    if (booleanFeatures[feature] && !features[feature]) {
      throw new BadRequestException(
        `Paket Anda tidak mendukung fitur ${booleanFeatures[feature]}`,
      );
    }

    if (feature === 'maxProducts') {
      const count = await this.prisma.merchantProductPrice.count({
        where: { merchantId, isActive: true },
      });

      const totalAfterAdd = (count || 0) + addingCount;

      if (
        features.maxProducts !== undefined &&
        totalAfterAdd > features.maxProducts &&
        addingCount > 0
      ) {
        throw new BadRequestException(
          `Limit produk aktif terlampaui. Paket Anda hanya mengizinkan ${features.maxProducts} produk. (Saat ini ${count}, akan ditambah ${addingCount})`,
        );
      } else if (
        features.maxProducts !== undefined &&
        (count || 0) >= features.maxProducts &&
        addingCount === 0
      ) {
        throw new BadRequestException(
          `Limit produk aktif terlampaui (${count}/${features.maxProducts}). Silakan upgrade paket Anda.`,
        );
      }
    }

    if (feature === 'maxMembers') {
      const count = await this.prisma.user.count({
        where: {
          merchantId,
          role: { in: ['CUSTOMER', 'RESELLER'] },
        },
      });

      const totalAfterAdd = (count || 0) + addingCount;

      if (
        features.maxMembers !== undefined &&
        totalAfterAdd > features.maxMembers
      ) {
        throw new BadRequestException(
          `Limit member terlampaui. Paket Anda hanya mengizinkan ${features.maxMembers} member. (Saat ini ${count}/${features.maxMembers})`,
        );
      }
    }

    return true;
  }

  async updatePlanFeatures(features: any, operator: string) {
    return this.prisma.systemSetting.upsert({
      where: { key: 'saas_plan_features' },
      update: { value: JSON.stringify(features), updatedBy: operator },
      create: {
        key: 'saas_plan_features',
        value: JSON.stringify(features),
        group: 'SAAS',
        updatedBy: operator,
      },
    });
  }

  async getSaaSPerformance() {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: 'PAID' },
      select: { totalAmount: true, paidAt: true },
    });

    const totalRevenue = invoices.reduce(
      (acc, inv) => acc + Number(inv.totalAmount),
      0,
    );
    const activeMerchants = await this.prisma.merchant.count({
      where: { planExpiredAt: { gt: new Date() }, status: 'ACTIVE' },
    });
    const expiredMerchants = await this.prisma.merchant.count({
      where: { planExpiredAt: { lte: new Date() } },
    });

    // Simple churn calculation: expired / (active + expired)
    const churnRate =
      activeMerchants + expiredMerchants > 0
        ? (expiredMerchants / (activeMerchants + expiredMerchants)) * 100
        : 0;

    return {
      totalRevenue,
      activeMerchants,
      expiredMerchants,
      churnRate: churnRate.toFixed(2) + '%',
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSaaSCron() {
    this.logger.log('Menjalankan pengecekan harian untuk Subscription SaaS...');
    const now = new Date();

    // 1. Suspend merchants yg expired
    const expiredMerchants = await this.prisma.merchant.findMany({
      where: { planExpiredAt: { lte: now }, status: 'ACTIVE' },
    });

    for (const merchant of expiredMerchants) {
      await this.prisma.merchant.update({
        where: { id: merchant.id },
        data: { status: 'INACTIVE' }, // SUSPEND
      });
      this.logger.log(
        `Men-suspend merchant ${merchant.name} (${merchant.id}) karena plan kedaluwarsa.`,
      );
      // NOTE: Dalam real-world kita akan trigger notifikasi WA/Email ke merchant.
    }

    // 2. Mark OVERDUE invoices
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: { dueDate: { lt: now }, status: { in: ['UNPAID', 'PENDING'] } },
    });

    for (const invoice of overdueInvoices) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });
      this.logger.log(`Tandai invoice ${invoice.invoiceNo} sebagai OVERDUE.`);
    }
  }

  async createManualInvoice(
    merchantId: string,
    plan: MerchantPlan,
    amount: number,
    dueDate: Date,
    operator: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
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
        notes: `Dibuat secara manual oleh ${operator}`,
      },
    });
  }

  async getTierMappings() {
    return this.prisma.planTierMapping.findMany({
      orderBy: { plan: 'asc' },
    });
  }

  async updateTierMapping(id: string, tier: any, operator: string) {
    return this.prisma.planTierMapping.update({
      where: { id },
      data: {
        tier,
        updatedBy: operator,
      },
    });
  }
}
