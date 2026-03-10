import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardSummary(): Promise<{
        stats: {
            label: string;
            value: string;
            change: string;
            isUp: boolean;
        }[];
        systemHealth: {
            supplierBalance: number;
            isLow: boolean;
        };
        weeklyChart: {
            day: string;
            value: number;
        }[];
        recentTransactions: {
            id: string;
            game: string;
            amount: string;
            status: import("@prisma/client").$Enums.OrderFulfillmentStatus;
        }[];
    }>;
}
