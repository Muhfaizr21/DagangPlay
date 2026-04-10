import { Controller, Get } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('public/subscriptions')
export class PublicSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans/features')
  async getFeatures() {
    return this.subscriptionsService.getPlanFeatures();
  }
}
