import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma.service';

import { SubscriptionsModule } from '../../admin/subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService]
})
export class ProductsModule { }

