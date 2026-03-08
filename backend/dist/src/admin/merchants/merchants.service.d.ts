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
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        domain: string | null;
        description: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        isOfficial: boolean;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    getMerchantDetail(id: string): Promise<{
        resellersCount: number;
        omset: number;
        owner: {
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.UserStatus;
            email: string | null;
            isVerified: boolean;
        };
        members: ({
            user: {
                id: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
                email: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            userId: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
        })[];
        _count: {
            orders: number;
            deposits: number;
            tickets: number;
        };
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        domain: string | null;
        description: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        isOfficial: boolean;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    updateMerchantSettings(id: string, settingsUpdate: any): Promise<{
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        favicon: string | null;
        bannerImage: string | null;
        domain: string | null;
        description: string | null;
        tagline: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        contactWhatsapp: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        status: import("@prisma/client").$Enums.MerchantStatus;
        plan: import("@prisma/client").$Enums.MerchantPlan;
        planExpiredAt: Date | null;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        isOfficial: boolean;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    resetOwnerPassword(merchantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
