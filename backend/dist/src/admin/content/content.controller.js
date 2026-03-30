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
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../auth/decorators/permissions.decorator");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ContentController = class ContentController {
    contentService;
    constructor(contentService) {
        this.contentService = contentService;
    }
    async getBanners() {
        return this.contentService.getBanners();
    }
    async createBanner(data) {
        return this.contentService.createBanner(data);
    }
    async updateBanner(id, data) {
        return this.contentService.updateBanner(id, data);
    }
    async deleteBanner(id) {
        return this.contentService.deleteBanner(id);
    }
    async toggleBanner(id) {
        return this.contentService.turnOffBanner(id);
    }
    async getAnnouncements() {
        return this.contentService.getAnnouncements();
    }
    async createAnnouncement(data) {
        return this.contentService.createAnnouncement(data);
    }
    async updateAnnouncement(id, data) {
        return this.contentService.updateAnnouncement(id, data);
    }
    async deleteAnnouncement(id) {
        return this.contentService.deleteAnnouncement(id);
    }
    async toggleAnnouncement(id) {
        return this.contentService.toggleAnnouncement(id);
    }
    async getTemplates() {
        return this.contentService.getTemplates();
    }
    async saveTemplate(type, channel, data) {
        return this.contentService.saveTemplate(type, channel, data);
    }
    async getBroadcasts() {
        return this.contentService.getCampaigns();
    }
    async createBroadcast(data) {
        return this.contentService.createCampaign(data);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Get)('banners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getBanners", null);
__decorate([
    (0, common_1.Post)('banners'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createBanner", null);
__decorate([
    (0, common_1.Put)('banners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updateBanner", null);
__decorate([
    (0, common_1.Delete)('banners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "deleteBanner", null);
__decorate([
    (0, common_1.Post)('banners/:id/toggle'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "toggleBanner", null);
__decorate([
    (0, common_1.Get)('announcements'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Post)('announcements'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Put)('announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updateAnnouncement", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Post)('announcements/:id/toggle'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "toggleAnnouncement", null);
__decorate([
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)('type')),
    __param(1, (0, common_1.Body)('channel')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "saveTemplate", null);
__decorate([
    (0, common_1.Get)('broadcasts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getBroadcasts", null);
__decorate([
    (0, common_1.Post)('broadcasts'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createBroadcast", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, permissions_decorator_1.Permissions)('manage_content'),
    (0, common_1.Controller)('admin/content'),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map