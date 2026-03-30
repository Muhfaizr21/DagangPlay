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
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
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
        merchantMemberships: ({
            merchant: {
                id: string;
                name: string;
                slug: string;
                logo: string | null;
                favicon: string | null;
                bannerImage: string | null;
                domain: string | null;
                description: string | null;
                tagline: string | null;
                contactEmail: string | null;
                contactPhone: string | null;
                contactWhatsapp: string | null;
                address: string | null;
                city: string | null;
                province: string | null;
                status: import("@prisma/client").$Enums.MerchantStatus;
                plan: import("@prisma/client").$Enums.MerchantPlan;
                planExpiredAt: Date | null;
                isOfficial: boolean;
                settings: import("@prisma/client/runtime/client").JsonValue | null;
                ownerId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                autoPayoutEnabled: boolean;
                autoPayoutSchedule: string | null;
                autoPayoutThreshold: number;
                availableBalance: number;
                escrowBalance: number;
                forceHttps: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            userId: string;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        profile: {
            id: string;
            address: string | null;
            city: string | null;
            province: string | null;
            createdAt: Date;
            updatedAt: Date;
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
    } & {
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
        adminPermissions: import("@prisma/client/runtime/client").JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        balance: number;
        bonusBalance: number;
        isGuest: boolean;
    }>;
    updateUserStatus(id: string, status: UserStatus, reason?: string): Promise<{
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
        adminPermissions: import("@prisma/client/runtime/client").JsonValue | null;
        isVerified: boolean;
        verifiedAt: Date | null;
        referredById: string | null;
        balance: number;
        bonusBalance: number;
        isGuest: boolean;
    }>;
    adjustBalance(id: string, operatorId: string, type: 'ADD' | 'DEDUCT', amount: number, note: string): Promise<any>;
    getBalanceHistories(id: string, limit?: number): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        userId: string;
        note: string | null;
        amount: number;
        orderId: string | null;
        type: import("@prisma/client").$Enums.BalanceTrxType;
        balanceBefore: number;
        balanceAfter: number;
        depositId: string | null;
        withdrawalId: string | null;
    }[]>;
    getLoginSessions(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        ipAddress: string | null;
        userAgent: string | null;
        expiresAt: Date;
        token: string;
        refreshToken: string;
        device: string | null;
        lastActiveAt: Date;
    }[]>;
    forceLogoutAllSessions(id: string): Promise<{
        success: boolean;
        revoked: number;
    }>;
}
