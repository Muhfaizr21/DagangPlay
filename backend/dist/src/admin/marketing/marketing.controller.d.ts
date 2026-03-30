import { MarketingService } from './marketing.service';
export declare class MarketingController {
    private readonly marketingService;
    constructor(marketingService: MarketingService);
    getGuides(search?: string, plan?: any): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        sortOrder: number;
        content: string | null;
        imageUrl: string | null;
        category: string | null;
        thumbnail: string | null;
        videoUrl: string | null;
        targetPlan: import("@prisma/client").$Enums.MerchantPlan;
    }[]>;
    createGuide(data: any): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        sortOrder: number;
        content: string | null;
        imageUrl: string | null;
        category: string | null;
        thumbnail: string | null;
        videoUrl: string | null;
        targetPlan: import("@prisma/client").$Enums.MerchantPlan;
    }>;
    updateGuide(id: string, data: any): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        sortOrder: number;
        content: string | null;
        imageUrl: string | null;
        category: string | null;
        thumbnail: string | null;
        videoUrl: string | null;
        targetPlan: import("@prisma/client").$Enums.MerchantPlan;
    }>;
    deleteGuide(id: string): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        sortOrder: number;
        content: string | null;
        imageUrl: string | null;
        category: string | null;
        thumbnail: string | null;
        videoUrl: string | null;
        targetPlan: import("@prisma/client").$Enums.MerchantPlan;
    }>;
    broadcastAnnouncement(message: string): Promise<{
        success: boolean;
        total: number;
        sent: number;
    }>;
}
