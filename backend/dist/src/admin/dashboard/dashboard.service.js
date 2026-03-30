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
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);
        const [supplierBalance, totalRevenueAgg, totalEscrowAgg, totalSaasRevenueAgg, merchantCount, totalTransactions, successTransactions, last24hTransactions, topMerchantsRaw, expiringMerchants, pendingDisputes, dailyOrders, recentTransactionsRaw] = await Promise.all([
            this.digiflazz.checkBalance().catch(() => 0),
            this.prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalPrice: true } }),
            this.prisma.merchant.aggregate({ _sum: { escrowBalance: true } }),
            this.prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
            this.prisma.merchant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { fulfillmentStatus: 'SUCCESS' } }),
            this.prisma.order.count({ where: { createdAt: { gte: last24h } } }),
            this.prisma.merchant.findMany({
                take: 5,
                select: { id: true, name: true, _count: { select: { orders: { where: { paymentStatus: 'PAID' } } } } },
                orderBy: { orders: { _count: 'desc' } }
            }),
            this.prisma.merchant.findMany({
                where: { status: 'ACTIVE', planExpiredAt: { gt: new Date(), lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
                select: { id: true, name: true, planExpiredAt: true, contactWhatsapp: true }
            }),
            this.prisma.supportTicket.findMany({
                where: {
                    status: 'OPEN',
                    OR: [
                        { priority: 'URGENT' },
                        { priority: 'HIGH' },
                        { subject: { contains: 'Sengketa', mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    subject: true,
                    priority: true,
                    createdAt: true,
                    user: { select: { name: true } }
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.order.findMany({
                where: { paymentStatus: 'PAID', createdAt: { gte: weekAgo } },
                select: { totalPrice: true, createdAt: true }
            }),
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, orderNumber: true, productName: true, totalPrice: true, fulfillmentStatus: true }
            })
        ]);
        const totalRevenue = Number(totalRevenueAgg._sum.totalPrice || 0);
        const totalEscrow = Number(totalEscrowAgg._sum.escrowBalance || 0);
        const totalSaasRevenue = Number(totalSaasRevenueAgg._sum.totalAmount || 0);
        const successRate = totalTransactions > 0 ? (successTransactions / totalTransactions) * 100 : 0;
        const trxTrend = last24hTransactions > 0 ? `+${last24hTransactions} harian` : '0 today';
        const topMerchants = topMerchantsRaw.map(m => ({
            id: m.id,
            name: m.name,
            orders: m._count.orders
        }));
        const weeklyChart = [...Array(7)].map((_, i) => {
            const date = new Date(weekAgo);
            date.setDate(date.getDate() + i);
            const dayKey = date.toDateString();
            const dayTotal = dailyOrders
                .filter(o => o.createdAt.toDateString() === dayKey)
                .reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
            return {
                day: dayNames[date.getDay()],
                value: Math.round(dayTotal / 1000)
            };
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
                    value: `Rp ${(totalRevenue / 1000000).toFixed(1)} JT`,
                    change: `Rp ${(totalRevenue % 1000000 / 1000).toFixed(0)}rb hari ini`,
                    isUp: true,
                },
                {
                    label: 'Merchant Aktif',
                    value: merchantCount.toString(),
                    change: expiringMerchants.length > 0 ? `${expiringMerchants.length} akan expire` : 'All health',
                    isUp: expiringMerchants.length === 0,
                },
                {
                    label: 'Total Transaksi',
                    value: totalTransactions.toLocaleString('id-ID'),
                    change: trxTrend,
                    isUp: true,
                },
                {
                    label: 'Success Rate',
                    value: `${successRate.toFixed(1)}%`,
                    change: successRate > 95 ? 'Excellent' : 'Check Suppliers',
                    isUp: successRate > 90,
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