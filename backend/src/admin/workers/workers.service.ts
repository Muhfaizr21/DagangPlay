import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { JobStatus, OrderFulfillmentStatus } from '@prisma/client';

import { DigiflazzService } from '../digiflazz/digiflazz.service';

@Injectable()
export class WorkersService {
    private readonly logger = new Logger(WorkersService.name);

    constructor(
        private prisma: PrismaService,
        private digiflazz: DigiflazzService
    ) { }

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

    // Tiap 2 menit sinkronisasi status pesanan yang masih PENDING dari supplier
    @Cron('0 */2 * * * *')
    async syncPendingOrders() {
        this.logger.debug('Auditing pending orders... (Supplier: Digiflazz)');
        const pendingOrders = await this.prisma.order.findMany({
            where: {
                fulfillmentStatus: OrderFulfillmentStatus.PENDING,
                supplierRefId: { not: null }
            },
            take: 20
        });

        for (const order of pendingOrders) {
            try {
                // Digiflazz customer_no format usually target + [server]
                const customerNo = order.gameUserServerId ? `${order.gameUserId}${order.gameUserServerId}` : order.gameUserId;

                const supplierInfo = await this.digiflazz.checkOrderStatus(
                    order.id,
                    order.supplierRefId!,
                    order.productSkuId, // assume sku is productSkuId for lookup
                    customerNo
                );

                if (!supplierInfo) continue;

                const statusMap: any = {
                    'Sukses': OrderFulfillmentStatus.SUCCESS,
                    'Gagal': OrderFulfillmentStatus.FAILED,
                    'Pending': OrderFulfillmentStatus.PENDING
                };

                const newStatus = statusMap[supplierInfo.status] || order.fulfillmentStatus;

                if (newStatus !== order.fulfillmentStatus) {
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            fulfillmentStatus: newStatus,
                            serialNumber: supplierInfo.sn || order.serialNumber,
                            completedAt: newStatus === OrderFulfillmentStatus.SUCCESS ? new Date() : null,
                            failedAt: newStatus === OrderFulfillmentStatus.FAILED ? new Date() : null,
                            failReason: newStatus === OrderFulfillmentStatus.FAILED ? supplierInfo.message : null
                        }
                    });
                    this.logger.log(`Order ${order.orderNumber} updated to ${newStatus}`);
                }
            } catch (err: any) {
                this.logger.error(`Failed to sync order ${order.orderNumber}: ${err.message}`);
            }
        }
    }

    // Tiap jam otomatis singkron saldo supplier (Audit & Alert)
    @Cron(CronExpression.EVERY_HOUR)
    async syncSupplierBalance() {
        this.logger.debug('Auditing supplier balance...');
        try {
            const supplier = await this.prisma.supplier.findUnique({
                where: { code: 'DIGIFLAZZ' }
            });

            if (!supplier) return;

            const currentBalance = await this.digiflazz.checkBalance();
            await this.prisma.supplier.update({
                where: { id: supplier.id },
                data: { balance: currentBalance, lastSyncAt: new Date() }
            });

            if (currentBalance < 500000) {
                this.logger.warn(`LOW BALANCE ALERT: Digiflazz balance is Rp ${currentBalance.toLocaleString('id-ID')}`);
                // Future: Send notification to Super Admin Slack/Email
            }
        } catch (err: any) {
            this.logger.error(`Failed to sync supplier balance: ${err.message}`);
        }
    }
}
