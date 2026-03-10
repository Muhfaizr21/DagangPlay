import { MarketingService } from './marketing.service';
import { MerchantPlan } from '@prisma/client';
export declare class MarketingController {
    private readonly marketingService;
    constructor(marketingService: MarketingService);
    getGuides(search?: string, plan?: MerchantPlan): Promise<any>;
    getGuide(id: string): Promise<any>;
    createGuide(data: any): Promise<any>;
    updateGuide(id: string, data: any): Promise<any>;
    deleteGuide(id: string): Promise<any>;
    getMerchantGuides(req: any): Promise<any>;
}
