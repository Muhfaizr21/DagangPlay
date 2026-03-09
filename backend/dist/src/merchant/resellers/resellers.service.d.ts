import { PrismaService } from '../../prisma.service';
import { UserStatus } from '@prisma/client';
export declare class ResellersService {
    private prisma;
    constructor(prisma: PrismaService);
    getResellers(merchantId: string, search?: string): Promise<{
        totalOrders: number;
        id: string;
        name: string;
        createdAt: Date;
        _count: {
            ordersAsCustomer: number;
        };
        email: string | null;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        balance: number;
    }[]>;
    updateStatus(merchantId: string, resellerId: string, status: UserStatus): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        username: string | null;
        referralCode: string;
        password: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        adminPermissions: import("@prisma/client/runtime/client").JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        merchantId: string | null;
        balance: number;
        bonusBalance: number;
        deletedAt: Date | null;
    }>;
    adjustBalance(merchantId: string, userId: string, resellerId: string, type: 'ADD' | 'SUBTRACT', amount: number, notes: string): Promise<any>;
    createReseller(merchantId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        username: string | null;
        referralCode: string;
        password: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        adminPermissions: import("@prisma/client/runtime/client").JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        merchantId: string | null;
        balance: number;
        bonusBalance: number;
        deletedAt: Date | null;
    }>;
}
