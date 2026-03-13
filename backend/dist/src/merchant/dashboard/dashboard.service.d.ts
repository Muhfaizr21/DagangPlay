import { PrismaService } from '../../prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardData(userId: string): Promise<{
        merchant: {
            id: string;
            name: string;
            domain: string | null;
            status: import("@prisma/client").$Enums.MerchantStatus;
            plan: import("@prisma/client").$Enums.MerchantPlan;
            balance: number;
        };
        revenue: {
            today: number;
            month: number;
            total: number;
            lastMonth: number;
            trendPercentage: number;
        };
        profit: {
            today: number;
            month: number;
            total: number;
            lastMonth: number;
            trendPercentage: number;
        };
        transactionsToday: {
            success: number;
            failed: number;
            pending: number;
            total: number;
        };
        users: {
            activeCustomers: number;
        };
        recentOrders: {
            id: any;
            amount: any;
            status: any;
            customerName: any;
            whatsapp: any;
            productName: any;
            createdAt: any;
        }[];
        topCustomers: {
            id: string;
            name: string;
            email: string;
            totalSpent: number;
            totalOrders: number;
        }[];
        alerts: string[];
        chartData: {
            date: string;
            revenue: number;
            profit: number;
        }[];
    }>;
}
