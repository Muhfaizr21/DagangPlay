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
const client_1 = require("@prisma/client");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllSettings() {
        const settings = await this.prisma.systemSetting.findMany();
        const configMap = {};
        for (const s of settings) {
            configMap[s.key] = s.value;
        }
        return configMap;
    }
    async updateSettings(settingsData) {
        const updates = Object.keys(settingsData).map(key => {
            return this.prisma.systemSetting.upsert({
                where: { key },
                update: { value: settingsData[key] },
                create: {
                    key,
                    value: settingsData[key],
                    type: 'STRING'
                }
            });
        });
        await this.prisma.$transaction(updates);
        return { success: true };
    }
    async getAdminStaff() {
        return this.prisma.user.findMany({
            where: { role: client_1.Role.ADMIN_STAFF },
            select: {
                id: true,
                name: true,
                email: true,
                adminPermissions: true,
                createdAt: true
            }
        });
    }
    async createAdminStaff(data) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password || 'defaultPassword123',
                role: client_1.Role.ADMIN_STAFF,
                adminPermissions: data.permissions || [],
                status: 'ACTIVE',
                isVerified: true,
                referralCode: `ADM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            }
        });
    }
    async updateAdminStaff(id, data) {
        const updatePayload = {};
        if (data.name)
            updatePayload.name = data.name;
        if (data.status)
            updatePayload.status = data.status;
        if (data.permissions)
            updatePayload.adminPermissions = data.permissions;
        return this.prisma.user.update({
            where: { id },
            data: updatePayload
        });
    }
    async deleteAdminStaff(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    async getJobQueues(status) {
        return this.prisma.jobQueue.findMany({
            where: status ? { status: status } : {},
            orderBy: { scheduledAt: 'desc' },
            take: 100
        });
    }
    async retryFailedJob(id) {
        const job = await this.prisma.jobQueue.findUnique({ where: { id } });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        return this.prisma.jobQueue.update({
            where: { id },
            data: {
                status: 'PENDING',
                error: null,
                retryCount: 0
            }
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map