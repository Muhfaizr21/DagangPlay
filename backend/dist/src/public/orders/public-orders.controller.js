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
exports.PublicOrdersController = void 0;
const common_1 = require("@nestjs/common");
const public_orders_service_1 = require("./public-orders.service");
const tripay_service_1 = require("../../tripay/tripay.service");
let PublicOrdersController = class PublicOrdersController {
    publicOrdersService;
    tripayService;
    constructor(publicOrdersService, tripayService) {
        this.publicOrdersService = publicOrdersService;
        this.tripayService = tripayService;
    }
    async getPaymentChannels() {
        return this.tripayService.getPaymentChannels();
    }
    async getConfig(req) {
        const host = req.headers.host || req.headers.origin;
        return this.publicOrdersService.getStoreConfig(host);
    }
    async checkout(body, req) {
        const host = req.headers.host;
        const origin = req.headers.origin;
        return this.publicOrdersService.createCheckout(body, host, origin);
    }
    async getOrder(orderNumber) {
        return this.publicOrdersService.getOrderDetails(orderNumber);
    }
};
exports.PublicOrdersController = PublicOrdersController;
__decorate([
    (0, common_1.Get)('payment-channels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "getPaymentChannels", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "checkout", null);
__decorate([
    (0, common_1.Get)(':orderNumber'),
    __param(0, (0, common_1.Param)('orderNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicOrdersController.prototype, "getOrder", null);
exports.PublicOrdersController = PublicOrdersController = __decorate([
    (0, common_1.Controller)('public/orders'),
    __metadata("design:paramtypes", [public_orders_service_1.PublicOrdersService,
        tripay_service_1.TripayService])
], PublicOrdersController);
//# sourceMappingURL=public-orders.controller.js.map