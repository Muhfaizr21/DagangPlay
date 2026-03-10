"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
let MerchantsService = class MerchantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllMerchants(search, statusFilter) {
        const where = {};
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
        const mappedMerchants = await Promise.all(merchants.map(async (m) => {
            const resellersCount = await this.prisma.user.count({
                where: {
                    merchantId: m.id,
                    role: 'CUSTOMER',
                    status: 'ACTIVE',
                },
            });
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
                domain: m.domain || `${m.slug}.dagangplay.com`,
                plan: m.plan,
                status: m.status,
                resellers: resellersCount,
                omset: Number(omsetAgg._sum.totalPrice || 0),
                date: m.createdAt.toISOString().split('T')[0],
                isOfficial: m.isOfficial,
            };
        }));
        return mappedMerchants;
    }
    async setMerchantStatus(id, status, reason) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant tidak ditemukan');
        if (merchant.isOfficial && status === client_1.MerchantStatus.SUSPENDED) {
            throw new Error('Official merchant cannot be suspended');
        }
        const updated = await this.prisma.merchant.update({
            where: { id },
            data: { status },
        });
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
    async getMerchantDetail(id) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true, status: true, isVerified: true } },
                members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
                _count: { select: { orders: true, deposits: true, supportTickets: true } }
            }
        });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant tidak ditemukan');
        const resellersCount = await this.prisma.user.count({
            where: { merchantId: merchant.id, role: 'CUSTOMER' }
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
    async updateMerchantSettings(id, settingsUpdate) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant tidak ditemukan');
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
    async resetOwnerPassword(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId }, include: { owner: true } });
        if (!merchant || !merchant.owner)
            throw new common_1.NotFoundException('Merchant/Owner tidak ditemukan');
        await this.prisma.user.update({
            where: { id: merchant.owner.id },
            data: { password: 'NEW_HASHED_PASSWORD_DAGANGPLAY123!' }
        });
        await this.prisma.auditLog.create({
            data: { action: 'RESET_OWNER_PASSWORD', entity: 'Merchant', entityId: merchantId, newData: {}, oldData: {} }
        });
        return { success: true, message: 'Password Owner direset menjadi DagangPlay123!' };
    }
};
exports.MerchantsService = MerchantsService;
exports.MerchantsService = MerchantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MerchantsService);
//# sourceMappingURL=merchants.service.js.map