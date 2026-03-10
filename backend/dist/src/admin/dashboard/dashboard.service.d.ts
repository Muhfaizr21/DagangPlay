import { PrismaService } from '../../prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardSummary(): Promise<{
        stats: {
            label: string;
            value: string;
            change: string;
            isUp: boolean;
        }[];
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
