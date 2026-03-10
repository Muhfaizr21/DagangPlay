import { PrismaService } from '../../prisma.service';
import { DigiflazzService } from '../digiflazz/digiflazz.service';
export declare class DashboardService {
    private prisma;
    private digiflazz;
    constructor(prisma: PrismaService, digiflazz: DigiflazzService);
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
