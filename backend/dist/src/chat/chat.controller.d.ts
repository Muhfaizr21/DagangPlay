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
            chatRoomId: string;
            senderId: string;
            message: string;
            isRead: boolean;
            isAdmin: boolean;
        }[];
    } & {
        id: string;
        merchantId: string;
        lastMessage: string | null;
        updatedAt: Date;
        createdAt: Date;
    }>;
    sendMessageFromMerchant(req: any, body: {
        message: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        chatRoomId: string;
        senderId: string;
        message: string;
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
        merchantId: string;
        lastMessage: string | null;
        updatedAt: Date;
        createdAt: Date;
    })[]>;
    getRoomMessages(id: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            chatRoomId: string;
            senderId: string;
            message: string;
            isRead: boolean;
            isAdmin: boolean;
        }[];
        merchant: {
            name: string;
        };
    } & {
        id: string;
        merchantId: string;
        lastMessage: string | null;
        updatedAt: Date;
        createdAt: Date;
    }>;
    sendMessageFromAdmin(req: any, id: string, body: {
        message: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        chatRoomId: string;
        senderId: string;
        message: string;
        isRead: boolean;
        isAdmin: boolean;
    }>;
}
