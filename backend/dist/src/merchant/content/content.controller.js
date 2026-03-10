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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const content_service_1 = require("./content.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
let ContentController = class ContentController {
    contentService;
    prisma;
    constructor(contentService, prisma) {
        this.contentService = contentService;
        this.prisma = prisma;
    }
    async getBanners(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.getBanners(merchant.id);
    }
    async createBanner(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.createBanner(merchant.id, body);
    }
    async toggleBanner(req, id, isActive) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.toggleBanner(merchant.id, id, isActive);
    }
    async deleteBanner(req, id) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.deleteBanner(merchant.id, id);
    }
    async getAnnouncements(req) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.getAnnouncements(merchant.id);
    }
    async createAnnouncement(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.createAnnouncement(merchant.id, body);
    }
    async toggleAnnouncement(req, id, isActive) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.toggleAnnouncement(merchant.id, id, isActive);
    }
    async deleteAnnouncement(req, id) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.deleteAnnouncement(merchant.id, id);
    }
    async updateDesign(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.updateStoreDesign(merchant.id, body);
    }
    async updateTheme(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.contentService.updateThemeSettings(merchant.id, body);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Get)('banners'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getBanners", null);
__decorate([
    (0, common_1.Post)('banners'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createBanner", null);
__decorate([
    (0, common_1.Put)('banners/:id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "toggleBanner", null);
__decorate([
    (0, common_1.Delete)('banners/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "deleteBanner", null);
__decorate([
    (0, common_1.Get)('announcements'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Post)('announcements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Put)('announcements/:id/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "toggleAnnouncement", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Put)('design'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updateDesign", null);
__decorate([
    (0, common_1.Put)('theme'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updateTheme", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('merchant/content'),
    __metadata("design:paramtypes", [content_service_1.ContentService, prisma_service_1.PrismaService])
], ContentController);
//# sourceMappingURL=content.controller.js.map