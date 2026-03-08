import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { BannerPosition, NotificationType, NotificationChannel, Role } from '@prisma/client';

@Injectable()
export class ContentService {
    constructor(private prisma: PrismaService) { }

    // =====================================
    // BANNERS
    // =====================================
    async getBanners(merchantId?: string) {
        return this.prisma.banner.findMany({
            where: merchantId ? { merchantId } : {},
            orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }]
        });
    }

    async createBanner(data: any) {
        return this.prisma.banner.create({
            data: {
                title: data.title,
                image: data.image,
                linkUrl: data.linkUrl || null,
                position: data.position as BannerPosition,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                merchantId: data.merchantId || null,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }

    async updateBanner(id: string, data: any) {
        const updateData: any = { ...data };
        if (data.position) updateData.position = data.position as BannerPosition;
        if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(data.sortOrder);
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);

        return this.prisma.banner.update({
            where: { id },
            data: updateData
        });
    }

    async turnOffBanner(id: string) {
        const existing = await this.prisma.banner.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Banner not found');
        return this.prisma.banner.update({
            where: { id },
            data: { isActive: !existing.isActive }
        });
    }

    async deleteBanner(id: string) {
        return this.prisma.banner.delete({ where: { id } });
    }

    // =====================================
    // ANNOUNCEMENTS & POPUPS
    // =====================================
    async getAnnouncements() {
        return this.prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async createAnnouncement(data: any) {
        return this.prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl || null,
                merchantId: data.merchantId || null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }

    async updateAnnouncement(id: string, data: any) {
        return this.prisma.announcement.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined
            }
        });
    }

    async toggleAnnouncement(id: string) {
        const existing = await this.prisma.announcement.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Announcement not found');
        return this.prisma.announcement.update({
            where: { id },
            data: { isActive: !existing.isActive }
        });
    }

    async deleteAnnouncement(id: string) {
        return this.prisma.announcement.delete({ where: { id } });
    }

    // =====================================
    // BROADCAST / EMAIL CAMPAIGNS
    // =====================================
    async getCampaigns() {
        return this.prisma.emailCampaign.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async createCampaign(data: any) {
        // Here we simulate the creation of an email blast task
        return this.prisma.emailCampaign.create({
            data: {
                name: data.name,
                subject: data.subject,
                body: data.body,
                targetRole: data.targetRole as Role || null,
                merchantId: data.merchantId || null,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                isActive: true
            }
        });
    }

    // =====================================
    // TEMPLATES
    // =====================================
    async getTemplates() {
        return this.prisma.notificationTemplate.findMany({
            orderBy: { type: 'asc' }
        });
    }

    async saveTemplate(type: NotificationType, channel: NotificationChannel, data: any) {
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
}
