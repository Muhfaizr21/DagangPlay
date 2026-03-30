import { PrismaService } from '../../prisma.service';
import { Role, Prisma } from '@prisma/client';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
export declare class MembersService {
    private prisma;
    private subscriptionsService;
    constructor(prisma: PrismaService, subscriptionsService: SubscriptionsService);
    getAllUsers(merchantId: string, search?: string, roleFilter?: Role): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        _count: {
            ordersAsCustomer: number;
        };
        email: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        balance: number;
    }[]>;
    createManualUser(merchantId: string, data: {
        name: string;
        phone: string;
        balance?: number;
    }): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        merchantId: string | null;
        email: string | null;
        phone: string | null;
        username: string | null;
        referralCode: string;
        password: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        adminPermissions: Prisma.JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        balance: number;
        bonusBalance: number;
        isGuest: boolean;
    }>;
    updateUser(merchantId: string, userId: string, data: {
        name: string;
        phone: string;
    }): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        merchantId: string | null;
        email: string | null;
        phone: string | null;
        username: string | null;
        referralCode: string;
        password: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        adminPermissions: Prisma.JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        balance: number;
        bonusBalance: number;
        isGuest: boolean;
    }>;
    toggleResellerStatus(merchantId: string, userId: string, targetRole: Role): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        merchantId: string | null;
        email: string | null;
        phone: string | null;
        username: string | null;
        referralCode: string;
        password: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        adminPermissions: Prisma.JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        balance: number;
        bonusBalance: number;
        isGuest: boolean;
    }>;
    getTopResellers(merchantId: string): Promise<{
        id: string;
        name: string;
        totalTrx: number;
        totalOmset: number;
    }[]>;
    getBalanceHistory(merchantId: string, resellerId: string): Promise<never[]>;
    adjustBalance(merchantId: string, merchantUserId: string, resellerId: string, type: 'ADD' | 'SUBTRACT', amount: number, notes: string): Promise<{
        success: boolean;
    }>;
}
