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
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("./security.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../auth/decorators/permissions.decorator");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let SecurityController = class SecurityController {
    securityService;
    constructor(securityService) {
        this.securityService = securityService;
    }
    async getFraudDetections(riskLevel) {
        return this.securityService.getFraudDetections(riskLevel);
    }
    async resolveFraud(id) {
        return this.securityService.resolveFraud(id, 'SYSTEM_ADMIN');
    }
    async getBlacklist() {
        return this.securityService.getBlacklistedIps();
    }
    async addBlacklist(data) {
        return this.securityService.blacklistIp(data.ipAddress, data.reason, 'SYSTEM_ADMIN');
    }
    async removeBlacklist(id) {
        return this.securityService.removeBlacklist(id);
    }
    async getLoginAttempts(limit) {
        return this.securityService.getLoginAttempts(limit ? parseInt(limit) : 50);
    }
    async getAuditLogs(startDate, action) {
        return this.securityService.getAuditLogs(startDate, action);
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)('fraud'),
    __param(0, (0, common_1.Query)('riskLevel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getFraudDetections", null);
__decorate([
    (0, common_1.Post)('fraud/:id/resolve'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "resolveFraud", null);
__decorate([
    (0, common_1.Get)('blacklist'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getBlacklist", null);
__decorate([
    (0, common_1.Post)('blacklist'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "addBlacklist", null);
__decorate([
    (0, common_1.Delete)('blacklist/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "removeBlacklist", null);
__decorate([
    (0, common_1.Get)('login-attempts'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getLoginAttempts", null);
__decorate([
    (0, common_1.Get)('audit'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getAuditLogs", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, permissions_decorator_1.Permissions)('manage_security'),
    (0, common_1.Controller)('admin/security'),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map