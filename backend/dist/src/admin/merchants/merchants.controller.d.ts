import { MerchantsService } from './merchants.service';
import { MerchantStatus } from '@prisma/client';
export declare class MerchantsController {
    private readonly merchantsService;
    constructor(merchantsService: MerchantsService);
    getMerchants(search?: string, status?: string): Promise<{
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
    updateStatus(id: string, status: MerchantStatus, reason?: string): Promise<{
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
