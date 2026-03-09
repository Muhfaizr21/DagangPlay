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
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.MerchantStatus;
        deletedAt: Date | null;
        domain: string | null;
        ownerId: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getMerchantDetail(id: string): Promise<{
        resellersCount: number;
        omset: number;
        _count: {
            deposits: number;
            supportTickets: number;
            orders: number;
        };
        owner: {
            id: string;
            name: string;
            email: string | null;
            status: import("@prisma/client").$Enums.UserStatus;
            isVerified: boolean;
        };
        members: ({
            user: {
                id: string;
                name: string;
                email: string | null;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            merchantId: string;
            userId: string;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.MerchantStatus;
        deletedAt: Date | null;
        domain: string | null;
        ownerId: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateSettings(id: string, body: any): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.MerchantStatus;
        deletedAt: Date | null;
        domain: string | null;
        ownerId: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    resetOwnerPassword(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
