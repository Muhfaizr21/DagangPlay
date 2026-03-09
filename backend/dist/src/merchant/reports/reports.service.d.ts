import { PrismaService } from '../../prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSalesPerformance(merchantId: string, query: {
        range?: string;
    }): Promise<{
        summary: {
            totalOrders: number;
            successOrders: number;
            totalRevenue: number;
        };
        chart: {
            date: string;
            revenue: number;
        }[];
    }>;
    getProductPerformance(merchantId: string): Promise<never[]>;
    getResellerPerformance(merchantId: string): Promise<never[]>;
}
