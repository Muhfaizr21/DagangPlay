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
exports.DigiflazzController = void 0;
const common_1 = require("@nestjs/common");
const digiflazz_service_1 = require("./digiflazz.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const permissions_decorator_1 = require("../../auth/decorators/permissions.decorator");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let DigiflazzController = class DigiflazzController {
    digiflazzService;
    constructor(digiflazzService) {
        this.digiflazzService = digiflazzService;
    }
    async getProductsList() {
        return this.digiflazzService.getDigiflazzProducts();
    }
    async syncProduct(dto) {
        return this.digiflazzService.syncProduct(dto);
    }
    async bulkSyncProducts(payload) {
        return this.digiflazzService.bulkSyncProducts(payload);
    }
    async bulkMarginAdjust(body) {
        return this.digiflazzService.bulkAdjustMargins(body.amount, body.type);
    }
    async checkBalance() {
        return this.digiflazzService.checkBalance();
    }
};
exports.DigiflazzController = DigiflazzController;
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigiflazzController.prototype, "getProductsList", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DigiflazzController.prototype, "syncProduct", null);
__decorate([
    (0, common_1.Post)('bulk-sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], DigiflazzController.prototype, "bulkSyncProducts", null);
__decorate([
    (0, common_1.Post)('margin-adjust'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DigiflazzController.prototype, "bulkMarginAdjust", null);
__decorate([
    (0, common_1.Get)('balance'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigiflazzController.prototype, "checkBalance", null);
exports.DigiflazzController = DigiflazzController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, permissions_decorator_1.Permissions)('manage_suppliers'),
    (0, common_1.Controller)('admin/digiflazz'),
    __metadata("design:paramtypes", [digiflazz_service_1.DigiflazzService])
], DigiflazzController);
//# sourceMappingURL=digiflazz.controller.js.map