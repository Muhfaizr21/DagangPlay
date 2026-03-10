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
exports.WithdrawalsController = void 0;
const common_1 = require("@nestjs/common");
const withdrawals_service_1 = require("./withdrawals.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let WithdrawalsController = class WithdrawalsController {
    withdrawalsService;
    constructor(withdrawalsService) {
        this.withdrawalsService = withdrawalsService;
    }
    async requestWithdrawal(req, dto) {
        return this.withdrawalsService.requestWithdrawal(req.user.id, {
            amount: Number(dto.amount),
            bankName: dto.bankName,
            accountNumber: dto.accountNumber,
            accountName: dto.accountName
        });
    }
    async getHistory(req) {
        return this.withdrawalsService.getMerchantWithdrawals(req.user.id);
    }
    async approve(id, req, body) {
        return this.withdrawalsService.approveWithdrawal(id, req.user.id, body.receiptImage);
    }
    async reject(id, req, body) {
        return this.withdrawalsService.rejectWithdrawal(id, req.user.id, body.reason);
    }
};
exports.WithdrawalsController = WithdrawalsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "requestWithdrawal", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "getHistory", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "approve", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalsController.prototype, "reject", null);
exports.WithdrawalsController = WithdrawalsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('merchant/withdrawals'),
    __metadata("design:paramtypes", [withdrawals_service_1.WithdrawalsService])
], WithdrawalsController);
//# sourceMappingURL=withdrawals.controller.js.map