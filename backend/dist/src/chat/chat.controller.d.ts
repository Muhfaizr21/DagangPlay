import { ChatService } from './chat.service';
import { PrismaService } from '../prisma.service';
export declare class ChatController {
    private readonly chatService;
    private prisma;
    constructor(chatService: ChatService, prisma: PrismaService);
    getMerchantChat(req: any): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            message: string;
            chatRoomId: string;
            senderId: string;
            isRead: boolean;
            isAdmin: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        lastMessage: string | null;
    }>;
    sendMessageFromMerchant(req: any, body: {
        message: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        chatRoomId: string;
        senderId: string;
        isRead: boolean;
        isAdmin: boolean;
    }>;
    getAllRooms(): Promise<({
        merchant: {
            name: string;
            logo: string | null;
            plan: import("@prisma/client").$Enums.MerchantPlan;
        };
        _count: {
            messages: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        lastMessage: string | null;
    })[]>;
    getRoomMessages(id: string): Promise<{
        merchant: {
            name: string;
        };
        messages: {
            id: string;
            createdAt: Date;
            message: string;
            chatRoomId: string;
            senderId: string;
            isRead: boolean;
            isAdmin: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        lastMessage: string | null;
    }>;
    sendMessageFromAdmin(req: any, id: string, body: {
        message: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        chatRoomId: string;
        senderId: string;
        isRead: boolean;
        isAdmin: boolean;
    }>;
}
