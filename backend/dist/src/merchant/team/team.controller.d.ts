import { TeamService } from './team.service';
import { PrismaService } from '../../prisma.service';
export declare class TeamController {
    private readonly teamService;
    private prisma;
    constructor(teamService: TeamService, prisma: PrismaService);
    getTeamMembers(req: any): Promise<({
        user: {
            id: string;
            email: string | null;
            name: string;
        };
    } & {
        id: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    addTeamMember(req: any, body: any): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateTeamMember(req: any, id: string, body: any): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    removeTeamMember(req: any, id: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.MerchantMemberRole;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        permissions: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
