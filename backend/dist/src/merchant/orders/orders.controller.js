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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
let OrdersController = class OrdersController {
    ordersService;
    prisma;
    constructor(ordersService, prisma) {
        this.ordersService = ordersService;
        this.prisma = prisma;
    }
    async createDirectOrder(req, body) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.ordersService.createDirectOrder(merchant.id, req.user.id, body);
    }
    async getOrders(req, filters) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.ordersService.getOrders(merchant.id, filters);
    }
    async getOrderDetails(req, orderId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.ordersService.getOrderDetails(merchant.id, orderId);
    }
    async retryOrder(req, orderId) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.ordersService.retryOrder(merchant.id, orderId);
    }
    async refundOrder(req, orderId, reason) {
        const merchant = await this.prisma.merchant.findUnique({ where: { ownerId: req.user.id } });
        if (!merchant)
            throw new Error('Merchant not found');
        return this.ordersService.refundOrder(merchant.id, orderId, reason);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)('create-direct'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createDirectOrder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderDetails", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "retryOrder", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "refundOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('merchant/orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService, prisma_service_1.PrismaService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map