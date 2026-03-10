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
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let CommissionsService = class CommissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCommissions(merchantId) {
        const resellerCommissions = await this.prisma.commission.groupBy({
            by: ['userId'],
            where: {
                status: 'PENDING',
                order: { merchantId }
            },
            _sum: { amount: true },
            _count: { id: true }
        });
        const details = await Promise.all(resellerCommissions.map(async (rc) => {
            const user = await this.prisma.user.findUnique({ where: { id: rc.userId }, select: { name: true, email: true } });
            return {
                userId: rc.userId,
                name: user?.name,
                email: user?.email,
                totalPendingAmount: rc._sum?.amount || 0,
                totalOrders: rc._count?.id || 0
            };
        }));
        const totalPending = details.reduce((sum, d) => sum + Number(d.totalPendingAmount || 0), 0);
        return {
            totalPending,
            resellerCommissions: details
        };
    }
    async settleCommissions(merchantId, resellerId) {
        const whereClause = {
            status: 'PENDING',
            order: { merchantId }
        };
        if (resellerId) {
            whereClause.userId = resellerId;
        }
        const commissions = await this.prisma.commission.findMany({
            where: whereClause,
            include: { user: true }
        });
        if (commissions.length === 0)
            return { success: false, message: 'Tidak ada komisi pending' };
        await this.prisma.$transaction(async (tx) => {
            const userAmounts = {};
            for (const c of commissions) {
                userAmounts[c.userId] = (userAmounts[c.userId] || 0) + Number(c.amount);
            }
            for (const [uid, amount] of Object.entries(userAmounts)) {
                await tx.user.update({
                    where: { id: uid },
                    data: { balance: { increment: amount } }
                });
                await tx.balanceTransaction.create({
                    data: {
                        userId: uid,
                        type: 'COMMISSION_PAYMENT',
                        amount: amount,
                        description: 'Settlement Komisi'
                    }
                });
            }
            await tx.commission.updateMany({
                where: whereClause,
                data: {
                    status: 'SETTLED',
                    settledAt: new Date()
                }
            });
        });
        return { success: true, count: commissions.length, message: 'Komisi berhasil dicairkan ke saldo reseller' };
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map