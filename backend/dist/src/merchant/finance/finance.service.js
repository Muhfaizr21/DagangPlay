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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFinanceOverview(merchantId, ownerId) {
        const orders = await this.prisma.order.findMany({
            where: { merchantId, fulfillmentStatus: 'SUCCESS', paymentStatus: 'PAID' },
            select: { totalPrice: true }
        });
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
        const deposits = await this.prisma.deposit.findMany({
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        const withdrawals = await this.prisma.withdrawal.findMany({
            where: { userId: ownerId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return {
            balance: totalRevenue,
            deposits,
            withdrawals
        };
    }
    async requestWithdrawal(ownerId, amount, bankName, bankAccountName, bankAccountNumber) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        return this.prisma.withdrawal.create({
            data: {
                userId: ownerId,
                amount,
                fee: 0,
                netAmount: amount,
                bankName,
                bankAccountName,
                bankAccountNumber,
                status: 'PENDING',
            }
        });
    }
    async requestDeposit(merchantId, ownerId, amount, method) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        return this.prisma.deposit.create({
            data: {
                userId: ownerId,
                merchantId,
                amount,
                method,
                status: 'PENDING'
            }
        });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map