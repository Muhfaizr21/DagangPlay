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
exports.PublicProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
let PublicProductsController = class PublicProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getCategories(merchantSlug) {
        return this.productsService.getPublicCategories(merchantSlug);
    }
    async getCategoryBySlug(slug, merchantSlug) {
        return this.productsService.getPublicCategoryBySlug(slug, merchantSlug);
    }
    async getContent(merchantSlug) {
        return this.productsService.getPublicContent(merchantSlug);
    }
    async getResellerPrices(merchantSlug) {
        return this.productsService.getPublicResellerPrices(merchantSlug);
    }
    async getFullCatalog(merchantSlug) {
        return this.productsService.getPublicFullCatalog(merchantSlug);
    }
};
exports.PublicProductsController = PublicProductsController;
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Query)('merchant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('categories/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('merchant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getCategoryBySlug", null);
__decorate([
    (0, common_1.Get)('content'),
    __param(0, (0, common_1.Query)('merchant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getContent", null);
__decorate([
    (0, common_1.Get)('reseller-prices'),
    __param(0, (0, common_1.Query)('merchant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getResellerPrices", null);
__decorate([
    (0, common_1.Get)('full-catalog'),
    __param(0, (0, common_1.Query)('merchant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getFullCatalog", null);
exports.PublicProductsController = PublicProductsController = __decorate([
    (0, common_1.Controller)('public/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], PublicProductsController);
//# sourceMappingURL=public-products.controller.js.map