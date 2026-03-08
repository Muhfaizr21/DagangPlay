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
const prisma_service_1 = require("./prisma.service");
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
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), dashboard_module_1.DashboardModule, merchants_module_1.MerchantsModule, products_module_1.ProductsModule, suppliers_module_1.SuppliersModule, users_module_1.UsersModule, transactions_module_1.TransactionsModule, finance_module_1.FinanceModule, commissions_module_1.CommissionsModule, promos_module_1.PromosModule, subscriptions_module_1.SubscriptionsModule, content_module_1.ContentModule, security_module_1.SecurityModule, tickets_module_1.TicketsModule, settings_module_1.SettingsModule, auth_module_1.AuthModule, upload_module_1.UploadModule, workers_module_1.WorkersModule],
        controllers: [],
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map