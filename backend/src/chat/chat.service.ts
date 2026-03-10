import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    // --- Merchant side ---
    async getMerchantChat(merchantId: string) {
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
        } else {
            await this.prisma.chatMessage.updateMany({
                where: { chatRoomId: room.id, isAdmin: true, isRead: false },
                data: { isRead: true },
            });
        }

        return room;
    }

    async sendMessageFromMerchant(merchantId: string, userId: string, message: string) {
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

    // --- Admin side ---
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

    async getRoomMessages(roomId: string) {
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

        if (!room) throw new NotFoundException('Chat room tidak ditemukan');

        // Mark as read when admin opens
        await this.prisma.chatMessage.updateMany({
            where: { chatRoomId: roomId, isAdmin: false, isRead: false },
            data: { isRead: true },
        });

        return room;
    }

    async sendMessageFromAdmin(roomId: string, adminId: string, message: string) {
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
}
