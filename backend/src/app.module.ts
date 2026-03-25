import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { TripayModule } from './tripay/tripay.module';
import { PublicOrdersModule } from './public/orders/public-orders.module';
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
import { WithdrawalsModule } from './merchant/withdrawals/withdrawals.module';

import { MarketingModule } from './admin/marketing/marketing.module';
import { ChatModule } from './chat/chat.module';

import { PublicDigiflazzModule } from './public/digiflazz/public-digiflazz.module';
import { NotificationsModule } from './common/notifications/notifications.module';

import { TasksService } from './common/tasks/tasks.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 20, // Global limit for general usage
    }]),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            password: process.env.REDIS_PASSWORD || undefined,
            ttl: 60000, // Default TTL 60s
          });
          console.log('[Cache] Redis storage connected successfully.');
          return { store };
        } catch (e) {
          console.warn('[Cache] Could not connect to Redis, falling back to memory storage.', e.message);
          return { ttl: 60000 }; // Fallback to memory
        }
      },
    }),
    DashboardModule, 
    MerchantsModule, 
    ProductsModule, 
    SuppliersModule, 
    UsersModule, 
    TransactionsModule, 
    FinanceModule, 
    CommissionsModule, 
    PromosModule, 
    SubscriptionsModule, 
    ContentModule, 
    SecurityModule, 
    TicketsModule, 
    SettingsModule, 
    AuthModule, 
    UploadModule, 
    WorkersModule, 
    MerchantModule, 
    DigiflazzModule, 
    TripayModule, 
    PublicOrdersModule, 
    WithdrawalsModule, 
    MarketingModule, 
    ChatModule, 
    PublicDigiflazzModule,
    NotificationsModule
  ],
  controllers: [],
  providers: [
    PrismaService,
    TasksService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
