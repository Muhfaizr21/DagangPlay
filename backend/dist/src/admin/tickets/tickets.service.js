"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let TicketsService = class TicketsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTickets(filter = {}) {
        let where = {};
        if (filter.status)
            where.status = filter.status;
        if (filter.category)
            where.category = filter.category;
        if (filter.priority)
            where.priority = filter.priority;
        if (filter.merchantId)
            where.merchantId = filter.merchantId;
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
    async getTicketDetails(id) {
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
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async updateTicket(id, updateData) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: updateData
        });
    }
    async replyTicket(ticketId, userId, message, attachmentUrl) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
        if (ticket && ticket.status === 'OPEN') {
            await this.prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'IN_PROGRESS' } });
        }
        return this.prisma.supportTicketReply.create({
            data: {
                ticketId,
                userId,
                message,
                attachments: attachmentUrl ? [attachmentUrl] : []
            }
        });
    }
    async getStats() {
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
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map