import { PrismaService } from '../../prisma.service';
export declare class TeamService {
    private prisma;
    constructor(prisma: PrismaService);
    getTeamMembers(merchantId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    addTeamMember(merchantId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateTeamMember(merchantId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    removeTeamMember(merchantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
