import { PrismaService } from '../../prisma.service';
import { MerchantStatus } from '@prisma/client';
export declare class MerchantsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllMerchants(search?: string, statusFilter?: string, page?: number, perPage?: number): Promise<{
        data: {
            id: any;
            name: any;
            domain: any;
            plan: any;
            status: any;
            resellers: any;
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
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        autoPayoutEnabled: boolean;
        autoPayoutSchedule: string | null;
        autoPayoutThreshold: number;
        availableBalance: number;
        escrowBalance: number;
        forceHttps: boolean;
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
                email: string | null;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            userId: string;
            role: import("@prisma/client").$Enums.MerchantMemberRole;
            permissions: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
        _count: {
            deposits: number;
            orders: number;
            supportTickets: number;
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
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        autoPayoutEnabled: boolean;
        autoPayoutSchedule: string | null;
        autoPayoutThreshold: number;
        availableBalance: number;
        escrowBalance: number;
        forceHttps: boolean;
    }>;
    updateMerchantSettings(id: string, updateData: any): Promise<{
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
        isOfficial: boolean;
        settings: import("@prisma/client/runtime/client").JsonValue | null;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        autoPayoutEnabled: boolean;
        autoPayoutSchedule: string | null;
        autoPayoutThreshold: number;
        availableBalance: number;
        escrowBalance: number;
        forceHttps: boolean;
    }>;
    resetOwnerPassword(merchantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getMerchantResellers(merchantId: string): Promise<{
        id: string;
        name: string;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        _count: {
            ordersAsCustomer: number;
        };
        email: string | null;
        phone: string | null;
    }[]>;
}
