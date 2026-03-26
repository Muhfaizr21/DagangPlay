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
        return this.prisma.banner.findMany({ where: { merchantId }, orderBy: { sortOrder: 'asc' } });
    }
    async createBanner(merchantId, data) {
        return this.prisma.banner.create({
            data: {
                merchantId,
                title: data.title,
                image: data.imageUrl,
                linkUrl: data.linkUrl,
                position: data.location || 'HERO',
                sortOrder: data.sequence || 0,
                isActive: data.isActive !== undefined ? data.isActive : true,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null
            }
        });
    }
    async toggleBanner(merchantId, id, isActive) {
        const banner = await this.prisma.banner.findFirst({ where: { id, merchantId } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        return this.prisma.banner.update({ where: { id }, data: { isActive } });
    }
    async updateBanner(merchantId, id, data) {
        const banner = await this.prisma.banner.findFirst({ where: { id, merchantId } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        return this.prisma.banner.update({
            where: { id },
            data: {
                title: data.title,
                image: data.imageUrl,
                linkUrl: data.linkUrl,
                position: data.location || 'HERO',
                sortOrder: data.sequence || 0
            }
        });
    }
    async deleteBanner(merchantId, id) {
        const banner = await this.prisma.banner.findFirst({ where: { id, merchantId } });
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        return this.prisma.banner.delete({ where: { id } });
    }
    async getAnnouncements(merchantId) {
        return this.prisma.announcement.findMany({ where: { merchantId }, orderBy: { createdAt: 'desc' } });
    }
    async createAnnouncement(merchantId, data) {
        return this.prisma.announcement.create({
            data: {
                merchantId,
                title: data.title,
                content: data.content,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }
    async toggleAnnouncement(merchantId, id, isActive) {
        const ann = await this.prisma.announcement.findFirst({ where: { id, merchantId } });
        if (!ann)
            throw new common_1.NotFoundException('Announcement not found');
        return this.prisma.announcement.update({ where: { id }, data: { isActive } });
    }
    async updateAnnouncement(merchantId, id, data) {
        const ann = await this.prisma.announcement.findFirst({ where: { id, merchantId } });
        if (!ann)
            throw new common_1.NotFoundException('Announcement not found');
        return this.prisma.announcement.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content
            }
        });
    }
    async deleteAnnouncement(merchantId, id) {
        const ann = await this.prisma.announcement.findFirst({ where: { id, merchantId } });
        if (!ann)
            throw new common_1.NotFoundException('Announcement not found');
        return this.prisma.announcement.delete({ where: { id } });
    }
    async updateStoreDesign(merchantId, data) {
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: {
                logo: data.logo,
                favicon: data.favicon,
                bannerImage: data.bannerImage,
            }
        });
    }
    async updateThemeSettings(merchantId, data) {
        const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
        let settings = merchant?.settings ? merchant.settings : {};
        settings = { ...settings, theme: { ...settings.theme, ...data } };
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: { settings }
        });
    }
    async getPopupPromos(merchantId) {
        return this.prisma.popupPromo.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createPopupPromo(merchantId, data) {
        return this.prisma.popupPromo.create({
            data: {
                merchantId,
                title: data.title,
                content: data.content,
                image: data.imageUrl,
                linkUrl: data.linkUrl,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }
    async togglePopupPromo(merchantId, id, isActive) {
        const promo = await this.prisma.popupPromo.findFirst({ where: { id, merchantId } });
        if (!promo)
            throw new common_1.NotFoundException('Popup Promo not found');
        return this.prisma.popupPromo.update({ where: { id }, data: { isActive } });
    }
    async updatePopupPromo(merchantId, id, data) {
        const promo = await this.prisma.popupPromo.findFirst({ where: { id, merchantId } });
        if (!promo)
            throw new common_1.NotFoundException('Popup Promo not found');
        return this.prisma.popupPromo.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                image: data.imageUrl,
                linkUrl: data.linkUrl
            }
        });
    }
    async deletePopupPromo(merchantId, id) {
        const promo = await this.prisma.popupPromo.findFirst({ where: { id, merchantId } });
        if (!promo)
            throw new common_1.NotFoundException('Popup Promo not found');
        return this.prisma.popupPromo.delete({ where: { id } });
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map