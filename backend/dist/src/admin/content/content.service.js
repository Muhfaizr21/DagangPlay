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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let ContentService = class ContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBanners(merchantId) {
        return this.prisma.banner.findMany({
            where: merchantId ? { merchantId } : { merchantId: null },
            orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }]
        });
    }
    async createBanner(data) {
        return this.prisma.banner.create({
            data: {
                title: data.title,
                image: data.image,
                linkUrl: data.linkUrl || null,
                position: data.position || 'HERO',
                sortOrder: data.sortOrder ? parseInt(data.sortOrder.toString()) : 0,
                startDate: (data.startDate && data.startDate !== '') ? new Date(data.startDate) : null,
                endDate: (data.endDate && data.endDate !== '') ? new Date(data.endDate) : null,
                merchantId: data.merchantId || null,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }
    async updateBanner(id, data) {
        const updateData = { ...data };
        if (data.position)
            updateData.position = data.position;
        if (data.sortOrder !== undefined)
            updateData.sortOrder = parseInt(data.sortOrder.toString());
        if (data.startDate && data.startDate !== '')
            updateData.startDate = new Date(data.startDate);
        if (data.endDate && data.endDate !== '')
            updateData.endDate = new Date(data.endDate);
        return this.prisma.banner.update({
            where: { id },
            data: updateData
        });
    }
    async turnOffBanner(id) {
        const existing = await this.prisma.banner.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Banner not found');
        return this.prisma.banner.update({
            where: { id },
            data: { isActive: !existing.isActive }
        });
    }
    async deleteBanner(id) {
        return this.prisma.banner.delete({ where: { id } });
    }
    async getAnnouncements(merchantId) {
        return this.prisma.announcement.findMany({
            where: merchantId ? { merchantId } : { merchantId: null },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createAnnouncement(data) {
        const isValidDate = (d) => d && !isNaN(new Date(d).getTime());
        return this.prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl || null,
                merchantId: data.merchantId || null,
                startDate: isValidDate(data.startDate) ? new Date(data.startDate) : null,
                endDate: isValidDate(data.endDate) ? new Date(data.endDate) : null,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }
    async updateAnnouncement(id, data) {
        const isValidDate = (d) => d && !isNaN(new Date(d).getTime());
        return this.prisma.announcement.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl,
                startDate: isValidDate(data.startDate) ? new Date(data.startDate) : undefined,
                endDate: isValidDate(data.endDate) ? new Date(data.endDate) : undefined
            }
        });
    }
    async toggleAnnouncement(id) {
        const existing = await this.prisma.announcement.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Announcement not found');
        return this.prisma.announcement.update({
            where: { id },
            data: { isActive: !existing.isActive }
        });
    }
    async deleteAnnouncement(id) {
        return this.prisma.announcement.delete({ where: { id } });
    }
    async getCampaigns(merchantId) {
        return this.prisma.emailCampaign.findMany({
            where: merchantId ? { merchantId } : { merchantId: null },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createCampaign(data) {
        const targetRole = (data.targetRole === 'ALL' || !data.targetRole) ? null : data.targetRole;
        return this.prisma.emailCampaign.create({
            data: {
                name: data.name,
                subject: data.subject,
                body: data.body,
                targetRole: targetRole,
                merchantId: data.merchantId || null,
                scheduledAt: (data.scheduledAt && data.scheduledAt !== '') ? new Date(data.scheduledAt) : null,
                isActive: true
            }
        });
    }
    async getTemplates(merchantId) {
        return this.prisma.notificationTemplate.findMany({
            where: merchantId ? { merchantId } : { merchantId: null },
            orderBy: { type: 'asc' }
        });
    }
    async saveTemplate(type, channel, data) {
        const exist = await this.prisma.notificationTemplate.findFirst({
            where: { merchantId: null, type, channel }
        });
        if (exist) {
            return this.prisma.notificationTemplate.update({
                where: { id: exist.id },
                data: {
                    subject: data.subject,
                    body: data.body,
                    isActive: data.isActive !== undefined ? data.isActive : exist.isActive
                }
            });
        }
        return this.prisma.notificationTemplate.create({
            data: {
                type,
                channel,
                subject: data.subject,
                body: data.body,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map