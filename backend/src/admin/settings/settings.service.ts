import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    // ======================================
    // SYSTEM SETTINGS
    // ======================================
    async getAllSettings() {
        const settings = await this.prisma.systemSetting.findMany();
        const configMap: Record<string, string> = {};
        for (const s of settings) {
            configMap[s.key] = s.value;
        }
        return configMap;
    }

    async updateSettings(settingsData: Record<string, string>) {
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

    // ======================================
    // ADMIN STAFF MANAGEMENT
    // ======================================
    async getAdminStaff() {
        return this.prisma.user.findMany({
            where: { role: Role.ADMIN_STAFF },
            select: {
                id: true,
                name: true,
                email: true,
                adminPermissions: true,
                createdAt: true
            }
        });
    }

    async createAdminStaff(data: any) {
        // Hash password with bcrypt before saving to DB
        const plainPassword = data.password || 'StaffPass123!';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: Role.ADMIN_STAFF,
                adminPermissions: data.permissions || [],
                status: 'ACTIVE',
                isVerified: true,
                referralCode: `ADM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            }
        });
    }

    async updateAdminStaff(id: string, data: any) {
        const updatePayload: any = {};
        if (data.name) updatePayload.name = data.name;
        if (data.status) updatePayload.status = data.status;
        if (data.permissions) updatePayload.adminPermissions = data.permissions;

        return this.prisma.user.update({
            where: { id },
            data: updatePayload
        });
    }

    async deleteAdminStaff(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }

    // ======================================
    // JOB QUEUE MONITORING
    // ======================================
    async getJobQueues(status?: string) {
        return this.prisma.jobQueue.findMany({
            where: status ? { status: status as any } : {},
            orderBy: { scheduledAt: 'desc' },
            take: 100
        });
    }

    async retryFailedJob(id: string) {
        const job = await this.prisma.jobQueue.findUnique({ where: { id } });
        if (!job) throw new NotFoundException('Job not found');

        return this.prisma.jobQueue.update({
            where: { id },
            data: {
                status: 'PENDING',
                error: null,
                retryCount: 0 // Reset attempt counter
            }
        });
    }
}
