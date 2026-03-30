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
exports.SaasController = void 0;
const common_1 = require("@nestjs/common");
const saas_service_1 = require("./saas.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../auth/decorators/permissions.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let SaasController = class SaasController {
    saasService;
    constructor(saasService) {
        this.saasService = saasService;
    }
    async getGlobalLedgers() {
        return this.saasService.getGlobalLedgers();
    }
    async getDeadLetterQueue() {
        return this.saasService.getDeadLetterQueue();
    }
    async requeueDLQJob(jobId) {
        return this.saasService.requeueDLQJob(jobId);
    }
    async getDomainsStatus() {
        return this.saasService.getMerchantDomainsStatus();
    }
    async getMerchantLedger(req, merchantId) {
        if (req.user.merchantId !== merchantId) {
            throw new common_1.ForbiddenException('Unauthorized access to this ledger');
        }
        return this.saasService.getMerchantLedger(merchantId);
    }
    async updateAutoPayoutConfig(req, body) {
        const merchantId = req.user.merchantId;
        return this.saasService.updateAutoPayoutConfig({ ...body, merchantId });
    }
    async getMerchantWebhookLogs(req, merchantId) {
        if (req.user.merchantId !== merchantId) {
            throw new common_1.ForbiddenException('Unauthorized access to these logs');
        }
        return this.saasService.getMerchantWebhookLogs(merchantId);
    }
    async retryMerchantWebhook(payload) {
        return this.saasService.retryMerchantWebhook(payload.logId);
    }
};
exports.SaasController = SaasController;
__decorate([
    (0, common_1.Get)('admin/ledger/escrow'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "getGlobalLedgers", null);
__decorate([
    (0, common_1.Get)('admin/webhooks/dlq'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "getDeadLetterQueue", null);
__decorate([
    (0, common_1.Post)('admin/webhooks/dlq/:id/requeue'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "requeueDLQJob", null);
__decorate([
    (0, common_1.Get)('admin/domains/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "getDomainsStatus", null);
__decorate([
    (0, common_1.Get)('merchant/ledger'),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "getMerchantLedger", null);
__decorate([
    (0, common_1.Post)('merchant/payout/auto'),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "updateAutoPayoutConfig", null);
__decorate([
    (0, common_1.Get)('merchant/webhooks/logs'),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "getMerchantWebhookLogs", null);
__decorate([
    (0, common_1.Post)('merchant/webhooks/retry'),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "retryMerchantWebhook", null);
exports.SaasController = SaasController = __decorate([
    (0, permissions_decorator_1.Permissions)('manage_saas'),
    (0, common_1.Controller)('saas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [saas_service_1.SaasService])
], SaasController);
//# sourceMappingURL=saas.controller.js.map