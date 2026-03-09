import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    async getTickets(merchantId: string, filters: any = {}) {
        const where: any = { merchantId };

        if (filters.status) where.status = filters.status;
        if (filters.priority) where.priority = filters.priority;
        if (filters.category) where.category = filters.category;

        return this.prisma.supportTicket.findMany({
            where,
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getTicketDetails(merchantId: string, ticketId: string) {
        const ticket = await this.prisma.supportTicket.findFirst({
            where: { id: ticketId, merchantId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                replies: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!ticket) throw new NotFoundException('Ticket not found');
        return ticket;
    }

    async replyTicket(merchantId: string, ticketId: string, userId: string, message: string, attachments: any[] = []) {
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, merchantId } });
        if (!ticket) throw new NotFoundException('Ticket not found');

        // Staff replying
        return this.prisma.supportTicketReply.create({
            data: {
                ticketId,
                userId,
                message,
                attachments,
                isFromStaff: true
            }
        });
    }

    async updateTicket(merchantId: string, ticketId: string, data: { status?: TicketStatus, priority?: TicketPriority, assignedToId?: string }) {
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, merchantId } });
        if (!ticket) throw new NotFoundException('Ticket not found');

        const updateData: any = { ...data };

        if (data.status === 'RESOLVED') {
            updateData.resolvedAt = new Date();
        } else if (data.status === 'CLOSED') {
            updateData.closedAt = new Date();
        }

        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: updateData
        });
    }
}
