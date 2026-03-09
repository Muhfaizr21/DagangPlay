import { UsersService } from './users.service';
import { UserStatus } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(search?: string, role?: string, status?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            email: string | null;
            phone: string | null;
            username: string | null;
            referralCode: string;
            password: string;
            name: string;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
        meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    getUserDetail(id: string): Promise<{
        id: string;
        email: string | null;
        phone: string | null;
        username: string | null;
        referralCode: string;
        password: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    updateUserStatus(id: string, body: {
        status: UserStatus;
        reason?: string;
    }): Promise<{
        id: string;
        email: string | null;
        phone: string | null;
        username: string | null;
        referralCode: string;
        password: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    adjustBalance(id: string, body: {
        type: 'ADD' | 'DEDUCT';
        amount: number;
        note: string;
    }): Promise<any>;
    getBalanceHistories(id: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        note: string | null;
        userId: string;
        orderId: string | null;
        type: import("@prisma/client").$Enums.BalanceTrxType;
        amount: number;
        balanceBefore: number;
        balanceAfter: number;
        depositId: string | null;
        withdrawalId: string | null;
    }[]>;
    getSessions(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        ipAddress: string | null;
        userAgent: string | null;
        token: string;
        refreshToken: string;
        device: string | null;
        expiresAt: Date;
        lastActiveAt: Date;
    }[]>;
    forceLogoutAll(id: string): Promise<{
        success: boolean;
        revoked: number;
    }>;
}
