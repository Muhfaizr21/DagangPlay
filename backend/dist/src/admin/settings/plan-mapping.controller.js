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
exports.PlanMappingController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PlanMappingController = class PlanMappingController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMappings() {
        return this.prisma.planTierMapping.findMany();
    }
    async syncDefaultMappings() {
        const defaults = [
            { plan: 'FREE', tier: 'NORMAL' },
            { plan: 'PRO', tier: 'PRO' },
            { plan: 'LEGEND', tier: 'LEGEND' },
            { plan: 'SUPREME', tier: 'SUPREME' },
        ];
        for (const item of defaults) {
            await this.prisma.planTierMapping.upsert({
                where: { plan: item.plan },
                update: { tier: item.tier },
                create: { plan: item.plan, tier: item.tier, updatedBy: 'system' }
            });
        }
        return { success: true };
    }
    async updateMapping(dto) {
        return this.prisma.planTierMapping.upsert({
            where: { plan: dto.plan },
            update: { tier: dto.tier, updatedBy: 'admin' },
            create: { plan: dto.plan, tier: dto.tier, updatedBy: 'admin' }
        });
    }
};
exports.PlanMappingController = PlanMappingController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlanMappingController.prototype, "getMappings", null);
__decorate([
    (0, common_1.Post)('sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlanMappingController.prototype, "syncDefaultMappings", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanMappingController.prototype, "updateMapping", null);
exports.PlanMappingController = PlanMappingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Controller)('admin/plan-tier-mappings'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanMappingController);
//# sourceMappingURL=plan-mapping.controller.js.map