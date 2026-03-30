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
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const subscriptions_service_1 = require("../../admin/subscriptions/subscriptions.service");
let MembersService = class MembersService {
    prisma;
    subscriptionsService;
    constructor(prisma, subscriptionsService) {
        this.prisma = prisma;
        this.subscriptionsService = subscriptionsService;
    }
    async getAllUsers(merchantId, search, roleFilter) {
        const whereClause = { merchantId };
        if (roleFilter) {
            whereClause.role = roleFilter;
        }
        else {
            whereClause.role = { in: [client_1.Role.CUSTOMER, client_1.Role.RESELLER] };
        }
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                role: true,
                balance: true,
                createdAt: true,
                _count: {
                    select: { ordersAsCustomer: { where: { paymentStatus: 'PAID' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createManualUser(merchantId, data) {
        const existing = await this.prisma.user.findFirst({
            where: { phone: data.phone, merchantId }
        });
        if (existing)
            throw new common_1.BadRequestException('Nomor WhatsApp sudah terdaftar sebagai member di toko Anda.');
        await this.subscriptionsService.checkFeatureLimit(merchantId, 'maxMembers');
        const hashedPassword = await bcrypt.hash('MEMBER_' + Math.random().toString(36).substring(7), 10);
        return this.prisma.user.create({
            data: {
                name: data.name,
                phone: data.phone,
                merchantId,
                password: hashedPassword,
                role: client_1.Role.CUSTOMER,
                referralCode: 'MEMBER_' + Math.random().toString(36).substring(7),
                isGuest: false
            }
        });
    }
    async updateUser(merchantId, userId, data) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, merchantId } });
        if (!user)
            throw new common_1.NotFoundException('User tidak ditemukan.');
        if (data.phone !== user.phone) {
            const existing = await this.prisma.user.findFirst({
                where: { phone: data.phone, merchantId, NOT: { id: userId } }
            });
            if (existing)
                throw new common_1.BadRequestException('Nomor WhatsApp baru sudah digunakan oleh member lain.');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone
            }
        });
    }
    async toggleResellerStatus(merchantId, userId, targetRole) {
        if (![client_1.Role.CUSTOMER, client_1.Role.RESELLER].includes(targetRole)) {
            throw new common_1.BadRequestException('Role target tidak valid.');
        }
        const user = await this.prisma.user.findFirst({
            where: { id: userId, merchantId }
        });
        if (!user)
            throw new common_1.NotFoundException('User tidak ditemukan di merchant ini.');
        return this.prisma.user.update({
            where: { id: userId },
            data: { role: targetRole }
        });
    }
    async getTopResellers(merchantId) {
        const topResellers = await this.prisma.user.findMany({
            where: { merchantId, role: client_1.Role.RESELLER },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { ordersAsCustomer: { where: { paymentStatus: 'PAID' } } }
                }
            },
            take: 50,
            orderBy: { ordersAsCustomer: { _count: 'desc' } }
        });
        const result = await Promise.all(topResellers.map(async (reseller) => {
            const omset = await this.prisma.order.aggregate({
                where: { userId: reseller.id, paymentStatus: 'PAID', merchantId },
                _sum: { totalPrice: true }
            });
            return {
                id: reseller.id,
                name: reseller.name,
                totalTrx: reseller._count.ordersAsCustomer,
                totalOmset: Number(omset._sum.totalPrice || 0)
            };
        }));
        return result.sort((a, b) => b.totalOmset - a.totalOmset);
    }
    async getBalanceHistory(merchantId, resellerId) {
        return [];
    }
    async adjustBalance(merchantId, merchantUserId, resellerId, type, amount, notes) {
        return { success: true };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscriptions_service_1.SubscriptionsService])
], MembersService);
//# sourceMappingURL=members.service.js.map