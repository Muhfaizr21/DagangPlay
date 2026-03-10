import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../../prisma.service';

import { TripayModule } from '../../tripay/tripay.module';

@Module({
  imports: [TripayModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService]
})
export class SubscriptionModule { }
