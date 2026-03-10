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
}
