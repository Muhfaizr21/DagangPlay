import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    getTickets(status?: string, category?: string, priority?: string, merchantId?: string): Promise<({
        merchant: {
            name: string;
        };
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        assignedTo: {
            name: string;
        } | null;
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
    getStats(): Promise<{
        total: number;
        open: number;
        resolved: number;
        avgResponseTimeHours: number;
        avgResolveTimeHours: number;
    }>;
    getTicketDetails(id: string): Promise<{
        merchant: {
            name: string;
        };
        user: {
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        assignedTo: {
            name: string;
        } | null;
        replies: ({
            user: {
                name: string;
                role: import("@prisma/client").$Enums.Role;
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
    updateTicket(id: string, body: {
        status?: string;
        priority?: string;
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
    replyTicket(id: string, user: any, body: {
        message: string;
        attachmentUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        isFromStaff: boolean;
        ticketId: string;
    }>;
}
