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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
let SettingsController = class SettingsController {
    settingsService;
    prisma;
    constructor(settingsService, prisma) {
        this.settingsService = settingsService;
        this.prisma = prisma;
    }
    async getSettings(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.settingsService.getSettings(merchant.id);
    }
    async updateProfile(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.settingsService.updateProfile(merchant.id, body);
    }
    async updateDomain(req, domain) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.settingsService.updateDomain(merchant.id, domain);
    }
    async getPaymentChannels(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.settingsService.getPaymentChannels(merchant.id);
    }
    async togglePaymentChannel(req, id, isActive) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.settingsService.togglePaymentChannel(merchant.id, id, isActive);
    }
    async getWebhooks(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.settingsService.getWebhooks(merchant.id);
    }
    async updateWebhook(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.settingsService.updateWebhook(merchant.id, body);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('domain'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateDomain", null);
__decorate([
    (0, common_1.Get)('payment-channels'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getPaymentChannels", null);
__decorate([
    (0, common_1.Put)('payment-channels/:id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "togglePaymentChannel", null);
__decorate([
    (0, common_1.Get)('webhooks'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getWebhooks", null);
__decorate([
    (0, common_1.Post)('webhooks'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateWebhook", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('merchant/settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService, prisma_service_1.PrismaService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map