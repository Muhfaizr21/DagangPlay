import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProductsModule } from './products/products.module';
import { MembersModule } from './members/members.module';
import { OrdersModule } from './orders/orders.module';
import { FinanceModule } from './finance/finance.module';
import { CommissionsModule } from './commissions/commissions.module';
import { PromosModule } from './promos/promos.module';
import { ContentModule } from './content/content.module';
import { SettingsModule } from './settings/settings.module';
import { SupportModule } from './support/support.module';
import { ReportsModule } from './reports/reports.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [DashboardModule, ProductsModule, MembersModule, OrdersModule, FinanceModule, CommissionsModule, PromosModule, ContentModule, SettingsModule, SupportModule, ReportsModule, SubscriptionModule]
})
export class MerchantModule {}
