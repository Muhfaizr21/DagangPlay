import { PrismaService } from '../../prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    getTickets(filter?: any): Promise<({
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
    updateTicket(id: string, updateData: {
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
    replyTicket(ticketId: string, userId: string, message: string, attachmentUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        isFromStaff: boolean;
        ticketId: string;
    }>;
    getStats(): Promise<{
        total: number;
        open: number;
        resolved: number;
        avgResponseTimeHours: number;
        avgResolveTimeHours: number;
    }>;
}
