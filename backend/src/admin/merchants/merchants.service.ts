import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MerchantStatus, Role } from '@prisma/client';
import { paginate } from '../../common/utils/pagination';

@Injectable()
export class MerchantsService {
    constructor(private prisma: PrismaService) { }

    async getAllMerchants(search?: string, statusFilter?: string, page: number = 1, perPage: number = 10) {
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

        const paginated = await paginate(this.prisma.merchant, {
            where,
            orderBy: { createdAt: 'desc' },
        }, { page, perPage });

        const merchantIds = paginated.data.map((m: any) => m.id);

        // Batch fetch counts and omset to avoid N+1
        const [resellerCounts, omsetAggs] = await Promise.all([
            this.prisma.user.groupBy({
                by: ['merchantId'],
                where: { merchantId: { in: merchantIds }, role: Role.RESELLER, status: 'ACTIVE' },
                _count: { _all: true }
            }),
            this.prisma.order.groupBy({
                by: ['merchantId'],
                where: { merchantId: { in: merchantIds }, paymentStatus: 'PAID' },
                _sum: { totalPrice: true }
            })
        ]);

        const mappedData = paginated.data.map((m: any) => {
            const resellerData = resellerCounts.find(rc => rc.merchantId === m.id);
            const resellers = resellerData ? (resellerData._count as any)._all : 0;
            const omset = Number(omsetAggs.find(oa => oa.merchantId === m.id)?._sum.totalPrice || 0);

            return {
                id: m.id,
                name: m.name,
                domain: m.domain || `${m.slug}.dagangplay.com`,
                plan: m.plan,
                status: m.status,
                resellers,
                omset,
                date: m.createdAt.toISOString().split('T')[0],
                isOfficial: m.isOfficial,
            };
        });

        return {
            ...paginated,
            data: mappedData
        };
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
                _count: { select: { orders: true, deposits: true, supportTickets: true } }
            }
        });
        if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');

        const resellersCount = await this.prisma.user.count({
            where: { merchantId: merchant.id, role: Role.RESELLER }
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

    async updateMerchantSettings(id: string, updateData: any) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant) throw new NotFoundException('Merchant tidak ditemukan');

        const { domain, plan, planExpiredAt, isOfficial, status, ...settingsOnly } = updateData;

        // Ensure domain uniqueness if provided
        if (domain && domain !== merchant.domain) {
            const existingDomain = await this.prisma.merchant.findUnique({ where: { domain } });
            if (existingDomain && existingDomain.id !== id) {
                throw new Error('Domain sudah digunakan oleh merchant lain');
            }
        }

        // Current settings (JSON field) logic
        const currentSettings = typeof merchant.settings === 'object' && merchant.settings !== null ? merchant.settings : {};
        const newSettings = { ...currentSettings, ...settingsOnly };

        const updated = await this.prisma.merchant.update({
            where: { id },
            data: {
                settings: newSettings,
                domain: domain === "" ? null : domain,
                ...(plan && { plan }),
                ...(planExpiredAt && { planExpiredAt: new Date(planExpiredAt) }),
                ...(isOfficial !== undefined && { isOfficial }),
                ...(status && { status })
            }
        });

        await this.prisma.auditLog.create({
            data: {
                action: 'UPDATE_MERCHANT_FULL_SETTINGS',
                entity: 'Merchant',
                entityId: id,
                newData: updateData,
                oldData: {
                    plan: merchant.plan,
                    planExpiredAt: merchant.planExpiredAt,
                    status: merchant.status
                }
            }
        });

        return updated;
    }

    async resetOwnerPassword(merchantId: string) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId }, include: { owner: true } });
        if (!merchant || !merchant.owner) throw new NotFoundException('Merchant/Owner tidak ditemukan');

        // Logic F: Use random password instead of hardcoded
        const randomPass = Math.random().toString(36).substring(2, 10) + '!';
        const hashedPassword = await bcrypt.hash(randomPass, 10);

        await this.prisma.user.update({
            where: { id: merchant.owner.id },
            data: { password: hashedPassword }
        });

        await this.prisma.auditLog.create({
            data: { action: 'RESET_OWNER_PASSWORD', entity: 'Merchant', entityId: merchantId, newData: { target: merchant.owner.email }, oldData: {} }
        });

        return { success: true, message: `Password Owner berhasil direset secara aman. Password baru: ${randomPass}` };
    }

    async getMerchantResellers(merchantId: string) {
        return this.prisma.user.findMany({
            where: { merchantId, role: Role.RESELLER },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                createdAt: true,
                _count: {
                    select: { ordersAsCustomer: { where: { paymentStatus: 'PAID' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
