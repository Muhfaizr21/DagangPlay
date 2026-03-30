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
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const members_service_1 = require("./members.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
let MembersController = class MembersController {
    membersService;
    prisma;
    constructor(membersService, prisma) {
        this.membersService = membersService;
        this.prisma = prisma;
    }
    async getMembers(req, search, role) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.membersService.getAllUsers(merchant.id, search, role);
    }
    async createMember(req, data) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.membersService.createManualUser(merchant.id, data);
    }
    async updateMember(req, userId, data) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.membersService.updateUser(merchant.id, userId, data);
    }
    async toggleRole(req, userId, targetRole) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.membersService.toggleResellerStatus(merchant.id, userId, targetRole);
    }
    async getRanking(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.membersService.getTopResellers(merchant.id);
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "createMember", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "updateMember", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "toggleRole", null);
__decorate([
    (0, common_1.Get)('ranking'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getRanking", null);
exports.MembersController = MembersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('merchant/members'),
    __metadata("design:paramtypes", [members_service_1.MembersService, prisma_service_1.PrismaService])
], MembersController);
//# sourceMappingURL=members.controller.js.map