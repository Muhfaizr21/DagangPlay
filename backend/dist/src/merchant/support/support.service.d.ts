import { PrismaService } from '../../prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
export declare class SupportService {
    private prisma;
    constructor(prisma: PrismaService);
    getTickets(merchantId: string, filters?: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
        };
    } & {
        id: string;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        userId: string;
        category: import("@prisma/client").$Enums.TicketCategory;
        orderId: string | null;
        resolvedAt: Date | null;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        assignedToId: string | null;
        closedAt: Date | null;
    })[]>;
    getTicketDetails(merchantId: string, ticketId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string | null;
        };
        replies: ({
            user: {
                id: string;
                name: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            message: string;
            attachments: import("@prisma/client/runtime/client").JsonValue | null;
            isFromStaff: boolean;
            ticketId: string;
        })[];
    } & {
        id: string;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        userId: string;
        category: import("@prisma/client").$Enums.TicketCategory;
        orderId: string | null;
        resolvedAt: Date | null;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        assignedToId: string | null;
        closedAt: Date | null;
    }>;
    replyTicket(merchantId: string, ticketId: string, userId: string, message: string, attachments?: any[]): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        isFromStaff: boolean;
        ticketId: string;
    }>;
    updateTicket(merchantId: string, ticketId: string, data: {
        status?: TicketStatus;
        priority?: TicketPriority;
        assignedToId?: string;
    }): Promise<{
        id: string;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        userId: string;
        category: import("@prisma/client").$Enums.TicketCategory;
        orderId: string | null;
        resolvedAt: Date | null;
        subject: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
        assignedToId: string | null;
        closedAt: Date | null;
    }>;
}
