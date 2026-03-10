import { CommissionsService } from './commissions.service';
import { PrismaService } from '../../prisma.service';
export declare class CommissionsController {
    private readonly commissionsService;
    private prisma;
    constructor(commissionsService: CommissionsService, prisma: PrismaService);
    getCommissions(req: any): Promise<{
        totalPending: number;
        resellerCommissions: {
            userId: string;
            name: string | undefined;
            email: string | null | undefined;
            totalPendingAmount: number;
            totalOrders: any;
        }[];
    }>;
    settleAllCommissions(req: any): Promise<{
        success: boolean;
        message: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        message: string;
    }>;
    settleResellerCommissions(req: any, resellerId: string): Promise<{
        success: boolean;
        message: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        message: string;
    }>;
}
