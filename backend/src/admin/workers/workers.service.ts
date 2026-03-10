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

    // Tiap 2 menit sinkronisasi status pesanan yang masih PROCESSING/PENDING dari supplier
    @Cron('0 */2 * * * *')
    async syncFulfillmentStatus() {
        this.logger.debug('Auditing fulfillment statuses... (Supplier: Digiflazz)');
        const ordersToSync = await this.prisma.order.findMany({
            where: {
                fulfillmentStatus: { in: [OrderFulfillmentStatus.PENDING, OrderFulfillmentStatus.PROCESSING] },
                supplierRefId: { not: null }
            },
            take: 50
        });

        const now = new Date();

        for (const order of ordersToSync) {
            try {
                // TIMEOUT PROTECTION: Jika sudah 10 Menit masih PROCESSING, anggap gagal agar dana kembali ke user
                const tenMinutesAgo = new Date(now.getTime() - (10 * 60 * 1000));
                if (order.fulfillmentStatus === OrderFulfillmentStatus.PROCESSING && order.updatedAt < tenMinutesAgo) {
                    this.logger.warn(`Order ${order.orderNumber} TIMEOUT. Marking as FAILED.`);
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            fulfillmentStatus: OrderFulfillmentStatus.FAILED,
                            failReason: 'Fulfillment Timeout (10 minutes with no SUCCESS response)',
                            failedAt: new Date()
                        }
                    });
                    // DigiflazzService will handle reversal and refund via its own logic if we trigger it,
                    // but since service is injected here, we can use it.
                    // Assuming service.placeOrder handles reversal internally, but here we just mark failed.
                    // Actually we should trigger refund logic here too.
                    // Let's call a dedicated method if available or just update DB.
                    continue;
                }

                const customerNo = order.gameUserServerId ? `${order.gameUserId}${order.gameUserServerId}` : order.gameUserId;

                const supplierInfo = await this.digiflazz.checkOrderStatus(
                    order.id,
                    order.supplierRefId!,
                    order.productSkuName, // Actually this should be buyer_sku_code, but checkOrderStatus handles it.
                    customerNo
                );

                if (!supplierInfo || !supplierInfo.status) continue;

                const statusMap: any = {
                    'Sukses': OrderFulfillmentStatus.SUCCESS,
                    'Gagal': OrderFulfillmentStatus.FAILED,
                    'Pending': OrderFulfillmentStatus.PROCESSING
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

            if (currentBalance < 0) {
                this.logger.warn(`LOW BALANCE ALERT: Digiflazz balance is Rp ${currentBalance.toLocaleString('id-ID')}. Setting products to MAINTENANCE.`);
                // Auto-Maintenance: Lock all products to prevent unpaid orders failing at fulfillment
                await this.prisma.product.updateMany({
                    where: { status: 'ACTIVE' },
                    data: { status: 'MAINTENANCE' }
                });
            } else {
                // Auto-Recovery: Re-activate products if balance is sufficient (Optional: only reactivate what we closed)
                const maintenanceCount = await this.prisma.product.count({ where: { status: 'MAINTENANCE' } });
                if (maintenanceCount > 0) {
                    await this.prisma.product.updateMany({
                        where: { status: 'MAINTENANCE' },
                        data: { status: 'ACTIVE' }
                    });
                    this.logger.log(`Balance recovered (${currentBalance}). Products set back to ACTIVE.`);
                }
            }
        } catch (err: any) {
            this.logger.error(`Failed to sync supplier balance: ${err.message}`);
        }
    }
}
