import { PrismaService } from '../../prisma.service';
export declare class PlanMappingController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMappings(): Promise<{
        id: string;
        updatedAt: Date;
        isActive: boolean;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        updatedBy: string;
        tier: import("@prisma/client").$Enums.PriceTier;
    }[]>;
    syncDefaultMappings(): Promise<{
        success: boolean;
    }>;
    updateMapping(dto: any): Promise<{
        id: string;
        updatedAt: Date;
        isActive: boolean;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        updatedBy: string;
        tier: import("@prisma/client").$Enums.PriceTier;
    }>;
}
