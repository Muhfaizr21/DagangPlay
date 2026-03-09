import { SubscriptionsService } from './subscriptions.service';
export declare class PublicSubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getFeatures(): Promise<any>;
}
