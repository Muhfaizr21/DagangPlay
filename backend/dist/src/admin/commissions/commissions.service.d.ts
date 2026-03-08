import { PrismaService } from '../../prisma.service';
export declare class CommissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getResellerLevels(): Promise<{
        id: string;
        name: import("@prisma/client").$Enums.ResellerLevelName;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        minTransaction: number;
        minRevenue: import("@prisma/client-runtime-utils").Decimal;
        commissionBonus: import("@prisma/client-runtime-utils").Decimal;
        badge: string | null;
        benefits: import("@prisma/client/runtime/client").JsonValue | null;
    }[]>;
    createResellerLevel(data: any): Promise<{
        id: string;
        name: import("@prisma/client").$Enums.ResellerLevelName;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        minTransaction: number;
        minRevenue: import("@prisma/client-runtime-utils").Decimal;
        commissionBonus: import("@prisma/client-runtime-utils").Decimal;
        badge: string | null;
        benefits: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getPendingCommissions(search?: string): Promise<({
        user: {
            id: string;
            email: string | null;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
        order: {
            id: string;
            orderNumber: string;
            productName: string;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        orderId: string;
        type: import("@prisma/client").$Enums.CommissionType;
        amount: import("@prisma/client-runtime-utils").Decimal;
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
        createdAt: Date;
        parentId: string;
        childId: string;
        level: number;
    })[]>;
}
