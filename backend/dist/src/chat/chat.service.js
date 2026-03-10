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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMerchantChat(merchantId) {
        let room = await this.prisma.chatRoom.findUnique({
            where: { merchantId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!room) {
            room = await this.prisma.chatRoom.create({
                data: { merchantId },
                include: { messages: true },
            });
        }
        else {
            await this.prisma.chatMessage.updateMany({
                where: { chatRoomId: room.id, isAdmin: true, isRead: false },
                data: { isRead: true },
            });
        }
        return room;
    }
    async sendMessageFromMerchant(merchantId, userId, message) {
        const room = await this.getMerchantChat(merchantId);
        const msg = await this.prisma.chatMessage.create({
            data: {
                chatRoomId: room.id,
                senderId: userId,
                message,
                isAdmin: false,
            },
        });
        await this.prisma.chatRoom.update({
            where: { id: room.id },
            data: { lastMessage: message, updatedAt: new Date() },
        });
        return msg;
    }
    async getAllRooms() {
        return this.prisma.chatRoom.findMany({
            include: {
                merchant: {
                    select: { name: true, logo: true, plan: true }
                },
                _count: {
                    select: {
                        messages: {
                            where: { isRead: false, isAdmin: false }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getRoomMessages(roomId) {
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
                merchant: {
                    select: { name: true }
                }
            },
        });
        if (!room)
            throw new common_1.NotFoundException('Chat room tidak ditemukan');
        await this.prisma.chatMessage.updateMany({
            where: { chatRoomId: roomId, isAdmin: false, isRead: false },
            data: { isRead: true },
        });
        return room;
    }
    async sendMessageFromAdmin(roomId, adminId, message) {
        const msg = await this.prisma.chatMessage.create({
            data: {
                chatRoomId: roomId,
                senderId: adminId,
                message,
                isAdmin: true,
            },
        });
        await this.prisma.chatRoom.update({
            where: { id: roomId },
            data: { lastMessage: message, updatedAt: new Date() },
        });
        return msg;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map