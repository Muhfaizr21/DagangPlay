import { UsersService } from './users.service';
import { UserStatus } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(search?: string, role?: string, status?: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        isVerified: boolean;
        balance: import("@prisma/client-runtime-utils").Decimal;
        bonusBalance: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        _count: {
            ordersAsCustomer: number;
            ordersAsReseller: number;
        };
    }[]>;
    getUserDetail(id: string): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            city: string | null;
            province: string | null;
            userId: string;
            fullName: string | null;
            birthDate: Date | null;
            gender: import("@prisma/client").$Enums.Gender | null;
            postalCode: string | null;
            idCardNumber: string | null;
            bankName: string | null;
            bankAccountNumber: string | null;
            bankAccountName: string | null;
        } | null;
        merchantMembers: ({
            merchant: {
                id: string;
                name: string;
                status: import("@prisma/client").$Enums.MerchantStatus;
                isOfficial: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                domain: string | null;
                ownerId: string;
                logo: string | null;
                favicon: string | null;
                bannerImage: string | null;
                description: string | null;
                tagline: string | null;
                contactEmail: string | null;
                contactPhone: string | null;
                contactWhatsapp: string | null;
                address: string | null;
                city: string | null;
                province: string | null;
                plan: import("@prisma/client").$Enums.MerchantPlan;
                planExpiredAt: Date | null;
                settings: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            merchantId: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        })[];
    } & {
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
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        merchantId: string | null;
        balance: import("@prisma/client-runtime-utils").Decimal;
        bonusBalance: import("@prisma/client-runtime-utils").Decimal;
        resellerLevelId: string | null;
        isOfficial: boolean;
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
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        merchantId: string | null;
        balance: import("@prisma/client-runtime-utils").Decimal;
        bonusBalance: import("@prisma/client-runtime-utils").Decimal;
        resellerLevelId: string | null;
        isOfficial: boolean;
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
        amount: import("@prisma/client-runtime-utils").Decimal;
        balanceBefore: import("@prisma/client-runtime-utils").Decimal;
        balanceAfter: import("@prisma/client-runtime-utils").Decimal;
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
