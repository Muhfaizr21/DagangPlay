import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(private prisma: PrismaService) { }

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
}
