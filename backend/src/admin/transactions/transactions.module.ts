import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../prisma.service';

import { PublicOrdersModule } from '../../public/orders/public-orders.module';

@Module({
  imports: [PublicOrdersModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService]
})
export class TransactionsModule { }
