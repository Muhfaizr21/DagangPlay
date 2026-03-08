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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardSummary() {
        const revenueAgg = await this.prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalPrice: true },
        });
        const totalRevenue = revenueAgg._sum.totalPrice || 0;
        const merchantCount = await this.prisma.merchant.count({
            where: { status: 'ACTIVE' },
        });
        const totalTransactions = await this.prisma.order.count();
        const successTransactions = await this.prisma.order.count({
            where: { fulfillmentStatus: 'SUCCESS' },
        });
        let successRate = 0;
        if (totalTransactions > 0) {
            successRate = (successTransactions / totalTransactions) * 100;
        }
        const weeklyChart = [
            { day: 'Sen', value: Math.floor(Math.random() * 100) },
            { day: 'Sel', value: Math.floor(Math.random() * 100) },
            { day: 'Rab', value: Math.floor(Math.random() * 100) },
            { day: 'Kam', value: Math.floor(Math.random() * 100) },
            { day: 'Jum', value: Math.floor(Math.random() * 100) },
            { day: 'Sab', value: Math.floor(Math.random() * 100) },
            { day: 'Min', value: Math.floor(Math.random() * 100) },
        ];
        const recentTransactionsRaw = await this.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                orderNumber: true,
                productName: true,
                totalPrice: true,
                fulfillmentStatus: true,
            }
        });
        const recentTransactions = recentTransactionsRaw.map((trx) => ({
            id: trx.orderNumber,
            game: trx.productName,
            amount: trx.totalPrice.toString(),
            status: trx.fulfillmentStatus,
        }));
        return {
            stats: [
                {
                    label: 'Total Revenue',
                    value: `Rp ${(Number(totalRevenue) / 1000000).toFixed(1)}M`,
                    change: '+12.5%',
                    isUp: true,
                },
                {
                    label: 'Merchant Aktif',
                    value: merchantCount.toString(),
                    change: '+42',
                    isUp: true,
                },
                {
                    label: 'Total Transaksi',
                    value: totalTransactions.toString(),
                    change: '+1.2k',
                    isUp: true,
                },
                {
                    label: 'Success Rate',
                    value: `${successRate.toFixed(1)}%`,
                    change: '+0.5%',
                    isUp: true,
                },
            ],
            weeklyChart,
            recentTransactions,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map