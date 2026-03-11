import { MerchantsService } from './merchants.service';
import { MerchantStatus } from '@prisma/client';
export declare class MerchantsController {
    private readonly merchantsService;
    constructor(merchantsService: MerchantsService);
    getMerchants(search?: string, status?: string, page?: string, perPage?: string): Promise<{
        data: {
            id: any;
            name: any;
            domain: any;
            plan: any;
            status: any;
            resellers: number;
            omset: number;
            date: any;
            isOfficial: any;
        }[];
        meta: {
            total: number;
            lastPage: number;
            currentPage: number;
            perPage: number;
            prev: number | null;
            next: number | null;
        };
    }>;
    updateStatus(id: string, status: MerchantStatus, reason?: string): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        domain: string | null;
        ownerId: string;
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
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getMerchantDetail(id: string): Promise<{
        resellersCount: number;
        omset: number;
        _count: {
            deposits: number;
            orders: number;
            supportTickets: number;
        };
        owner: {
            id: string;
            email: string | null;
            name: string;
            status: import("@prisma/client").$Enums.UserStatus;
            isVerified: boolean;
        };
        members: ({
            user: {
                id: string;
                email: string | null;
                name: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            merchantId: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        domain: string | null;
        ownerId: string;
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
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    updateSettings(id: string, body: any): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        domain: string | null;
        ownerId: string;
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
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    resetOwnerPassword(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
