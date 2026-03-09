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
    async getPendingCommissions(search) {
        const where = { status: 'PENDING' };
        const commissions = await this.prisma.commission.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, role: true, email: true } },
                order: { select: { id: true, orderNumber: true, productName: true, totalPrice: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return commissions;
    }
    async settleCommission(id, operatorId) {
        const commission = await this.prisma.commission.findUnique({ where: { id } });
        if (!commission)
            throw new common_1.NotFoundException('Komisi tidak ditemukan');
        if (commission.status !== 'PENDING')
            throw new common_1.BadRequestException('Bukan status PENDING');
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.commission.update({
                where: { id },
                data: { status: 'SETTLED', settledAt: new Date() }
            });
            const user = await tx.user.findUnique({ where: { id: commission.userId } });
            if (user) {
                const amount = Number(commission.amount);
                const current = Number(user.balance);
                await tx.user.update({
                    where: { id: user.id },
                    data: { balance: current + amount }
                });
                await tx.balanceTransaction.create({
                    data: {
                        userId: user.id,
                        type: 'COMMISSION',
                        amount,
                        balanceBefore: current,
                        balanceAfter: current + amount,
                        orderId: commission.orderId,
                        note: `Pencairan Komisi Order #${commission.orderId}`
                    }
                });
            }
            await tx.auditLog.create({
                data: {
                    action: 'SETTLE_COMMISSION',
                    entity: 'Commission',
                    entityId: id,
                    newData: { status: 'SETTLED' },
                    oldData: { status: 'PENDING' }
                }
            });
            return updated;
        });
    }
    async settleBulkCommissions(operatorId) {
        const pendingComms = await this.prisma.commission.findMany({
            where: { status: 'PENDING' },
            take: 100
        });
        if (pendingComms.length === 0)
            return { message: 'Tidak ada komisi pending' };
        let settledCount = 0;
        for (const comm of pendingComms) {
            try {
                await this.settleCommission(comm.id, operatorId);
                settledCount++;
            }
            catch (err) {
            }
        }
        return { message: `Berhasil mencairkan ${settledCount} komisi.` };
    }
    async getDownlineTree(userId) {
        const where = {};
        if (userId) {
            where.parentId = userId;
        }
        return this.prisma.downlineTree.findMany({
            where,
            include: {
                parent: { select: { id: true, name: true, role: true } },
                child: { select: { id: true, name: true, role: true } }
            },
            take: 50
        });
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map