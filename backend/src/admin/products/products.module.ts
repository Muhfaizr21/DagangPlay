import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { PricingRulesController } from './pricing-rules.controller';
import { PublicProductsController } from './public-products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [
    ProductsController,
    PricingRulesController,
    PublicProductsController,
  ],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}
