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
        status: import("@prisma/client").$Enums.UserStatus;
        email: string | null;
        phone: string | null;
        balance: number;
    }[]>;
    updateStatus(merchantId: string, resellerId: string, status: UserStatus): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.UserStatus;
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
    }>;
    adjustBalance(merchantId: string, userId: string, resellerId: string, type: 'ADD' | 'SUBTRACT', amount: number, notes: string): Promise<any>;
    createReseller(merchantId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.UserStatus;
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
    }>;
}
