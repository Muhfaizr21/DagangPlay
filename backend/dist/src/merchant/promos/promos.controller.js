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
exports.PromosController = void 0;
const common_1 = require("@nestjs/common");
const promos_service_1 = require("./promos.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
let PromosController = class PromosController {
    promosService;
    prisma;
    constructor(promosService, prisma) {
        this.promosService = promosService;
        this.prisma = prisma;
    }
    async getPromos(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.getPromos(merchant.id);
    }
    async createPromo(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.createPromo(merchant.id, body);
    }
    async togglePromo(req, id, isActive) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.togglePromo(merchant.id, id, isActive);
    }
    async deletePromo(req, id) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.deletePromo(merchant.id, id);
    }
    async getFlashSales(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.getFlashSales(merchant.id);
    }
    async createFlashSale(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.createFlashSale(merchant.id, body);
    }
    async toggleFlashSale(req, id, isActive) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.toggleFlashSale(merchant.id, id, isActive);
    }
    async deleteFlashSale(req, id) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.promosService.deleteFlashSale(merchant.id, id);
    }
};
exports.PromosController = PromosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "getPromos", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "createPromo", null);
__decorate([
    (0, common_1.Put)(':id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "togglePromo", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "deletePromo", null);
__decorate([
    (0, common_1.Get)('flash-sales'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "getFlashSales", null);
__decorate([
    (0, common_1.Post)('flash-sales'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "createFlashSale", null);
__decorate([
    (0, common_1.Put)('flash-sales/:id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "toggleFlashSale", null);
__decorate([
    (0, common_1.Delete)('flash-sales/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PromosController.prototype, "deleteFlashSale", null);
exports.PromosController = PromosController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('merchant/promos'),
    __metadata("design:paramtypes", [promos_service_1.PromosService, prisma_service_1.PrismaService])
], PromosController);
//# sourceMappingURL=promos.controller.js.map