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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async getAllTransactions(search, paymentStatus, fulfillmentStatus, merchantId, resellerId, productId, startDate, endDate) {
        return this.transactionsService.getAllTransactions({
            search, paymentStatus, fulfillmentStatus, merchantId, resellerId, productId, startDate, endDate
        });
    }
    async getTransactionDetail(id) {
        return this.transactionsService.getTransactionDetail(id);
    }
    async retryTransaction(id) {
        return this.transactionsService.retryTransaction(id, 'SuperAdmin');
    }
    async refundTransaction(id) {
        return this.transactionsService.refundTransaction(id, 'SuperAdmin');
    }
    async markAsFraud(id, body) {
        return this.transactionsService.markAsFraud(id, body.reason, 'SuperAdmin');
    }
    async overrideStatus(id, body) {
        return this.transactionsService.overrideStatus(id, body.fulfillmentStatus, body.paymentStatus, body.reason, 'SuperAdmin');
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('paymentStatus')),
    __param(2, (0, common_1.Query)('fulfillmentStatus')),
    __param(3, (0, common_1.Query)('merchantId')),
    __param(4, (0, common_1.Query)('resellerId')),
    __param(5, (0, common_1.Query)('productId')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactionDetail", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "retryTransaction", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "refundTransaction", null);
__decorate([
    (0, common_1.Post)(':id/mark-fraud'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "markAsFraud", null);
__decorate([
    (0, common_1.Patch)(':id/status/override'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "overrideStatus", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Controller)('admin/transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map