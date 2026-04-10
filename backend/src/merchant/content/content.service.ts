import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async getBanners(merchantId: string) {
    return this.prisma.banner.findMany({
      where: { merchantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createBanner(merchantId: string, data: any) {
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
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async toggleBanner(merchantId: string, id: string, isActive: boolean) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, merchantId },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    return this.prisma.banner.update({ where: { id }, data: { isActive } });
  }

  async updateBanner(merchantId: string, id: string, data: any) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, merchantId },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    return this.prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        image: data.imageUrl,
        linkUrl: data.linkUrl,
        position: data.location || 'HERO',
        sortOrder: data.sequence || 0,
      },
    });
  }

  async deleteBanner(merchantId: string, id: string) {
    const banner = await this.prisma.banner.findFirst({
      where: { id, merchantId },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    return this.prisma.banner.delete({ where: { id } });
  }

  async getAnnouncements(merchantId: string) {
    return this.prisma.announcement.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(merchantId: string, data: any) {
    return this.prisma.announcement.create({
      data: {
        merchantId,
        title: data.title,
        content: data.content,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async toggleAnnouncement(merchantId: string, id: string, isActive: boolean) {
    const ann = await this.prisma.announcement.findFirst({
      where: { id, merchantId },
    });
    if (!ann) throw new NotFoundException('Announcement not found');
    return this.prisma.announcement.update({
      where: { id },
      data: { isActive },
    });
  }

  async updateAnnouncement(merchantId: string, id: string, data: any) {
    const ann = await this.prisma.announcement.findFirst({
      where: { id, merchantId },
    });
    if (!ann) throw new NotFoundException('Announcement not found');
    return this.prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
      },
    });
  }

  async deleteAnnouncement(merchantId: string, id: string) {
    const ann = await this.prisma.announcement.findFirst({
      where: { id, merchantId },
    });
    if (!ann) throw new NotFoundException('Announcement not found');
    return this.prisma.announcement.delete({ where: { id } });
  }

  // In a real app we would have s3 image uploading, for now we just save the image URLs directly
  async updateStoreDesign(merchantId: string, data: any) {
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        logo: data.logo,
        favicon: data.favicon,
        bannerImage: data.bannerImage,
        // Assumes settings is JSON where we can store primaryColor, secondaryColor, etc.
      },
    });
  }

  // also update settings JSON manually for colors
  async updateThemeSettings(merchantId: string, data: any) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    let settings = merchant?.settings ? (merchant.settings as any) : {};
    settings = { ...settings, theme: { ...settings.theme, ...data } };

    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: { settings },
    });
  }

  // Popup Promo
  async getPopupPromos(merchantId: string) {
    return this.prisma.popupPromo.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPopupPromo(merchantId: string, data: any) {
    return this.prisma.popupPromo.create({
      data: {
        merchantId,
        title: data.title,
        content: data.content,
        image: data.imageUrl,
        linkUrl: data.linkUrl,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async togglePopupPromo(merchantId: string, id: string, isActive: boolean) {
    const promo = await this.prisma.popupPromo.findFirst({
      where: { id, merchantId },
    });
    if (!promo) throw new NotFoundException('Popup Promo not found');
    return this.prisma.popupPromo.update({ where: { id }, data: { isActive } });
  }

  async updatePopupPromo(merchantId: string, id: string, data: any) {
    const promo = await this.prisma.popupPromo.findFirst({
      where: { id, merchantId },
    });
    if (!promo) throw new NotFoundException('Popup Promo not found');
    return this.prisma.popupPromo.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        image: data.imageUrl,
        linkUrl: data.linkUrl,
      },
    });
  }

  async deletePopupPromo(merchantId: string, id: string) {
    const promo = await this.prisma.popupPromo.findFirst({
      where: { id, merchantId },
    });
    if (!promo) throw new NotFoundException('Popup Promo not found');
    return this.prisma.popupPromo.delete({ where: { id } });
  }
}
