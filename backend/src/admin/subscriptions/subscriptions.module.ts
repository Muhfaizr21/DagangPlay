import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { PublicSubscriptionsController } from './public-subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SubscriptionsController, PublicSubscriptionsController],
  providers: [SubscriptionsService, PrismaService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
