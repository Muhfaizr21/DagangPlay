import { PrismaService } from '../prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getMerchantChat(merchantId: string): Promise<{
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
    sendMessageFromMerchant(merchantId: string, userId: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        chatRoomId: string;
        senderId: string;
        isRead: boolean;
        isAdmin: boolean;
    }>;
    getAllRooms(): Promise<({
        _count: {
            messages: number;
        };
        merchant: {
            name: string;
            logo: string | null;
            plan: import("@prisma/client").$Enums.MerchantPlan;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        lastMessage: string | null;
    })[]>;
    getRoomMessages(roomId: string): Promise<{
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
    sendMessageFromAdmin(roomId: string, adminId: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        chatRoomId: string;
        senderId: string;
        isRead: boolean;
        isAdmin: boolean;
    }>;
}
