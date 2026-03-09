import { PrismaService } from '../../prisma.service';
import { TripayService } from '../../tripay/tripay.service';
export declare class PublicOrdersService {
    private prisma;
    private tripay;
    constructor(prisma: PrismaService, tripay: TripayService);
    private mapPaymentMethod;
    createCheckout(body: any): Promise<{
        success: boolean;
        orderNumber: string;
        checkoutUrl: any;
    }>;
}
