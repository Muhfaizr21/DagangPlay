import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { DashboardModule } from './admin/dashboard/dashboard.module';
import { MerchantsModule } from './admin/merchants/merchants.module';
import { ProductsModule } from './admin/products/products.module';
import { SuppliersModule } from './admin/suppliers/suppliers.module';
import { UsersModule } from './admin/users/users.module';
import { TransactionsModule } from './admin/transactions/transactions.module';

@Module({
  imports: [DashboardModule, MerchantsModule, ProductsModule, SuppliersModule, UsersModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
