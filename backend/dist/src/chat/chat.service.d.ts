import { PrismaService } from '../prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getMerchantChat(merchantId: string): Promise<{
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
    sendMessageFromMerchant(merchantId: string, userId: string, message: string): Promise<{
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
    getRoomMessages(roomId: string): Promise<{
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
    sendMessageFromAdmin(roomId: string, adminId: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        chatRoomId: string;
        senderId: string;
        message: string;
        isRead: boolean;
        isAdmin: boolean;
    }>;
}
