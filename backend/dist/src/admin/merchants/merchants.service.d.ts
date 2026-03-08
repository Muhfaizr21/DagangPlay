import { PrismaService } from '../../prisma.service';
import { MerchantStatus } from '@prisma/client';
export declare class MerchantsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllMerchants(search?: string, statusFilter?: string): Promise<{
        id: string;
        name: string;
        domain: string;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        status: import("@prisma/client").$Enums.MerchantStatus;
        resellers: number;
        omset: number;
        date: string;
        isOfficial: boolean;
    }[]>;
    setMerchantStatus(id: string, status: MerchantStatus, reason?: string): Promise<{
        status: import("@prisma/client").$Enums.MerchantStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        domain: string | null;
        slug: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        description: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        isOfficial: boolean;
        ownerId: string;
        deletedAt: Date | null;
    }>;
}
