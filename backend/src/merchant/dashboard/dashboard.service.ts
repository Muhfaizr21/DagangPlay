import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MerchantStatus, OrderPaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardData(userId: string) {
        // Step 1: Find merchant associated with this user
        const merchant = await this.prisma.merchant.findUnique({
            where: { ownerId: userId }
        });

        if (!merchant) {
            throw new NotFoundException('Merchant tidak ditemukan untuk user ini');
        }

        const merchantId = merchant.id;

        // Date utilities
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Revenue calculations
        const [revenueTodayAgg, revenueMonthAgg, revenueTotalAgg, revenueLastMonthAgg] = await Promise.all([
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
            })
        ]);

        const revenueToday = revenueTodayAgg._sum.totalPrice || 0;
        const revenueMonth = revenueMonthAgg._sum.totalPrice || 0;
        const revenueTotal = revenueTotalAgg._sum.totalPrice || 0;
        const revenueLastMonth = revenueLastMonthAgg._sum.totalPrice || 0;

        let revenueTrend = 0;
        if (Number(revenueLastMonth) > 0) {
            revenueTrend = ((Number(revenueMonth) - Number(revenueLastMonth)) / Number(revenueLastMonth)) * 100;
        }

        // Transactions today
        const [trxSuccess, trxFailed, trxPending] = await Promise.all([
            this.prisma.order.count({ where: { merchantId, paymentStatus: 'PAID', createdAt: { gte: startOfToday } } }),
            this.prisma.order.count({ where: { merchantId, paymentStatus: 'EXPIRED', createdAt: { gte: startOfToday } } }),
            this.prisma.order.count({ where: { merchantId, paymentStatus: 'PENDING', createdAt: { gte: startOfToday } } })
        ]);

        // Users
        const [registeredCustomers] = await Promise.all([
            this.prisma.user.count({ where: { merchantId, role: 'CUSTOMER' } })
        ]);

        // Recent Transactions (Limit 10)
        const recentOrders = await this.prisma.order.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { name: true } }, productSku: { select: { product: { select: { name: true } } } } }
        });

        // Top Customers (Limit 10)
        const topCustomersAgg = await this.prisma.order.groupBy({
            by: ['userId'],
            where: { merchantId, paymentStatus: 'PAID' },
            _sum: { totalPrice: true },
            _count: { id: true },
            orderBy: { _sum: { totalPrice: 'desc' } },
            take: 10
        });

        // get names for top customers
        const topCustomers = await Promise.all(topCustomersAgg.map(async (ag) => {
            const ruser = await this.prisma.user.findUnique({ where: { id: ag.userId }, select: { name: true, email: true } });
            return {
                id: ag.userId,
                name: ruser?.name || 'Unknown',
                email: ruser?.email || '',
                totalSpent: ag._sum.totalPrice || 0,
                totalOrders: ag._count.id
            };
        }));

        // Notifications/Alerts
        const alerts: string[] = [];
        if (trxFailed > 10) alerts.push("Tingkat transaksi gagal hari ini cukup tinggi.");
        if (Number(revenueTotal) < 50000) alerts.push("Saldo omset / total penjualan Anda rendah.");
        if (merchant.plan === 'FREE' || merchant.status === 'PENDING_REVIEW') alerts.push("Status Merchant Anda perlu segera di-upgrade.");

        // Chart Data (Last 30 days) - Basic mock representation
        const chartData: any[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            // Note: In production we'd use raw SQL for group by day, but doing iterative query for 30 here.
            const dayAgg = await this.prisma.order.aggregate({
                where: { merchantId, paymentStatus: 'PAID', createdAt: { gte: date, lt: nextDate } },
                _sum: { totalPrice: true }
            });
            chartData.push({
                date: date.toISOString().split('T')[0],
                value: Number(dayAgg._sum.totalPrice || 0)
            });
        }

        return {
            merchant: {
                name: merchant.name,
                domain: merchant.domain,
                status: merchant.status,
                plan: merchant.plan,
                balance: Number(revenueTotal) // using revenueTotal as merchant balance representation
            },
            revenue: {
                today: Number(revenueToday),
                month: Number(revenueMonth),
                total: Number(revenueTotal),
                lastMonth: Number(revenueLastMonth),
                trendPercentage: revenueTrend
            },
            transactionsToday: {
                success: trxSuccess,
                failed: trxFailed,
                pending: trxPending,
                total: trxSuccess + trxFailed + trxPending
            },
            users: {
                registeredCustomers
            },
            recentOrders: recentOrders.map((o: any) => ({
                id: o.orderNumber || o.id,
                amount: o.totalPrice,
                status: o.paymentStatus,
                customerName: o.user?.name || 'Unknown',
                productName: o.productSku?.product?.name || 'Voucher',
                createdAt: o.createdAt
            })),
            topCustomers: topCustomers,
            alerts,
            chartData
        };
    }
}
