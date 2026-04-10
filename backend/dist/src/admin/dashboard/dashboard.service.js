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
    async getDashboardSummary(range = 'WEEK') {
        const now = new Date();
        let startDate = new Date();
        let intervals = 7;
        let isMonthly = false;
        if (range === 'MONTH') {
            startDate.setDate(now.getDate() - 29);
            intervals = 30;
        }
        else if (range === 'YEAR') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            intervals = 12;
            isMonthly = true;
        }
        else {
            startDate.setDate(now.getDate() - 6);
            intervals = 7;
        }
        startDate.setHours(0, 0, 0, 0);
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [supplierBalance, totalRevenueAgg, totalCostAgg, totalEscrowAgg, totalSaasRevenueAgg, merchantCount, totalTransactions, successTransactions, last24hTransactions, last24hRevenueAgg, topMerchantsRaw, expiringMerchants, pendingDisputes, chartDataRaw, recentTransactionsRaw] = await Promise.all([
            this.digiflazz.checkBalance().catch(() => 0),
            this.prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalPrice: true } }),
            this.prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { basePrice: true } }),
            this.prisma.merchant.aggregate({ _sum: { escrowBalance: true } }),
            this.prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
            this.prisma.merchant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { fulfillmentStatus: 'SUCCESS' } }),
            this.prisma.order.count({ where: { createdAt: { gte: last24h } } }),
            this.prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: last24h } }, _sum: { totalPrice: true } }),
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
                select: { id: true, subject: true, priority: true, createdAt: true, user: { select: { name: true } } },
                take: 5,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.order.findMany({
                where: { paymentStatus: 'PAID', createdAt: { gte: startDate } },
                select: { totalPrice: true, basePrice: true, createdAt: true }
            }),
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, orderNumber: true, productName: true, totalPrice: true, fulfillmentStatus: true }
            })
        ]);
        const totalRevenue = Number(totalRevenueAgg._sum.totalPrice || 0);
        const totalCost = Number(totalCostAgg._sum.basePrice || 0);
        const totalProfit = totalRevenue - totalCost;
        const last24hRevenue = Number(last24hRevenueAgg._sum.totalPrice || 0);
        const totalEscrow = Number(totalEscrowAgg._sum.escrowBalance || 0);
        const totalSaasRevenue = Number(totalSaasRevenueAgg._sum.totalAmount || 0);
        const successRate = totalTransactions > 0 ? (successTransactions / totalTransactions) * 100 : 0;
        const trxTrend = last24hTransactions > 0 ? `+${last24hTransactions} harian` : '0 today';
        const topMerchants = topMerchantsRaw.map(m => ({ id: m.id, name: m.name, orders: m._count.orders }));
        const chartData = [...Array(intervals)].map((_, i) => {
            const d = new Date(startDate);
            if (isMonthly) {
                d.setMonth(d.getMonth() + i);
                const label = monthNames[d.getMonth()];
                const filtered = chartDataRaw.filter(o => o.createdAt.getMonth() === d.getMonth() && o.createdAt.getFullYear() === d.getFullYear());
                const revenue = filtered.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
                const cost = filtered.reduce((acc, curr) => acc + Number(curr.basePrice || 0), 0);
                const profit = revenue - cost;
                return { label, value: Math.round(revenue / 1000000), profit: Math.round(profit / 1000000) };
            }
            else {
                d.setDate(d.getDate() + i);
                const label = range === 'MONTH' ? d.getDate().toString() : dayNames[d.getDay()];
                const dateStr = d.toDateString();
                const filtered = chartDataRaw.filter(o => o.createdAt.toDateString() === dateStr);
                const revenue = filtered.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
                const cost = filtered.reduce((acc, curr) => acc + Number(curr.basePrice || 0), 0);
                const profit = revenue - cost;
                return { label, value: Math.round(revenue / 1000), profit: Math.round(profit / 1000) };
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
                    label: 'Platform Net Profit',
                    value: `Rp ${(totalProfit / 1000000).toFixed(1)} JT`,
                    change: `Revenue: Rp ${(totalRevenue / 1000000).toFixed(1)} JT`,
                    isUp: totalProfit > 0,
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
            recentTransactions,
            chartData,
        };
    }
    async getDashboardReport() {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const orders = await this.prisma.order.findMany({
            where: { createdAt: { gte: last30Days } },
            include: { merchant: true, user: true },
            orderBy: { createdAt: 'desc' }
        });
        const stats = await this.getDashboardSummary();
        let csv = '--- DAGANGPLAY PLATFORM SUMMARY REPORT ---\n';
        csv += `Generated At,${new Date().toISOString()}\n`;
        csv += `Total Revenue,${stats.stats[0]?.value || 0}\n`;
        csv += `Merchant Aktif,${stats.stats[1]?.value || 0}\n`;
        csv += `Total Transaksi,${stats.stats[2]?.value || 0}\n\n`;
        csv += '--- DETIL TRANSAKSI (30 HARI TERAKHIR) ---\n';
        csv += 'ID Order,Merchant,Produk,SKU,Customer,Total,Status Pembayaran,Status Fulfillment,Waktu\n';
        for (const o of orders) {
            csv += `${o.orderNumber},${o.merchant?.name || '-'},${o.productName},${o.productSkuName},${o.user?.name || '-'},${o.totalPrice},${o.paymentStatus},${o.fulfillmentStatus},${o.createdAt.toISOString()}\n`;
        }
        return csv;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, digiflazz_service_1.DigiflazzService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map