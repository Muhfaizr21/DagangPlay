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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const subscriptions_service_1 = require("../../admin/subscriptions/subscriptions.service");
let SettingsService = class SettingsService {
    prisma;
    subscriptionsService;
    constructor(prisma, subscriptionsService) {
        this.prisma = prisma;
        this.subscriptionsService = subscriptionsService;
    }
    async getSettings(merchantId) {
        return this.prisma.merchant.findUnique({
            where: { id: merchantId }
        });
    }
    async updateProfile(merchantId, data) {
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: {
                name: data.name,
                tagline: data.tagline,
                description: data.description,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                contactWhatsapp: data.contactWhatsapp,
                address: data.address
            }
        });
    }
    async updateDomain(merchantId, domain) {
        await this.subscriptionsService.checkFeatureLimit(merchantId, 'customDomain');
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: { domain }
        });
    }
    async getPaymentChannels(merchantId) {
        return this.prisma.paymentChannel.findMany({
            where: { merchantId }
        });
    }
    async togglePaymentChannel(merchantId, channelId, isActive) {
        const channel = await this.prisma.paymentChannel.findFirst({ where: { id: channelId, merchantId } });
        if (!channel)
            throw new common_1.NotFoundException('Channel not found');
        return this.prisma.paymentChannel.update({
            where: { id: channelId },
            data: { isActive }
        });
    }
    async getWebhooks(merchantId) {
        return this.prisma.webhookEndpoint.findMany({
            where: { merchantId }
        });
    }
    async updateWebhook(merchantId, data) {
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
        }
        else {
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscriptions_service_1.SubscriptionsService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map