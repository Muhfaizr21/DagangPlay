import { PublicOrdersService } from './public-orders.service';
import { TripayService } from '../../tripay/tripay.service';
export declare class PublicOrdersController {
    private readonly publicOrdersService;
    private readonly tripayService;
    constructor(publicOrdersService: PublicOrdersService, tripayService: TripayService);
    getPaymentChannels(): Promise<any>;
    checkout(body: any): Promise<{
        success: boolean;
        orderNumber: string;
        checkoutUrl: any;
    }>;
}
