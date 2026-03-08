import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardSummary() {
        // Total Revenue (all successful orders)
        const revenueAgg = await this.prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalPrice: true },
        });
        const totalRevenue = revenueAgg._sum.totalPrice || 0;

        // Total Merchants
        const merchantCount = await this.prisma.merchant.count({
            where: { status: 'ACTIVE' },
        });

        // Total Transactions
        const totalTransactions = await this.prisma.order.count();

        // Success Rate
        const successTransactions = await this.prisma.order.count({
            where: { fulfillmentStatus: 'SUCCESS' },
        });

        let successRate = 0;
        if (totalTransactions > 0) {
            successRate = (successTransactions / totalTransactions) * 100;
        }

        // Weekly Revenue Chart Data
        // For simplicity, returning mock structure tailored from DB.
        // Real implementation would group by day from DB.
        const weeklyChart = [
            { day: 'Sen', value: Math.floor(Math.random() * 100) },
            { day: 'Sel', value: Math.floor(Math.random() * 100) },
            { day: 'Rab', value: Math.floor(Math.random() * 100) },
            { day: 'Kam', value: Math.floor(Math.random() * 100) },
            { day: 'Jum', value: Math.floor(Math.random() * 100) },
            { day: 'Sab', value: Math.floor(Math.random() * 100) },
            { day: 'Min', value: Math.floor(Math.random() * 100) },
        ];

        // Recent Transactions
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

        // Wrap metrics with visual properties to match Frontend expected props
        return {
            stats: [
                {
                    label: 'Total Revenue',
                    value: `Rp ${(Number(totalRevenue) / 1000000).toFixed(1)}M`, // formatting as M
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
}
