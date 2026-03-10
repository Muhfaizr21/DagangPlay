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
exports.ResellersController = void 0;
const common_1 = require("@nestjs/common");
const resellers_service_1 = require("./resellers.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
let ResellersController = class ResellersController {
    resellersService;
    prisma;
    constructor(resellersService, prisma) {
        this.resellersService = resellersService;
        this.prisma = prisma;
    }
    async getResellers(req, search) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.resellersService.getResellers(merchant.id, search);
    }
    async updateStatus(req, resellerId, status) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.resellersService.updateStatus(merchant.id, resellerId, status);
    }
    async adjustBalance(req, resellerId, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.resellersService.adjustBalance(merchant.id, req.user.id, resellerId, body.type, body.amount, body.notes);
    }
    async createReseller(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.resellersService.createReseller(merchant.id, body);
    }
};
exports.ResellersController = ResellersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ResellersController.prototype, "getResellers", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ResellersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/balance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ResellersController.prototype, "adjustBalance", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ResellersController.prototype, "createReseller", null);
exports.ResellersController = ResellersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('merchant/resellers'),
    __metadata("design:paramtypes", [resellers_service_1.ResellersService, prisma_service_1.PrismaService])
], ResellersController);
//# sourceMappingURL=resellers.controller.js.map