import { PrismaService } from '../../prisma.service';
import { UserStatus } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(search?: string, role?: string, status?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
            _count: {
                ordersAsCustomer: number;
            };
            balance: number;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
            isVerified: boolean;
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
        merchantMemberships: ({
            merchant: {
                id: string;
                name: string;
                status: import("@prisma/client").$Enums.MerchantStatus;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                description: string | null;
                logo: string | null;
                favicon: string | null;
                bannerImage: string | null;
                domain: string | null;
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
                ownerId: string;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            merchantId: string;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            address: string | null;
            city: string | null;
            province: string | null;
            bankName: string | null;
            bankAccountNumber: string | null;
            bankAccountName: string | null;
            fullName: string | null;
            birthDate: Date | null;
            gender: import("@prisma/client").$Enums.Gender | null;
            postalCode: string | null;
            idCardNumber: string | null;
        } | null;
    } & {
        username: string | null;
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        balance: number;
        merchantId: string | null;
        deletedAt: Date | null;
        email: string | null;
        phone: string | null;
        password: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        adminPermissions: import("@prisma/client/runtime/client").JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referralCode: string;
        referredById: string | null;
        bonusBalance: number;
    }>;
    updateUserStatus(id: string, status: UserStatus, reason?: string): Promise<{
        username: string | null;
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        balance: number;
        merchantId: string | null;
        deletedAt: Date | null;
        email: string | null;
        phone: string | null;
        password: string;
        avatar: string | null;
        role: import("@prisma/client").$Enums.Role;
        adminPermissions: import("@prisma/client/runtime/client").JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referralCode: string;
        referredById: string | null;
        bonusBalance: number;
    }>;
    adjustBalance(id: string, operatorId: string, type: 'ADD' | 'DEDUCT', amount: number, note: string): Promise<any>;
    getBalanceHistories(id: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        userId: string;
        note: string | null;
        orderId: string | null;
        type: import("@prisma/client").$Enums.BalanceTrxType;
        amount: number;
        balanceBefore: number;
        balanceAfter: number;
        depositId: string | null;
        withdrawalId: string | null;
    }[]>;
    getLoginSessions(id: string): Promise<{
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
        token: string;
        refreshToken: string;
        device: string | null;
        expiresAt: Date;
        lastActiveAt: Date;
    }[]>;
    forceLogoutAllSessions(id: string): Promise<{
        success: boolean;
        revoked: number;
    }>;
}
