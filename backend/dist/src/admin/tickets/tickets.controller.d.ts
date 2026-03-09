import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    getTickets(status?: string, category?: string, priority?: string, merchantId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        merchant: {
            name: string;
        };
        assignedTo: {
            name: string;
        } | null;
    } & {
        category: import("@prisma/client").$Enums.TicketCategory;
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        merchantId: string;
        userId: string;
        orderId: string | null;
        subject: string;
        resolvedAt: Date | null;
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
        user: {
            name: string;
            email: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        merchant: {
            name: string;
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
        category: import("@prisma/client").$Enums.TicketCategory;
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        merchantId: string;
        userId: string;
        orderId: string | null;
        subject: string;
        resolvedAt: Date | null;
        priority: import("@prisma/client").$Enums.TicketPriority;
        assignedToId: string | null;
        closedAt: Date | null;
    }>;
    updateTicket(id: string, body: {
        status?: string;
        priority?: string;
        assignedToId?: string;
    }): Promise<{
        category: import("@prisma/client").$Enums.TicketCategory;
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.TicketStatus;
        merchantId: string;
        userId: string;
        orderId: string | null;
        subject: string;
        resolvedAt: Date | null;
        priority: import("@prisma/client").$Enums.TicketPriority;
        assignedToId: string | null;
        closedAt: Date | null;
    }>;
    replyTicket(id: string, body: {
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
