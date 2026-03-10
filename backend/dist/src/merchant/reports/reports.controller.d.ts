import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma.service';
export declare class ReportsController {
    private readonly reportsService;
    private prisma;
    constructor(reportsService: ReportsService, prisma: PrismaService);
    getSalesPerformance(req: any, query: any): Promise<{
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
    getProductPerformance(req: any): Promise<never[]>;
    getResellerPerformance(req: any): Promise<never[]>;
}
