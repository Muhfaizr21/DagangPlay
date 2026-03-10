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
exports.MarketingController = void 0;
const common_1 = require("@nestjs/common");
const marketing_service_1 = require("./marketing.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let MarketingController = class MarketingController {
    marketingService;
    constructor(marketingService) {
        this.marketingService = marketingService;
    }
    async getGuides(search, plan) {
        return this.marketingService.getAllGuides(search, plan);
    }
    async getGuide(id) {
        return this.marketingService.getGuideById(id);
    }
    async createGuide(data) {
        return this.marketingService.createGuide(data);
    }
    async updateGuide(id, data) {
        return this.marketingService.updateGuide(id, data);
    }
    async deleteGuide(id) {
        return this.marketingService.deleteGuide(id);
    }
    async getMerchantGuides(req) {
        const user = await this.marketingService.getGuidesForMerchant(req.user.merchantId);
        return user;
    }
};
exports.MarketingController = MarketingController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Get)('guides'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('plan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getGuides", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Get)('guides/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getGuide", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Post)('guides'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "createGuide", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Patch)('guides/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "updateGuide", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Delete)('guides/:id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "deleteGuide", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    (0, common_1.Get)('my-guides'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getMerchantGuides", null);
exports.MarketingController = MarketingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/marketing'),
    __metadata("design:paramtypes", [marketing_service_1.MarketingService])
], MarketingController);
//# sourceMappingURL=marketing.controller.js.map