import { PrismaService } from '../../prisma.service';
export declare class CommissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPendingCommissions(search?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        order: {
            id: string;
            orderNumber: string;
            productName: string;
            totalPrice: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.CommissionStatus;
        userId: string;
        orderId: string;
        type: string;
        amount: number;
        settledAt: Date | null;
    })[]>;
    settleCommission(id: string, operatorId: string): Promise<any>;
    settleBulkCommissions(operatorId: string): Promise<{
        message: string;
    }>;
    getDownlineTree(userId?: string): Promise<({
        parent: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        child: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        parentId: string;
        createdAt: Date;
        childId: string;
        level: number;
    })[]>;
}
