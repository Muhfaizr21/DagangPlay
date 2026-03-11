import { PrismaService } from '../../prisma.service';
import { UserStatus } from '@prisma/client';
export declare class ResellersService {
    private prisma;
    constructor(prisma: PrismaService);
    getResellers(merchantId: string, search?: string): Promise<{
        totalOrders: number;
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        _count: {
            ordersAsCustomer: number;
        };
        balance: number;
        email: string | null;
        phone: string | null;
    }[]>;
    updateStatus(merchantId: string, resellerId: string, status: UserStatus): Promise<{
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
    adjustBalance(merchantId: string, userId: string, resellerId: string, type: 'ADD' | 'SUBTRACT', amount: number, notes: string): Promise<any>;
    createReseller(merchantId: string, data: any): Promise<{
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
}
