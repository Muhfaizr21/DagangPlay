import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';

@Injectable()
export class SettingsService {
    constructor(
        private prisma: PrismaService,
        private subscriptionsService: SubscriptionsService
    ) { }

    async getSettings(merchantId: string) {
        return this.prisma.merchant.findUnique({
            where: { id: merchantId }
        });
    }

    async updateProfile(merchantId: string, data: any) {
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: {
                name: data.name,
                tagline: data.tagline,
                description: data.description,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                contactWhatsapp: data.contactWhatsapp,
                address: data.address,
                logo: data.logo,
                bannerImage: data.bannerImage
            }
        });
    }

    async updateDomain(merchantId: string, domain: string) {
        // Enforce SaaS Limit
        await this.subscriptionsService.checkFeatureLimit(merchantId, 'customDomain');
        // Here we could add logic to verify if the domain is already in use by someone else 
        // outside this merchant
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: { domain }
        });
    }

    async getPaymentChannels(merchantId: string) {
        return this.prisma.paymentChannel.findMany({
            where: { merchantId }
        });
    }

    async togglePaymentChannel(merchantId: string, channelId: string, isActive: boolean) {
        const channel = await this.prisma.paymentChannel.findFirst({ where: { id: channelId, merchantId } });
        if (!channel) throw new NotFoundException('Channel not found');
        return this.prisma.paymentChannel.update({
            where: { id: channelId },
            data: { isActive }
        });
    }

    async getWebhooks(merchantId: string) {
        return this.prisma.webhookEndpoint.findMany({
            where: { merchantId }
        });
    }

    async updateWebhook(merchantId: string, data: any) {
        // Simple create or update logic for one webhook endpoint for now
        const existing = await this.prisma.webhookEndpoint.findFirst({ where: { merchantId } });
        if (existing) {
            return this.prisma.webhookEndpoint.update({
                where: { id: existing.id },
                data: {
                    url: data.url,
                    secret: data.secret,
                    isActive: data.isActive,
                    events: data.events || []
                }
            });
        } else {
            return this.prisma.webhookEndpoint.create({
                data: {
                    merchantId,
                    url: data.url,
                    secret: data.secret || 'secret_' + Math.random().toString(36).substring(7),
                    isActive: data.isActive,
                    events: data.events || []
                }
            });
        }
    }
}
