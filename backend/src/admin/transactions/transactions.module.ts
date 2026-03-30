import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../prisma.service';
import { BullModule } from '@nestjs/bullmq';

import { PublicOrdersModule } from '../../public/orders/public-orders.module';

@Module({
  imports: [
    PublicOrdersModule,
    BullModule.registerQueue({ name: 'digiflazz-fulfillment' }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService]
})
export class TransactionsModule { }
