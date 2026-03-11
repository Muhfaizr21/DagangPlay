"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantsService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../common/utils/pagination");
let MerchantsService = class MerchantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllMerchants(search, statusFilter, page = 1, perPage = 10) {
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
        const paginated = await (0, pagination_1.paginate)(this.prisma.merchant, {
            where,
            orderBy: { createdAt: 'desc' },
        }, { page, perPage });
        const merchantIds = paginated.data.map((m) => m.id);
        const [resellerCounts, omsetAggs] = await Promise.all([
            this.prisma.user.groupBy({
                by: ['merchantId'],
                where: { merchantId: { in: merchantIds }, role: 'CUSTOMER', status: 'ACTIVE' },
                _count: { _all: true }
            }),
            this.prisma.order.groupBy({
                by: ['merchantId'],
                where: { merchantId: { in: merchantIds }, paymentStatus: 'PAID' },
                _sum: { totalPrice: true }
            })
        ]);
        const mappedData = paginated.data.map((m) => {
            const resellers = resellerCounts.find(rc => rc.merchantId === m.id)?._count._all || 0;
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
    async updateMerchantSettings(id, updateData) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id } });
        if (!merchant)
            throw new common_1.NotFoundException('Merchant tidak ditemukan');
        const { domain, plan, planExpiredAt, isOfficial, status, ...settingsOnly } = updateData;
        if (domain && domain !== merchant.domain) {
            const existingDomain = await this.prisma.merchant.findUnique({ where: { domain } });
            if (existingDomain && existingDomain.id !== id) {
                throw new Error('Domain sudah digunakan oleh merchant lain');
            }
        }
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
    async resetOwnerPassword(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId }, include: { owner: true } });
        if (!merchant || !merchant.owner)
            throw new common_1.NotFoundException('Merchant/Owner tidak ditemukan');
        const newPass = 'DagangPlay123!';
        const hashedPassword = await bcrypt.hash(newPass, 10);
        await this.prisma.user.update({
            where: { id: merchant.owner.id },
            data: { password: hashedPassword }
        });
        await this.prisma.auditLog.create({
            data: { action: 'RESET_OWNER_PASSWORD', entity: 'Merchant', entityId: merchantId, newData: {}, oldData: {} }
        });
        return { success: true, message: `Password Owner direset menjadi ${newPass}` };
    }
};
exports.MerchantsService = MerchantsService;
exports.MerchantsService = MerchantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MerchantsService);
//# sourceMappingURL=merchants.service.js.map