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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers(search, role, status) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role && role !== 'ALL')
            where.role = role;
        if (status && status !== 'ALL')
            where.status = status;
        return this.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                balance: true,
                bonusBalance: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: { ordersAsCustomer: true, ordersAsReseller: true }
                }
            }
        });
    }
    async getUserDetail(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                merchantMembers: { include: { merchant: true } },
            }
        });
        if (!user)
            throw new common_1.NotFoundException('User tidak ditemukan');
        return user;
    }
    async updateUserStatus(id, status, reason) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User tidak ditemukan');
        if (user.isOfficial && status === client_1.UserStatus.SUSPENDED) {
            throw new common_1.BadRequestException('Akun Official tidak dapat disuspend');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: { status }
        });
        await this.prisma.auditLog.create({
            data: {
                action: `USER_${status}`,
                entity: 'User',
                entityId: id,
                newData: { status, reason },
                oldData: { status: user.status }
            }
        });
        return updated;
    }
    async adjustBalance(id, operatorId, type, amount, note) {
        if (!amount || amount <= 0)
            throw new common_1.BadRequestException('Amount invalid');
        if (!note)
            throw new common_1.BadRequestException('Alasan harus diisi');
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id } });
            if (!user)
                throw new common_1.NotFoundException('User tidak ditemukan');
            const balanceBefore = user.balance;
            let balanceAfter = Number(balanceBefore);
            if (type === 'ADD') {
                balanceAfter += amount;
            }
            else {
                if (balanceAfter < amount)
                    throw new common_1.BadRequestException('Saldo user tidak mencukupi untuk pengurangan');
                balanceAfter -= amount;
            }
            await tx.user.update({
                where: { id },
                data: { balance: balanceAfter }
            });
            await tx.balanceTransaction.create({
                data: {
                    userId: id,
                    type: 'ADJUSTMENT',
                    amount: amount,
                    balanceBefore: balanceBefore,
                    balanceAfter: balanceAfter,
                    note: `Manual: ${type} ${note} (By ${operatorId})`
                }
            });
            return { success: true, balanceAfter };
        });
    }
    async getBalanceHistories(id, limit = 50) {
        return this.prisma.balanceTransaction.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
    async getLoginSessions(id) {
        return this.prisma.userSession.findMany({
            where: { userId: id, expiresAt: { gt: new Date() } },
            orderBy: { lastActiveAt: 'desc' }
        });
    }
    async forceLogoutAllSessions(id) {
        const res = await this.prisma.userSession.deleteMany({
            where: { userId: id }
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'FORCE_LOGOUT_ALL',
                entity: 'User',
                entityId: id,
                newData: { sessionsRevoked: res.count },
                oldData: {}
            }
        });
        return { success: true, revoked: res.count };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map