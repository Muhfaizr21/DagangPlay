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
exports.MerchantOverridesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let MerchantOverridesController = class MerchantOverridesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllOverrides() {
        return this.prisma.merchantProductPrice.findMany({
            include: {
                merchant: { select: { name: true, slug: true } },
                productSku: { select: { name: true, basePrice: true } },
                user: { select: { name: true } }
            }
        });
    }
    async getOverridesByMerchant(merchantId) {
        return this.prisma.merchantProductPrice.findMany({
            where: { merchantId },
            include: { productSku: true }
        });
    }
    async createOverride(dto, req) {
        return this.prisma.merchantProductPrice.upsert({
            where: {
                merchantId_productSkuId: {
                    merchantId: dto.merchantId,
                    productSkuId: dto.productSkuId
                }
            },
            update: {
                customPrice: dto.customPrice,
                reason: dto.reason,
                expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
                isActive: true
            },
            create: {
                merchantId: dto.merchantId,
                productSkuId: dto.productSkuId,
                customPrice: dto.customPrice,
                reason: dto.reason,
                expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
                userId: req.user.id
            }
        });
    }
    async deleteOverride(id) {
        return this.prisma.merchantProductPrice.delete({ where: { id } });
    }
};
exports.MerchantOverridesController = MerchantOverridesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MerchantOverridesController.prototype, "getAllOverrides", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantId'),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantOverridesController.prototype, "getOverridesByMerchant", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MerchantOverridesController.prototype, "createOverride", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantOverridesController.prototype, "deleteOverride", null);
exports.MerchantOverridesController = MerchantOverridesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Controller)('admin/merchant-overrides'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MerchantOverridesController);
//# sourceMappingURL=overrides.controller.js.map