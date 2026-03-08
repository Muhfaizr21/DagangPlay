import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MerchantStatus } from '@prisma/client';

@Injectable()
export class MerchantsService {
    constructor(private prisma: PrismaService) { }

    async getAllMerchants(search?: string, statusFilter?: string) {
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { domain: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (statusFilter && statusFilter !== 'ALL') {
            where.status = statusFilter;
        }

        const merchants = await this.prisma.merchant.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // We fetch aggregate data for each merchant
        // For production with thousands of merchants, this should be a raw SQL query or done differently,
        // but for now mapping sequentially or via Promise.all is fine.

        const mappedMerchants = await Promise.all(
            merchants.map(async (m) => {
                // Reseller Count
                const resellersCount = await this.prisma.user.count({
                    where: {
                        merchantId: m.id,
                        role: 'RESELLER',
                        status: 'ACTIVE',
                    },
                });

                // Omset Calculation
                const omsetAgg = await this.prisma.order.aggregate({
                    where: {
                        merchantId: m.id,
                        paymentStatus: 'PAID',
                    },
                    _sum: {
                        totalPrice: true,
                    },
                });

                return {
                    id: m.id,
                    name: m.name,
                    domain: m.domain || `${m.slug}.dagangplay.com`, // Default domain if none
                    plan: m.plan,
                    status: m.status,
                    resellers: resellersCount,
                    omset: Number(omsetAgg._sum.totalPrice || 0),
                    date: m.createdAt.toISOString().split('T')[0],
                    isOfficial: m.isOfficial,
                };
            })
        );

        return mappedMerchants;
    }

    async setMerchantStatus(id: string, status: MerchantStatus, reason?: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');
        if (merchant.isOfficial && status === MerchantStatus.SUSPENDED) {
            throw new Error('Official merchant cannot be suspended');
        }

        // Update status
        const updated = await this.prisma.merchant.update({
            where: { id },
            data: { status },
        });

        // Create Audit Log (Feature 1.12 requirement)
        await this.prisma.auditLog.create({
            data: {
                action: `UPDATE_STATUS_${status}`,
                entity: 'Merchant',
                entityId: id,
                newData: { status, reason },
                oldData: { status: merchant.status },
            }
        });

        return updated;
    }

    async getMerchantDetail(id: string) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true, status: true, isVerified: true } },
                members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
                _count: { select: { orders: true, deposits: true, tickets: true } }
            }
        });
        if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');

        const resellersCount = await this.prisma.user.count({
            where: { merchantId: merchant.id, role: 'RESELLER' }
        });

        const omsetAgg = await this.prisma.order.aggregate({
            where: { merchantId: merchant.id, paymentStatus: 'PAID' },
            _sum: { totalPrice: true }
        });

        return {
            ...merchant,
            resellersCount,
            omset: Number(omsetAgg._sum.totalPrice || 0)
        };
    }

    async updateMerchantSettings(id: string, settingsUpdate: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');

        // Merge existing settings with new one 
        // e.g., platformFee, minDeposit, maxDeposit, isMaintenance, allowCustomDomain
        const currentSettings = typeof merchant.settings === 'object' && merchant.settings !== null ? merchant.settings : {};
        const newSettings = { ...currentSettings, ...settingsUpdate };

        const updated = await this.prisma.merchant.update({
            where: { id },
            data: { settings: newSettings }
        });

        await this.prisma.auditLog.create({
            data: {
                action: 'UPDATE_MERCHANT_SETTINGS',
                entity: 'Merchant',
                entityId: id,
                newData: settingsUpdate,
                oldData: {}
            }
        });

        return updated;
    }

    async resetOwnerPassword(merchantId: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId }, include: { owner: true } });
        if (!merchant || !merchant.owner) throw new NotFoundException('Merchant/Owner tidak ditemukan');

        // Logic reset password (mocking bcrypt for now)
        // const hash = await bcrypt.hash('DagangPlay123!', 10);
        await this.prisma.user.update({
            where: { id: merchant.owner.id },
            data: { password: 'NEW_HASHED_PASSWORD_DAGANGPLAY123!' } // in real app: bcrypt
        });

        await this.prisma.auditLog.create({
            data: { action: 'RESET_OWNER_PASSWORD', entity: 'Merchant', entityId: merchantId, newData: {}, oldData: {} }
        });

        return { success: true, message: 'Password Owner direset menjadi DagangPlay123!' };
    }
}
