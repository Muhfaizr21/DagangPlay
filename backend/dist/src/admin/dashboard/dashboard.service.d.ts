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
            totalEscrow: number;
            totalSaasRevenue: number;
        };
        merchants: {
            top: {
                id: string;
                name: string;
                orders: number;
            }[];
            expiring: {
                id: string;
                name: string;
                contactWhatsapp: string | null;
                planExpiredAt: Date | null;
            }[];
        };
        disputes: {
            pending: {
                id: string;
                createdAt: Date;
                user: {
                    name: string;
                };
                subject: string;
                priority: import("@prisma/client").$Enums.TicketPriority;
            }[];
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
