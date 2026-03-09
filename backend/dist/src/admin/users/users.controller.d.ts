import { UsersService } from './users.service';
import { UserStatus } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(search?: string, role?: string, status?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            _count: {
                ordersAsCustomer: number;
            };
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
            status: import("@prisma/client").$Enums.UserStatus;
            isVerified: boolean;
            balance: number;
            bonusBalance: number;
        }[];
        meta: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
        };
    }>;
    getUserDetail(id: string): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            city: string | null;
            province: string | null;
            userId: string;
            bankName: string | null;
            bankAccountNumber: string | null;
            bankAccountName: string | null;
            fullName: string | null;
            birthDate: Date | null;
            gender: import("@prisma/client").$Enums.Gender | null;
            postalCode: string | null;
            idCardNumber: string | null;
        } | null;
        merchantMemberships: ({
            merchant: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.MerchantStatus;
                deletedAt: Date | null;
                domain: string | null;
                ownerId: string;
                logo: string | null;
                favicon: string | null;
                bannerImage: string | null;
                tagline: string | null;
                contactEmail: string | null;
                contactPhone: string | null;
                contactWhatsapp: string | null;
                address: string | null;
                city: string | null;
                province: string | null;
                plan: import("@prisma/client").$Enums.MerchantPlan;
                planExpiredAt: Date | null;
                isOfficial: boolean;
                settings: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            merchantId: string;
            userId: string;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
    } & {
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
    updateUserStatus(id: string, body: {
        status: UserStatus;
        reason?: string;
    }): Promise<{
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
    adjustBalance(id: string, body: {
        type: 'ADD' | 'DEDUCT';
        amount: number;
        note: string;
    }): Promise<any>;
    getBalanceHistories(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        note: string | null;
        userId: string;
        amount: number;
        orderId: string | null;
        type: import("@prisma/client").$Enums.BalanceTrxType;
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
