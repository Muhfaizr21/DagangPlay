import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSalesPerformance(merchantId: string, query: { range?: string }) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        let startDate: Date | undefined = new Date(today);

        let dataPoints = 7;
        let groupBy: 'day' | 'month' | 'year' = 'day';

        switch (query.range) {
            case '1m':
                startDate.setMonth(today.getMonth() - 1);
                dataPoints = 30;
                groupBy = 'day';
                break;
            case '1y':
                startDate.setFullYear(today.getFullYear() - 1);
                dataPoints = 12;
                groupBy = 'month';
                break;
            case 'all':
                startDate = undefined;
                dataPoints = 5; // Last 5 years
                groupBy = 'year';
                break;
            case '7d':
            default:
                startDate.setDate(today.getDate() - 6);
                dataPoints = 7;
                groupBy = 'day';
                break;
        }

        if (startDate) startDate.setHours(0, 0, 0, 0);

        const dateFilter = startDate ? { gte: startDate, lte: today } : undefined;

        const totalOrders = await this.prisma.order.count({ 
            where: { merchantId, ...(dateFilter && { createdAt: dateFilter }) } 
        });

        const successOrders = await this.prisma.order.count({ 
            where: { merchantId, fulfillmentStatus: 'SUCCESS', ...(dateFilter && { createdAt: dateFilter }) } 
        });

        const sumResult = await this.prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: { merchantId, fulfillmentStatus: 'SUCCESS', ...(dateFilter && { createdAt: dateFilter }) }
        });

        const recentOrders = await this.prisma.order.findMany({
            where: { merchantId, fulfillmentStatus: 'SUCCESS', ...(dateFilter && { createdAt: dateFilter }) },
            select: { totalPrice: true, createdAt: true }
        });

        const chartData: Array<{ date: string, revenue: number }> = [];

        for (let i = dataPoints - 1; i >= 0; i--) {
            const d = new Date();
            let dateLabel = '';
            
            if (groupBy === 'day') {
                d.setDate(d.getDate() - i);
                dateLabel = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
            } else if (groupBy === 'month') {
                d.setMonth(d.getMonth() - i);
                dateLabel = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            } else if (groupBy === 'year') {
                d.setFullYear(d.getFullYear() - i);
                dateLabel = d.toLocaleDateString('id-ID', { year: 'numeric' });
            }

            const dailyRevenue = recentOrders.reduce((sum, order) => {
                const orderDate = new Date(order.createdAt);
                if (groupBy === 'day' && orderDate.getDate() === d.getDate() && orderDate.getMonth() === d.getMonth()) {
                    return sum + Number(order.totalPrice || 0);
                } else if (groupBy === 'month' && orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear()) {
                    return sum + Number(order.totalPrice || 0);
                } else if (groupBy === 'year' && orderDate.getFullYear() === d.getFullYear()) {
                    return sum + Number(order.totalPrice || 0);
                }
                return sum;
            }, 0);

            chartData.push({ date: dateLabel, revenue: dailyRevenue });
        }

        return {
            summary: {
                totalOrders,
                successOrders,
                totalRevenue: sumResult._sum.totalPrice || 0,
            },
            chart: chartData
        };
    }

    async getProductPerformance(merchantId: string) {
        // To get product performance, we count orders grouped by productName or SKU
        // In a real app we'd group by product ID
        return [];
    }

    async getResellerPerformance(merchantId: string) {
        // Returns top resellers by transaction volume at this merchant
        return [];
    }
}
