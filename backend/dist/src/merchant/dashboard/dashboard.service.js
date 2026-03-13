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
    async getDashboardData(userId) {
        const merchant = await this.prisma.merchant.findFirst({
            where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
            include: { owner: true }
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Merchant tidak ditemukan untuk user ini');
        }
        const merchantId = merchant.id;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const [revenueTodayAgg, revenueMonthAgg, revenueTotalAgg, revenueLastMonthAgg, profitTodayAgg, profitMonthAgg, profitTotalAgg, profitLastMonthAgg, trxSuccess, trxFailed, trxPending] = await Promise.all([
            this.prisma.order.aggregate({
                where: { merchantId, paymentStatus: 'PAID', createdAt: { gte: startOfToday } },
                _sum: { totalPrice: true }
            }),
            this.prisma.order.aggregate({
                where: { merchantId, paymentStatus: 'PAID', createdAt: { gte: startOfMonth } },
                _sum: { totalPrice: true }
            }),
            this.prisma.order.aggregate({
                where: { merchantId, paymentStatus: 'PAID' },
                _sum: { totalPrice: true }
            }),
            this.prisma.order.aggregate({
                where: { merchantId, paymentStatus: 'PAID', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
                _sum: { totalPrice: true }
            }),
            this.prisma.commission.aggregate({
                where: { userId: merchant.ownerId, status: 'SETTLED', createdAt: { gte: startOfToday } },
                _sum: { amount: true }
            }),
            this.prisma.commission.aggregate({
                where: { userId: merchant.ownerId, status: 'SETTLED', createdAt: { gte: startOfMonth } },
                _sum: { amount: true }
            }),
            this.prisma.commission.aggregate({
                where: { userId: merchant.ownerId, status: 'SETTLED' },
                _sum: { amount: true }
            }),
            this.prisma.commission.aggregate({
                where: { userId: merchant.ownerId, status: 'SETTLED', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
                _sum: { amount: true }
            }),
            this.prisma.order.count({ where: { merchantId, paymentStatus: 'PAID', createdAt: { gte: startOfToday } } }),
            this.prisma.order.count({ where: { merchantId, paymentStatus: 'EXPIRED', createdAt: { gte: startOfToday } } }),
            this.prisma.order.count({ where: { merchantId, paymentStatus: 'PENDING', createdAt: { gte: startOfToday } } })
        ]);
        const revenueToday = Number(revenueTodayAgg._sum.totalPrice || 0);
        const revenueMonth = Number(revenueMonthAgg._sum.totalPrice || 0);
        const revenueTotal = Number(revenueTotalAgg._sum.totalPrice || 0);
        const revenueLastMonth = Number(revenueLastMonthAgg._sum.totalPrice || 0);
        const profitToday = Number(profitTodayAgg._sum.amount || 0);
        const profitMonth = Number(profitMonthAgg._sum.amount || 0);
        const profitTotal = Number(profitTotalAgg._sum.amount || 0);
        const profitLastMonth = Number(profitLastMonthAgg._sum.amount || 0);
        let revenueTrend = 0;
        if (revenueLastMonth > 0) {
            revenueTrend = ((revenueMonth - revenueLastMonth) / revenueLastMonth) * 100;
        }
        let profitTrend = 0;
        if (profitLastMonth > 0) {
            profitTrend = ((profitMonth - profitLastMonth) / profitLastMonth) * 100;
        }
        const recentOrders = await this.prisma.order.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { name: true, phone: true } }, productSku: { select: { product: { select: { name: true } } } } }
        });
        const alerts = [];
        if (trxFailed > 10)
            alerts.push("Tingkat transaksi gagal hari ini cukup tinggi.");
        if (merchant.plan === 'FREE' && revenueMonth > 5000000)
            alerts.push("Omset Anda sudah mencapai limit Paket FREE. Silakan upgrade!");
        if (merchant.status === 'PENDING_REVIEW')
            alerts.push("Domain/Toko Anda sedang dalam peninjauan.");
        const [registeredCustomers, topCustomersAgg] = await Promise.all([
            this.prisma.user.count({ where: { merchantId, role: 'CUSTOMER' } }),
            this.prisma.order.groupBy({
                by: ['userId'],
                where: { merchantId, paymentStatus: 'PAID' },
                _sum: { totalPrice: true },
                _count: { id: true },
                orderBy: { _sum: { totalPrice: 'desc' } },
                take: 5
            })
        ]);
        const topCustomers = await Promise.all(topCustomersAgg.map(async (ag) => {
            const ruser = await this.prisma.user.findUnique({ where: { id: ag.userId }, select: { name: true, email: true, phone: true } });
            return {
                id: ag.userId,
                name: ruser?.name || 'Guest User',
                email: ruser?.email || ruser?.phone || 'No Email',
                totalSpent: ag._sum.totalPrice || 0,
                totalOrders: ag._count.id
            };
        }));
        const chartStartDate = new Date(now);
        chartStartDate.setDate(chartStartDate.getDate() - 30);
        const ordersByDay = await this.prisma.order.groupBy({
            by: ['createdAt'],
            where: { merchantId, paymentStatus: 'PAID', createdAt: { gte: chartStartDate } },
            _sum: { totalPrice: true }
        });
        const commissionsByDay = await this.prisma.commission.groupBy({
            by: ['createdAt'],
            where: { userId: merchant.ownerId, status: 'SETTLED', createdAt: { gte: chartStartDate } },
            _sum: { amount: true }
        });
        const chartDataMap = {};
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            chartDataMap[dateStr] = { revenue: 0, profit: 0 };
        }
        ordersByDay.forEach(item => {
            const d = item.createdAt.toISOString().split('T')[0];
            if (chartDataMap[d])
                chartDataMap[d].revenue += Number(item._sum.totalPrice || 0);
        });
        commissionsByDay.forEach(item => {
            const d = item.createdAt.toISOString().split('T')[0];
            if (chartDataMap[d])
                chartDataMap[d].profit += Number(item._sum.amount || 0);
        });
        const chartData = Object.entries(chartDataMap).map(([date, vals]) => ({
            date,
            revenue: vals.revenue,
            profit: vals.profit
        }));
        return {
            merchant: {
                id: merchant.id,
                name: merchant.name,
                domain: merchant.domain,
                status: merchant.status,
                plan: merchant.plan,
                balance: Number(merchant.owner?.balance || 0)
            },
            revenue: {
                today: revenueToday,
                month: revenueMonth,
                total: revenueTotal,
                lastMonth: revenueLastMonth,
                trendPercentage: revenueTrend,
            },
            profit: {
                today: profitToday,
                month: profitMonth,
                total: profitTotal,
                lastMonth: profitLastMonth,
                trendPercentage: profitTrend
            },
            transactionsToday: {
                success: trxSuccess,
                failed: trxFailed,
                pending: trxPending,
                total: trxSuccess + trxFailed + trxPending
            },
            users: {
                activeCustomers: registeredCustomers
            },
            recentOrders: recentOrders.map((o) => ({
                id: o.orderNumber || o.id,
                amount: o.totalPrice,
                status: o.paymentStatus,
                customerName: o.user?.name || 'Unknown',
                whatsapp: o.user?.phone,
                productName: o.productSku?.product?.name || 'Voucher',
                createdAt: o.createdAt
            })),
            topCustomers,
            alerts,
            chartData
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map