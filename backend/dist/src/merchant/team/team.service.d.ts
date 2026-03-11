import { PrismaService } from '../../prisma.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';
export declare class TeamService {
    private prisma;
    private subscriptionsService;
    constructor(prisma: PrismaService, subscriptionsService: SubscriptionsService);
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
        userId: string;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    addTeamMember(merchantId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateTeamMember(merchantId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    removeTeamMember(merchantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
