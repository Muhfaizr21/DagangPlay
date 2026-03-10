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
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        _count: {
            ordersAsCustomer: number;
        };
        email: string | null;
        phone: string | null;
        balance: number;
    }[]>;
    updateStatus(req: any, resellerId: string, status: UserStatus): Promise<{
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
    }>;
    adjustBalance(req: any, resellerId: string, body: {
        type: 'ADD' | 'SUBTRACT';
        amount: number;
        notes: string;
    }): Promise<any>;
    createReseller(req: any, body: any): Promise<{
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
    }>;
}
