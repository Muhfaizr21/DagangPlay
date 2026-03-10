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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let SupportService = class SupportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTickets(merchantId, filters = {}) {
        const where = { merchantId };
        if (filters.status)
            where.status = filters.status;
        if (filters.priority)
            where.priority = filters.priority;
        if (filters.category)
            where.category = filters.category;
        return this.prisma.supportTicket.findMany({
            where,
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getTicketDetails(merchantId, ticketId) {
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
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return ticket;
    }
    async replyTicket(merchantId, ticketId, userId, message, attachments = []) {
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, merchantId } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
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
    async updateTicket(merchantId, ticketId, data) {
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id: ticketId, merchantId } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        const updateData = { ...data };
        if (data.status === 'RESOLVED') {
            updateData.resolvedAt = new Date();
        }
        else if (data.status === 'CLOSED') {
            updateData.closedAt = new Date();
        }
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: updateData
        });
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map