import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DigiflazzService } from '../digiflazz/digiflazz.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService, private digiflazz: DigiflazzService) { }

    async getDashboardSummary() {
        // Get Supplier Balance
        let supplierBalance = 0;
        try {
            supplierBalance = await this.digiflazz.checkBalance();
        } catch (e) {
            console.error('Failed to fetch supplier balance for dashboard');
        }

        // --- 1. FINANCIAL COMMAND CENTER ---
        // 1.1 Platform Revenue
        const revenueAgg = await this.prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalPrice: true },
        });
        const totalRevenue = revenueAgg._sum.totalPrice || 0;

        // 1.2 Total Escrow (Merchant Profit Pending)
        const escrowAgg = await this.prisma.merchant.aggregate({
            _sum: { escrowBalance: true }
        });
        const totalEscrow = escrowAgg._sum.escrowBalance || 0;

        // 1.3 SaaS Revenue (Subscription Invoices)
        const saasAgg = await this.prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { totalAmount: true }
        });
        const totalSaasRevenue = saasAgg._sum.totalAmount || 0;

        // --- 2. MERCHANT HEALTH MONITOR ---
        const merchantCount = await this.prisma.merchant.count({
            where: { status: 'ACTIVE' },
        });

        // 2.1 Top 5 Merchants by Volume
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

        // 2.2 Expiring in 7 Days
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

        // --- 3. UNIFIED DISPUTE CENTER ---
        const pendingDisputes = await this.prisma.disputeCase.findMany({
            where: { status: 'OPEN' },
            include: { order: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        // --- GENERAL STATS ---
        const totalTransactions = await this.prisma.order.count();
        const successTransactions = await this.prisma.order.count({
            where: { fulfillmentStatus: 'SUCCESS' },
        });

        let successRate = 0;
        if (totalTransactions > 0) {
            successRate = (successTransactions / totalTransactions) * 100;
        }

        // --- 4. OPTIMIZED REVENUE CHART (Single Query) ---
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);

        // Fetch counts for the last 7 days using raw or complex aggregate if strictly needed, 
        // but for now let's use a more efficient approach with native prisma or a single findMany
        const dailyOrders = await this.prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: { gte: weekAgo }
            },
            select: {
                totalPrice: true,
                createdAt: true
            }
        });

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
}
