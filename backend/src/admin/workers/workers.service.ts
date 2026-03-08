import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { JobStatus, OrderFulfillmentStatus } from '@prisma/client';

@Injectable()
export class WorkersService {
    private readonly logger = new Logger(WorkersService.name);

    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleJobQueue() {
        this.logger.debug('Menjalankan background jobs Worker dari JobQueue Prisma...');
        const pendingJobs = await this.prisma.jobQueue.findMany({
            where: { status: JobStatus.PENDING },
            take: 10
        });

        for (const job of pendingJobs) {
            try {
                await this.prisma.jobQueue.update({ where: { id: job.id }, data: { status: JobStatus.RUNNING } });

                // Logika Job Type
                if (job.type === 'SYNC_SUPPLIER') {
                    // Simulasi Sync
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status: JobStatus.SUCCESS, completedAt: new Date() }
                });

                this.logger.log(`Job ${job.id} type ${job.type} SUCCESS`);
            } catch (e: any) {
                // Implementasi logic retry
                const retries = (job.retryCount || 0) + 1;
                const status = retries >= 3 ? JobStatus.FAILED : JobStatus.RETRYING;

                await this.prisma.jobQueue.update({
                    where: { id: job.id },
                    data: { status, retryCount: retries, error: e.message }
                });
                this.logger.error(`Job ${job.id} FAILED, Retry count: ${retries}`);
            }
        }
    }

    // Tiap jam check tagihan langganan SaaS (Subscription)
    @Cron(CronExpression.EVERY_HOUR)
    async checkSubscriptions() {
        // Implementasi check merchant expired dan non-aktifkan status
        this.logger.debug('Auditing merchant subscription...');
    }
}
