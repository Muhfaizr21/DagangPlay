import { SupportService } from './support.service';
import { PrismaService } from '../../prisma.service';
export declare class SupportController {
    private readonly supportService;
    private prisma;
    constructor(supportService: SupportService, prisma: PrismaService);
    getTickets(req: any, filters: any): Promise<({
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
    createTicket(req: any, body: any): Promise<{
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
    getTicketDetails(req: any, id: string): Promise<{
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
    replyTicket(req: any, id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        attachments: import("@prisma/client/runtime/client").JsonValue | null;
        isFromStaff: boolean;
        ticketId: string;
    }>;
    updateTicket(req: any, id: string, body: any): Promise<{
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
