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
const staff_dto_1 = require("./dto/staff.dto");
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getAllSettings() {
        return this.settingsService.getAllSettings();
    }
    async updateSettings(data) {
        return this.settingsService.updateSettings(data);
    }
    async getAdminStaff() {
        return this.settingsService.getAdminStaff();
    }
    async createAdminStaff(data) {
        return this.settingsService.createAdminStaff(data);
    }
    async updateAdminStaff(id, data) {
        return this.settingsService.updateAdminStaff(id, data);
    }
    async deleteAdminStaff(id) {
        return this.settingsService.deleteAdminStaff(id);
    }
    async getJobQueues(status) {
        return this.settingsService.getJobQueues(status);
    }
    async retryFailedJob(id) {
        return this.settingsService.retryFailedJob(id);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('global'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAllSettings", null);
__decorate([
    (0, common_1.Put)('global'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('staff'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAdminStaff", null);
__decorate([
    (0, common_1.Post)('staff'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [staff_dto_1.CreateStaffDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "createAdminStaff", null);
__decorate([
    (0, common_1.Put)('staff/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, staff_dto_1.UpdateStaffDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateAdminStaff", null);
__decorate([
    (0, common_1.Delete)('staff/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "deleteAdminStaff", null);
__decorate([
    (0, common_1.Get)('jobs'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getJobQueues", null);
__decorate([
    (0, common_1.Post)('jobs/:id/retry'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "retryFailedJob", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Controller)('admin/settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map