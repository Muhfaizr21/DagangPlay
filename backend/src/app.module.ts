import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DashboardModule } from './admin/dashboard/dashboard.module';
import { MerchantsModule } from './admin/merchants/merchants.module';
import { ProductsModule } from './admin/products/products.module';
import { SuppliersModule } from './admin/suppliers/suppliers.module';
import { UsersModule } from './admin/users/users.module';
import { TransactionsModule } from './admin/transactions/transactions.module';
import { FinanceModule } from './admin/finance/finance.module';
import { CommissionsModule } from './admin/commissions/commissions.module';
import { PromosModule } from './admin/promos/promos.module';
import { SubscriptionsModule } from './admin/subscriptions/subscriptions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ContentModule } from './admin/content/content.module';
import { SecurityModule } from './admin/security/security.module';
import { TicketsModule } from './admin/tickets/tickets.module';
import { SettingsModule } from './admin/settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './admin/upload/upload.module';
import { WorkersModule } from './admin/workers/workers.module';
import { MerchantModule } from './merchant/merchant.module';
import { DigiflazzModule } from './admin/digiflazz/digiflazz.module';

@Module({
  imports: [ScheduleModule.forRoot(), DashboardModule, MerchantsModule, ProductsModule, SuppliersModule, UsersModule, TransactionsModule, FinanceModule, CommissionsModule, PromosModule, SubscriptionsModule, ContentModule, SecurityModule, TicketsModule, SettingsModule, AuthModule, UploadModule, WorkersModule, MerchantModule, DigiflazzModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
