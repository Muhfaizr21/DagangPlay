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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
let ProductsController = class ProductsController {
    productsService;
    prisma;
    constructor(productsService, prisma) {
        this.productsService = productsService;
        this.prisma = prisma;
    }
    async getCategories() {
        return this.prisma.category.findMany({
            where: { isActive: true, products: { some: { status: 'ACTIVE' } } },
            select: { id: true, name: true, slug: true, image: true },
            orderBy: { name: 'asc' }
        });
    }
    async getProducts(req, search, categoryId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.productsService.getProducts(merchant.id, search, categoryId);
    }
    async updateSkuPrice(req, skuId, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.productsService.updateSkuPriceOverrides(merchant.id, req.user.id, skuId, body.sellingPrice, body.isActive);
    }
    async bulkUpdatePricing(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.productsService.bulkUpdateMargin(merchant.id, req.user.id, body.markupPercentage, body.markupAmount || 0, body.categoryId);
    }
    async updateProductMetadata(req, productId, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id }, select: { id: true } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.productsService.updateProductOverride(merchant.id, productId, body);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Put)(':skuId/price'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('skuId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateSkuPrice", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "bulkUpdatePricing", null);
__decorate([
    (0, common_1.Put)(':productId/metadata'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProductMetadata", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('merchant/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService, prisma_service_1.PrismaService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map