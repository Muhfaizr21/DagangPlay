import { ResellersService } from './resellers.service';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
export declare class ResellersController {
    private readonly resellersService;
    private prisma;
    constructor(resellersService: ResellersService, prisma: PrismaService);
    getResellers(req: any, search?: string): Promise<{
        totalOrders: number;
        id: string;
        email: string | null;
        phone: string | null;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        balance: number;
        createdAt: Date;
        _count: {
            ordersAsCustomer: number;
        };
    }[]>;
    updateStatus(req: any, resellerId: string, status: UserStatus): Promise<{
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
    adjustBalance(req: any, resellerId: string, body: {
        type: 'ADD' | 'SUBTRACT';
        amount: number;
        notes: string;
    }): Promise<any>;
    createReseller(req: any, body: any): Promise<{
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
}
