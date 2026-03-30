import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SubscriptionsService } from '../../admin/subscriptions/subscriptions.service';

@Injectable()
export class MembersService {
    constructor(
        private prisma: PrismaService,
        private subscriptionsService: SubscriptionsService
    ) {}

    async getAllUsers(merchantId: string, search?: string, roleFilter?: Role) {
        const whereClause: any = { merchantId };
        
        if (roleFilter) {
            whereClause.role = roleFilter;
        } else {
            whereClause.role = { in: [Role.CUSTOMER, Role.RESELLER] };
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                role: true,
                balance: true,
                createdAt: true,
                _count: {
                    select: { ordersAsCustomer: { where: { paymentStatus: 'PAID' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createManualUser(merchantId: string, data: { name: string, phone: string, balance?: number }) {
        const existing = await this.prisma.user.findFirst({
            where: { phone: data.phone, merchantId }
        });

        if (existing) throw new BadRequestException('Nomor WhatsApp sudah terdaftar sebagai member di toko Anda.');

        // 1. DYNAMIC SAAS LIMIT: maxMembers
        await this.subscriptionsService.checkFeatureLimit(merchantId, 'maxMembers');

        const hashedPassword = await bcrypt.hash('MEMBER_' + Math.random().toString(36).substring(7), 10);

        return this.prisma.user.create({
            data: {
                name: data.name,
                phone: data.phone,
                merchantId,
                password: hashedPassword,
                role: Role.CUSTOMER,
                referralCode: 'MEMBER_' + Math.random().toString(36).substring(7),
                isGuest: false
            }
        });
    }

    async updateUser(merchantId: string, userId: string, data: { name: string, phone: string }) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, merchantId } });
        if (!user) throw new NotFoundException('User tidak ditemukan.');

        // Check if new phone is already taken by someone else in the same merchant
        if (data.phone !== user.phone) {
            const existing = await this.prisma.user.findFirst({
                where: { phone: data.phone, merchantId, NOT: { id: userId } }
            });
            if (existing) throw new BadRequestException('Nomor WhatsApp baru sudah digunakan oleh member lain.');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone: data.phone
            }
        });
    }

    async toggleResellerStatus(merchantId: string, userId: string, targetRole: Role) {
        if (!([Role.CUSTOMER, Role.RESELLER] as string[]).includes(targetRole as string)) {
            throw new BadRequestException('Role target tidak valid.');
        }

        const user = await this.prisma.user.findFirst({
            where: { id: userId, merchantId }
        });

        if (!user) throw new NotFoundException('User tidak ditemukan di merchant ini.');

        return this.prisma.user.update({
            where: { id: userId },
            data: { role: targetRole }
        });
    }

    async getTopResellers(merchantId: string) {
        const topResellers = await this.prisma.user.findMany({
            where: { merchantId, role: Role.RESELLER },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { ordersAsCustomer: { where: { paymentStatus: 'PAID' } } }
                }
            },
            take: 50, // Fetch a larger pool to calculate actual top omset accurately
            orderBy: { ordersAsCustomer: { _count: 'desc' } }
        });

        const result = await Promise.all(topResellers.map(async (reseller) => {
            const omset = await this.prisma.order.aggregate({
                where: { userId: reseller.id, paymentStatus: 'PAID', merchantId },
                _sum: { totalPrice: true }
            });
            return {
                id: reseller.id,
                name: reseller.name,
                totalTrx: reseller._count.ordersAsCustomer,
                totalOmset: Number(omset._sum.totalPrice || 0)
            };
        }));

        return result.sort((a, b) => b.totalOmset - a.totalOmset);
    }

    async getBalanceHistory(merchantId: string, resellerId: string) {
        return []; // For now, disabled
    }

    async adjustBalance(merchantId: string, merchantUserId: string, resellerId: string, type: 'ADD' | 'SUBTRACT', amount: number, notes: string) {
        return { success: true }; // For now, disabled
    }
}
