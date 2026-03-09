import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardData(req: any): Promise<{
        merchant: {
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
        transactionsToday: {
            success: number;
            failed: number;
            pending: number;
            total: number;
        };
        users: {
            registeredCustomers: number;
        };
        recentOrders: {
            id: any;
            amount: any;
            status: any;
            customerName: any;
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
        chartData: any[];
    }>;
}
