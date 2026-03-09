import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSalesPerformance(merchantId: string, query: { range?: string }) {
        // Mock data logic for sales performance since we need complex aggregations.
        // In real app, we group by date or use DailySalesSnapshot table.
        // For now, let's just count total orders and revenue for the merchant

        const totalOrders = await this.prisma.order.count({ where: { merchantId } });
        const successOrders = await this.prisma.order.count({ where: { merchantId, fulfillmentStatus: 'SUCCESS' } });

        // Sum total amount of successful orders
        const sumResult = await this.prisma.order.aggregate({
            _sum: {
                totalPrice: true
            },
            where: {
                merchantId,
                fulfillmentStatus: 'SUCCESS'
            }
        });

        // Generate some dummy chart data for the last 7 days
        const chartData: Array<{ date: string, revenue: number }> = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            chartData.push({
                date: d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                revenue: Math.floor(Math.random() * 5000000) + 1000000
            });
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
