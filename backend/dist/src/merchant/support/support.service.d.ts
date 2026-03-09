import { PrismaService } from '../../prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
export declare class SupportService {
    private prisma;
    constructor(prisma: PrismaService);
    getTickets(merchantId: string, filters?: any): Promise<({
        user: {
            id: string;
            email: string | null;
            name: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: import("@prisma/client").$Enums.TicketCategory;
        userId: string;
        orderId: string | null;
        subject: string;
        resolvedAt: Date | null;
        priority: import("@prisma/client").$Enums.TicketPriority;
        assignedToId: string | null;
        closedAt: Date | null;
    })[]>;
    getTicketDetails(merchantId: string, ticketId: string): Promise<{
        user: {
            id: string;
            email: string | null;
            name: string;
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
        status: import("@prisma/client").$Enums.TicketStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: import("@prisma/client").$Enums.TicketCategory;
        userId: string;
        orderId: string | null;
        subject: string;
        resolvedAt: Date | null;
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
        status: import("@prisma/client").$Enums.TicketStatus;
        merchantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: import("@prisma/client").$Enums.TicketCategory;
        userId: string;
        orderId: string | null;
        subject: string;
        resolvedAt: Date | null;
        priority: import("@prisma/client").$Enums.TicketPriority;
        assignedToId: string | null;
        closedAt: Date | null;
    }>;
}
