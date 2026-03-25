"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const prisma_service_1 = require("./prisma.service");
const tripay_module_1 = require("./tripay/tripay.module");
const public_orders_module_1 = require("./public/orders/public-orders.module");
const dashboard_module_1 = require("./admin/dashboard/dashboard.module");
const merchants_module_1 = require("./admin/merchants/merchants.module");
const products_module_1 = require("./admin/products/products.module");
const suppliers_module_1 = require("./admin/suppliers/suppliers.module");
const users_module_1 = require("./admin/users/users.module");
const transactions_module_1 = require("./admin/transactions/transactions.module");
const finance_module_1 = require("./admin/finance/finance.module");
const commissions_module_1 = require("./admin/commissions/commissions.module");
const promos_module_1 = require("./admin/promos/promos.module");
const subscriptions_module_1 = require("./admin/subscriptions/subscriptions.module");
const schedule_1 = require("@nestjs/schedule");
const content_module_1 = require("./admin/content/content.module");
const security_module_1 = require("./admin/security/security.module");
const tickets_module_1 = require("./admin/tickets/tickets.module");
const settings_module_1 = require("./admin/settings/settings.module");
const auth_module_1 = require("./auth/auth.module");
const upload_module_1 = require("./admin/upload/upload.module");
const workers_module_1 = require("./admin/workers/workers.module");
const merchant_module_1 = require("./merchant/merchant.module");
const digiflazz_module_1 = require("./admin/digiflazz/digiflazz.module");
const withdrawals_module_1 = require("./merchant/withdrawals/withdrawals.module");
const marketing_module_1 = require("./admin/marketing/marketing.module");
const chat_module_1 = require("./chat/chat.module");
const public_digiflazz_module_1 = require("./public/digiflazz/public-digiflazz.module");
const notifications_module_1 = require("./common/notifications/notifications.module");
const tasks_service_1 = require("./common/tasks/tasks.service");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(logger_middleware_1.LoggerMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 20,
                }]),
            schedule_1.ScheduleModule.forRoot(),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => {
                    try {
                        const store = await (0, cache_manager_redis_yet_1.redisStore)({
                            socket: {
                                host: process.env.REDIS_HOST || 'localhost',
                                port: parseInt(process.env.REDIS_PORT || '6379'),
                            },
                            password: process.env.REDIS_PASSWORD || undefined,
                            ttl: 60000,
                        });
                        console.log('[Cache] Redis storage connected successfully.');
                        return { store };
                    }
                    catch (e) {
                        console.warn('[Cache] Could not connect to Redis, falling back to memory storage.', e.message);
                        return { ttl: 60000 };
                    }
                },
            }),
            dashboard_module_1.DashboardModule,
            merchants_module_1.MerchantsModule,
            products_module_1.ProductsModule,
            suppliers_module_1.SuppliersModule,
            users_module_1.UsersModule,
            transactions_module_1.TransactionsModule,
            finance_module_1.FinanceModule,
            commissions_module_1.CommissionsModule,
            promos_module_1.PromosModule,
            subscriptions_module_1.SubscriptionsModule,
            content_module_1.ContentModule,
            security_module_1.SecurityModule,
            tickets_module_1.TicketsModule,
            settings_module_1.SettingsModule,
            auth_module_1.AuthModule,
            upload_module_1.UploadModule,
            workers_module_1.WorkersModule,
            merchant_module_1.MerchantModule,
            digiflazz_module_1.DigiflazzModule,
            tripay_module_1.TripayModule,
            public_orders_module_1.PublicOrdersModule,
            withdrawals_module_1.WithdrawalsModule,
            marketing_module_1.MarketingModule,
            chat_module_1.ChatModule,
            public_digiflazz_module_1.PublicDigiflazzModule,
            notifications_module_1.NotificationsModule
        ],
        controllers: [],
        providers: [
            prisma_service_1.PrismaService,
            tasks_service_1.TasksService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map