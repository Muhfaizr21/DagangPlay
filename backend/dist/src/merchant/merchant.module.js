"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const products_module_1 = require("./products/products.module");
const resellers_module_1 = require("./resellers/resellers.module");
const orders_module_1 = require("./orders/orders.module");
const finance_module_1 = require("./finance/finance.module");
const commissions_module_1 = require("./commissions/commissions.module");
const promos_module_1 = require("./promos/promos.module");
const content_module_1 = require("./content/content.module");
const settings_module_1 = require("./settings/settings.module");
const team_module_1 = require("./team/team.module");
const support_module_1 = require("./support/support.module");
const reports_module_1 = require("./reports/reports.module");
const subscription_module_1 = require("./subscription/subscription.module");
let MerchantModule = class MerchantModule {
};
exports.MerchantModule = MerchantModule;
exports.MerchantModule = MerchantModule = __decorate([
    (0, common_1.Module)({
        imports: [dashboard_module_1.DashboardModule, products_module_1.ProductsModule, resellers_module_1.ResellersModule, orders_module_1.OrdersModule, finance_module_1.FinanceModule, commissions_module_1.CommissionsModule, promos_module_1.PromosModule, content_module_1.ContentModule, settings_module_1.SettingsModule, team_module_1.TeamModule, support_module_1.SupportModule, reports_module_1.ReportsModule, subscription_module_1.SubscriptionModule]
    })
], MerchantModule);
//# sourceMappingURL=merchant.module.js.map