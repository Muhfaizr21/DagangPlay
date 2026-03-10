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
    async getCategories() {
        return this.productsService.getPublicCategories();
    }
    async getCategoryBySlug(slug) {
        return this.productsService.getPublicCategoryBySlug(slug);
    }
    async getContent() {
        return this.productsService.getPublicContent();
    }
    async getResellerPrices() {
        return this.productsService.getPublicResellerPrices();
    }
    async getFullCatalog() {
        return this.productsService.getPublicFullCatalog();
    }
};
exports.PublicProductsController = PublicProductsController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('categories/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getCategoryBySlug", null);
__decorate([
    (0, common_1.Get)('content'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getContent", null);
__decorate([
    (0, common_1.Get)('reseller-prices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getResellerPrices", null);
__decorate([
    (0, common_1.Get)('full-catalog'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicProductsController.prototype, "getFullCatalog", null);
exports.PublicProductsController = PublicProductsController = __decorate([
    (0, common_1.Controller)('public/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], PublicProductsController);
//# sourceMappingURL=public-products.controller.js.map