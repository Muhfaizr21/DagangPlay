import { TeamService } from './team.service';
import { PrismaService } from '../../prisma.service';
export declare class TeamController {
    private readonly teamService;
    private prisma;
    constructor(teamService: TeamService, prisma: PrismaService);
    getTeamMembers(req: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    addTeamMember(req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateTeamMember(req: any, id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    removeTeamMember(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
