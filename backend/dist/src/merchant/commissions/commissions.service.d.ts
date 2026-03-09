import { PrismaService } from '../../prisma.service';
export declare class CommissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCommissions(merchantId: string): Promise<{
        totalPending: number;
        resellerCommissions: {
            userId: string;
            name: string | undefined;
            email: string | null | undefined;
            totalPendingAmount: number;
            totalOrders: any;
        }[];
    }>;
    settleCommissions(merchantId: string, resellerId?: string): Promise<{
        success: boolean;
        message: string;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        message: string;
    }>;
}
