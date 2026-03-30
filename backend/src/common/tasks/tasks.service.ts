import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { WhatsappService } from '../notifications/whatsapp.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private prisma: PrismaService,
        private whatsappService: WhatsappService
    ) { }

    /**
     * Cleans up expired/unpaid invoices and old audit logs daily at midnight.
     * This keeps the database lean and performant.
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCleanup() {
        this.logger.log('Starting daily cleanup task...');

        try {
            // 1. Mark unpaid invoices as EXPIRED if past due
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const expiredInvoices = await this.prisma.invoice.updateMany({
                where: {
                    status: 'UNPAID',
                    createdAt: { lt: thirtyDaysAgo },
                },
                data: {
                    status: 'OVERDUE',
                },
            });
            this.logger.log(`Cleaned up ${expiredInvoices.count} expired invoices.`);

            // 2. Archive or delete extremely old audit logs (e.g., older than 90 days)
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const deletedLogs = await this.prisma.auditLog.deleteMany({
                where: {
                    createdAt: { lt: ninetyDaysAgo },
                    // Maybe keep critical actions, but for balance/general logs, delete:
                    action: { notIn: ['SUBSCRIBE_MERCHANT', 'WITHDRAWAL_COMPLETED', 'ORDER_SUCCESS'] }
                },
            });
            this.logger.log(`Deleted ${deletedLogs.count} old audit logs.`);

            // 3. Clean up expired OTPs
            const deletedOtps = await this.prisma.otpVerification.deleteMany({
                where: {
                    expiresAt: { lt: new Date() },
                },
            });
            this.logger.log(`Deleted ${deletedOtps.count} expired OTP tokens.`);

            // 4. Clean up old login attempts (older than 30 days)
            const thirtyDaysAgoLogs = new Date();
            thirtyDaysAgoLogs.setDate(thirtyDaysAgoLogs.getDate() - 30);

            await this.prisma.loginAttempt.deleteMany({
                where: { createdAt: { lt: thirtyDaysAgoLogs } }
            });

            // 5. Clean up expired user sessions
            await this.prisma.userSession.deleteMany({
                where: { expiresAt: { lt: new Date() } }
            });

        } catch (error) {
            this.logger.error('Error during cleanup task:', error);
        }
    }

    /**
     * Checks frequently for expired orders (to avoid them getting stuck if callbacks fail)
     * and downgrades merchants whose subscriptions have expired.
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleFrequentChecks() {
        this.logger.log('Starting frequent checks (Expired Orders & Plans)...');
        try {
            // Cancel expired orders that are still pending
            const expiredOrders = await this.prisma.order.updateMany({
                where: {
                    paymentStatus: 'PENDING',
                    expiredAt: { lt: new Date() }
                },
                data: {
                    paymentStatus: 'EXPIRED',
                    fulfillmentStatus: 'FAILED',
                    failReason: 'Pesanan dibatalkan otomatis karena melewati batas waktu pembayaran.'
                }
            });
            if (expiredOrders.count > 0) this.logger.log(`Cancelled ${expiredOrders.count} expired orders.`);

            // FIX E: Downgrade expired merchant plans WITH 3-DAY GRACE PERIOD
            // Prevents mid-transaction plan changes that disrupt active checkouts
            const gracePeriodCutoff = new Date();
            gracePeriodCutoff.setDate(gracePeriodCutoff.getDate() - 3);

            const expiredPlans = await this.prisma.merchant.updateMany({
                where: {
                    plan: { not: 'FREE' },
                    planExpiredAt: { lt: gracePeriodCutoff }
                },
                data: {
                    plan: 'FREE'
                }
            });
            if (expiredPlans.count > 0) this.logger.log(`Downgraded ${expiredPlans.count} merchants to FREE plan (after 3-day grace period).`);

        } catch (error) {
            this.logger.error('Error during frequent checks:', error);
        }
    }

    /**
     * Alerting for MASS FULFILLMENT failures.
     * Cek jika dalam 15 menit terakhir ada banyak transaksi GAGAL.
     */
    @Cron('*/15 * * * *')
    async monitorFails() {
        // Find failed orders in the last 15 minutes
        const fifteenMinsAgo = new Date();
        fifteenMinsAgo.setMinutes(fifteenMinsAgo.getMinutes() - 15);

        try {
            const failedCount = await this.prisma.order.count({
                where: {
                    fulfillmentStatus: 'FAILED',
                    failedAt: { gte: fifteenMinsAgo }
                }
            });

            // Threshold: jika ada >= 3 kegagalan dalam 15 menit
            if (failedCount >= 3) {
                this.logger.error(`[ALERT] Detected ${failedCount} fulfillment failures in the last 15 minutes!`);
                
                await this.whatsappService.sendAdminSummary(
                    `🚨 *CRITICAL ALERT: MASS FULFILLMENT FAILURE*\n\n` +
                    `Terdeteksi *${failedCount} pesanan GAGAL* diproses (fulfillment error) dalam 15 menit terakhir.\n\n` +
                    `Segera cek Dashboard / log sistem! Pastikan saldo Digiflazz mencukupi atau tidak ada maintenance dari supplier.`
                ).catch(() => {});
            }
        } catch (e) {
            this.logger.error('Error monitoring failures:', e);
        }
    }
}
