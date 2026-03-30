import { MembersService } from './members.service';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
export declare class MembersController {
    private readonly membersService;
    private prisma;
    constructor(membersService: MembersService, prisma: PrismaService);
    getMembers(req: any, search?: string, role?: Role): Promise<{
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
    createMember(req: any, data: {
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
    updateMember(req: any, userId: string, data: {
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
    toggleRole(req: any, userId: string, targetRole: string): Promise<{
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
    getRanking(req: any): Promise<{
        id: string;
        name: string;
        totalTrx: number;
        totalOmset: number;
    }[]>;
}
