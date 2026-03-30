import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma.service';
import { BullModule } from '@nestjs/bullmq';

import { DigiflazzModule } from '../../admin/digiflazz/digiflazz.module';
import { SubscriptionsModule } from '../../admin/subscriptions/subscriptions.module';

@Module({
  imports: [
    DigiflazzModule,
    SubscriptionsModule,
    BullModule.registerQueue({ name: 'digiflazz-fulfillment' }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService]
})
export class OrdersModule { }
