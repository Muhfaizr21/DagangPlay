"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const subscriptions_service_1 = require("./subscriptions.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let SubscriptionsController = class SubscriptionsController {
    subscriptionsService;
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    async getInvoices(search, status) {
        return this.subscriptionsService.getInvoices(search, status);
    }
    async confirmInvoice(id) {
        return this.subscriptionsService.confirmInvoice(id, 'SuperAdmin');
    }
    async rejectInvoice(id, notes) {
        return this.subscriptionsService.rejectInvoice(id, notes);
    }
    async adjustMerchant(id, plan, days) {
        return this.subscriptionsService.updateMerchantPlanManual(id, plan, days, 'SuperAdmin');
    }
    async getFeatures() {
        return this.subscriptionsService.getPlanFeatures();
    }
    async updateFeatures(features) {
        return this.subscriptionsService.updatePlanFeatures(features, 'SuperAdmin');
    }
    async getPerformance() {
        return this.subscriptionsService.getSaaSPerformance();
    }
    async createManualInvoice(merchantId, plan, amount, dueDate) {
        return this.subscriptionsService.createManualInvoice(merchantId, plan, amount, dueDate, 'SuperAdmin');
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('invoices'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Post)('invoices/:id/confirm'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "confirmInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id/reject'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "rejectInvoice", null);
__decorate([
    (0, common_1.Post)('merchants/:id/adjust'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('plan')),
    __param(2, (0, common_1.Body)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "adjustMerchant", null);
__decorate([
    (0, common_1.Get)('plans/features'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getFeatures", null);
__decorate([
    (0, common_1.Post)('plans/features'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "updateFeatures", null);
__decorate([
    (0, common_1.Get)('performance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getPerformance", null);
__decorate([
    (0, common_1.Post)('invoices/manual'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)('merchantId')),
    __param(1, (0, common_1.Body)('plan')),
    __param(2, (0, common_1.Body)('amount')),
    __param(3, (0, common_1.Body)('dueDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number, Date]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createManualInvoice", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Controller)('admin/subscriptions'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map