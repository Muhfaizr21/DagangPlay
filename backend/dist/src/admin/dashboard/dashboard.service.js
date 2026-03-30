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
const digiflazz_service_1 = require("../digiflazz/digiflazz.service");
let DashboardService = class DashboardService {
    prisma;
    digiflazz;
    constructor(prisma, digiflazz) {
        this.prisma = prisma;
        this.digiflazz = digiflazz;
    }
    async getDashboardSummary() {
        let supplierBalance = 0;
        try {
            supplierBalance = await this.digiflazz.checkBalance();
        }
        catch (e) {
            console.error('Failed to fetch supplier balance for dashboard');
        }
        const revenueAgg = await this.prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalPrice: true },
        });
        const totalRevenue = revenueAgg._sum.totalPrice || 0;
        const escrowAgg = await this.prisma.merchant.aggregate({
            _sum: { escrowBalance: true }
        });
        const totalEscrow = escrowAgg._sum.escrowBalance || 0;
        const saasAgg = await this.prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { totalAmount: true }
        });
        const totalSaasRevenue = saasAgg._sum.totalAmount || 0;
        const merchantCount = await this.prisma.merchant.count({
            where: { status: 'ACTIVE' },
        });
        const topMerchantsRaw = await this.prisma.merchant.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                _count: {
                    select: { orders: { where: { paymentStatus: 'PAID' } } }
                }
            },
            orderBy: { orders: { _count: 'desc' } }
        });
        const topMerchants = topMerchantsRaw.map(m => ({
            id: m.id,
            name: m.name,
            orders: m._count.orders
        }));
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringMerchants = await this.prisma.merchant.findMany({
            where: {
                status: 'ACTIVE',
                planExpiredAt: {
                    gt: new Date(),
                    lt: sevenDaysFromNow
                }
            },
            select: { id: true, name: true, planExpiredAt: true, contactWhatsapp: true }
        });
        const pendingDisputes = await this.prisma.disputeCase.findMany({
            where: { status: 'OPEN' },
            include: { order: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        const totalTransactions = await this.prisma.order.count();
        const successTransactions = await this.prisma.order.count({
            where: { fulfillmentStatus: 'SUCCESS' },
        });
        let successRate = 0;
        if (totalTransactions > 0) {
            successRate = (successTransactions / totalTransactions) * 100;
        }
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const weeklyChart = await Promise.all([...Array(7)].map(async (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            date.setHours(0, 0, 0, 0);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            const dayAgg = await this.prisma.order.aggregate({
                where: {
                    paymentStatus: 'PAID',
                    createdAt: { gte: date, lt: nextDay }
                },
                _sum: { totalPrice: true }
            });
            return {
                day: dayNames[date.getDay()],
                value: Math.round(Number(dayAgg._sum.totalPrice || 0) / 1000)
            };
        }));
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
                    label: 'Total Platform Revenue',
                    value: `Rp ${(Number(totalRevenue) / 1000000).toFixed(1)} JT`,
                    change: '+12.5%',
                    isUp: true,
                },
                {
                    label: 'Merchant Aktif',
                    value: merchantCount.toString(),
                    change: `+${expiringMerchants.length} expiring`,
                    isUp: false,
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
            systemHealth: {
                supplierBalance: supplierBalance,
                isLow: supplierBalance < 500000,
                totalEscrow,
                totalSaasRevenue
            },
            merchants: {
                top: topMerchants,
                expiring: expiringMerchants
            },
            disputes: {
                pending: pendingDisputes
            },
            weeklyChart,
            recentTransactions,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, digiflazz_service_1.DigiflazzService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map