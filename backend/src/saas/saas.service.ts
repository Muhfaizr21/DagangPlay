import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SaasService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('webhook') private webhookQueue: Queue,
  ) {}

  // ====================== BACKGROUND WORKERS ======================
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySettlement() {
    console.log(
      '[SaasService] Menjalankan cron job Daily Settlement (Escrow -> Available)...',
    );

    // Tarik semua merchant yang escrownya > 0
    const merchants = await this.prisma.merchant.findMany({
      where: { escrowBalance: { gt: 0 } },
    });

    for (const m of merchants) {
      const amountToSettle = m.escrowBalance;

      try {
        await this.prisma.$transaction(async (tx) => {
          const updatedMerchant = await tx.merchant.update({
            where: { id: m.id },
            data: {
              escrowBalance: { decrement: amountToSettle },
              availableBalance: { increment: amountToSettle },
            },
          });

          await tx.merchantLedgerMovement.create({
            data: {
              merchantId: m.id,
              type: 'SETTLEMENT',
              amount: amountToSettle,
              description: 'Pencairan Otomatis Saldo Escrow Harian',
              escrowBefore: m.escrowBalance,
              escrowAfter: updatedMerchant.escrowBalance,
              availableBefore: m.availableBalance,
              availableAfter: updatedMerchant.availableBalance,
            },
          });
        });
        console.log(
          `[SaasService] Selesai: Rp ${amountToSettle} dipindahkan untuk merchant ${m.name}`,
        );
      } catch (e) {
        console.error(
          `[SaasService] Gagal memindahkan escrow merchant ${m.name}`,
          e,
        );
      }
    }
  }

  // ====================== ADMIN METHODS ======================
  async getGlobalLedgers() {
    const merchants = await this.prisma.merchant.findMany({
      select: {
        id: true,
        name: true,
        escrowBalance: true,
        availableBalance: true,
      },
    });

    const totalEscrow = merchants.reduce((sum, m) => sum + m.escrowBalance, 0);
    const totalAvailable = merchants.reduce(
      (sum, m) => sum + m.availableBalance,
      0,
    );

    return { totalEscrow, totalAvailable, merchants };
  }

  async getDeadLetterQueue() {
    return this.prisma.deadLetterQueue.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async requeueDLQJob(dlqId: string) {
    const job = await this.prisma.deadLetterQueue.findUnique({
      where: { id: dlqId },
    });
    if (!job) throw new NotFoundException('DLQ Job Not Found');

    if (job.queueName === 'webhook') {
      await this.webhookQueue.add('Requeued_Delivery', job.jobData);
    }
    await this.prisma.deadLetterQueue.update({
      where: { id: dlqId },
      data: { isResolved: true },
    });

    return { success: true, message: 'Job Requeued Successfully.' };
  }

  async getMerchantDomainsStatus() {
    return this.prisma.merchant.findMany({
      where: { domain: { not: null } },
      select: {
        id: true,
        name: true,
        domain: true,
        forceHttps: true,
      },
    });
  }

  // ====================== MERCHANT METHODS ======================
  async getMerchantLedger(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        escrowBalance: true,
        availableBalance: true,
        autoPayoutEnabled: true,
        autoPayoutSchedule: true,
        autoPayoutThreshold: true,
      },
    });

    const recentMovements = await this.prisma.merchantLedgerMovement.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { ...merchant, movements: recentMovements };
  }

  async updateAutoPayoutConfig(body: any) {
    const { merchantId, enabled, threshold, schedule } = body;
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        autoPayoutEnabled: enabled,
        autoPayoutThreshold: threshold,
        autoPayoutSchedule: schedule,
      },
    });
  }

  async getMerchantWebhookLogs(merchantId: string) {
    return this.prisma.webhookDeliveryLog.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
  }

  async retryMerchantWebhook(logId: string, merchantId: string) {
    const log = await this.prisma.webhookDeliveryLog.findUnique({
      where: { id: logId },
    });
    if (!log) throw new NotFoundException('Log not found');

    // SECURITY: Ensure the log belongs to the requesting merchant
    if (log.merchantId !== merchantId) {
      throw new ForbiddenException(
        'You do not have permission to retry this webhook',
      );
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { apiKeys: { where: { isActive: true }, take: 1 } },
    });

    const activeApiKey = merchant?.apiKeys?.[0];

    await this.webhookQueue.add(
      'ManualRetries',
      {
        merchantId: log.merchantId,
        endpointUrl: log.endpointUrl,
        event: log.event,
        payload: log.requestPayload,
        secretKey: activeApiKey?.secret || 'dummy_secret',
      },
      {
        priority: 1, // Higher priority for manual trigger
      },
    );

    return {
      success: true,
      message: 'Webhook sent to queue for retrying (Priority: High)',
    };
  }
}
