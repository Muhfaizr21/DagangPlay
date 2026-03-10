import { PrismaService } from '../../prisma.service';
import { MerchantPlan } from '@prisma/client';
export declare class MarketingService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllGuides(search?: string, plan?: MerchantPlan): Promise<any>;
    getGuideById(id: string): Promise<any>;
    createGuide(data: any): Promise<any>;
    updateGuide(id: string, data: any): Promise<any>;
    deleteGuide(id: string): Promise<any>;
    getGuidesForMerchant(merchantId: string): Promise<any>;
}
