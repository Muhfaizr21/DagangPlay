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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
let ChatController = class ChatController {
    chatService;
    prisma;
    constructor(chatService, prisma) {
        this.chatService = chatService;
        this.prisma = prisma;
    }
    async getMerchantChat(req) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { ownerId: req.user.id }
        });
        if (!merchant)
            throw new Error('Merchant profile not found');
        return this.chatService.getMerchantChat(merchant.id);
    }
    async sendMessageFromMerchant(req, body) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { ownerId: req.user.id }
        });
        if (!merchant)
            throw new Error('Merchant profile not found');
        return this.chatService.sendMessageFromMerchant(merchant.id, req.user.id, body.message);
    }
    async getAllRooms() {
        return this.chatService.getAllRooms();
    }
    async getRoomMessages(id) {
        return this.chatService.getRoomMessages(id);
    }
    async sendMessageFromAdmin(req, id, body) {
        return this.chatService.sendMessageFromAdmin(id, req.user.id, body.message);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    (0, common_1.Get)('merchant'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMerchantChat", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.MERCHANT),
    (0, common_1.Post)('merchant/send'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessageFromMerchant", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Get)('admin/rooms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAllRooms", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Get)('admin/rooms/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomMessages", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN_STAFF),
    (0, common_1.Post)('admin/rooms/:id/send'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessageFromAdmin", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        prisma_service_1.PrismaService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map