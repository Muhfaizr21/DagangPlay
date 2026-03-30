import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    async getTickets(filter: any = {}) {
        let where: any = {};
        if (filter.status) where.status = filter.status;
        if (filter.category) where.category = filter.category;
        if (filter.priority) where.priority = filter.priority;
        if (filter.merchantId) where.merchantId = filter.merchantId;

        return this.prisma.supportTicket.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                merchant: { select: { name: true } },
                assignedTo: { select: { name: true } }
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
        });
    }

    async getTicketDetails(id: string) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, role: true } },
                merchant: { select: { name: true } },
                assignedTo: { select: { name: true } },
                replies: {
                    include: { user: { select: { name: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async updateTicket(id: string, updateData: { status?: TicketStatus, priority?: TicketPriority, assignedToId?: string }) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: updateData
        });
    }

    async replyTicket(ticketId: string, userId: string, message: string, attachmentUrl?: string, isFromStaff: boolean = false) {
        // Auto mark as IN_PROGRESS if OPEN
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
        if (ticket && ticket.status === 'OPEN') {
            await this.prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'IN_PROGRESS' } });
        }

        return this.prisma.supportTicketReply.create({
            data: {
                ticketId,
                userId, // Who replied (could be admin)
                message,
                attachments: attachmentUrl ? [attachmentUrl] : [],
                isFromStaff
            }
        });
    }

    async getStats() {
        // Mocking some complex agg logic
        const total = await this.prisma.supportTicket.count();
        const open = await this.prisma.supportTicket.count({ where: { status: 'OPEN' } });
        const resolved = await this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } });

        return {
            total,
            open,
            resolved,
            avgResponseTimeHours: 1.5,
            avgResolveTimeHours: 24,
        };
    }
}
