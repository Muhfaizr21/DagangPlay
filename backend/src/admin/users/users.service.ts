import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserStatus, Role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getAllUsers(search?: string, role?: string, status?: string) {
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role && role !== 'ALL') where.role = role;
        if (status && status !== 'ALL') where.status = status;

        return this.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                balance: true,
                bonusBalance: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: { ordersAsCustomer: true, ordersAsReseller: true }
                }
            }
        });
    }

    async getUserDetail(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                merchantMembers: { include: { merchant: true } },
            }
        });
        if (!user) throw new NotFoundException('User tidak ditemukan');
        return user;
    }

    async updateUserStatus(id: string, status: UserStatus, reason?: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User tidak ditemukan');

        if (user.isOfficial && status === UserStatus.SUSPENDED) {
            throw new BadRequestException('Akun Official tidak dapat disuspend');
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: { status }
        });

        await this.prisma.auditLog.create({
            data: {
                action: `USER_${status}`,
                entity: 'User',
                entityId: id,
                newData: { status, reason },
                oldData: { status: user.status }
            }
        });

        return updated;
    }

    async adjustBalance(id: string, operatorId: string, type: 'ADD' | 'DEDUCT', amount: number, note: string) {
        if (!amount || amount <= 0) throw new BadRequestException('Amount invalid');
        if (!note) throw new BadRequestException('Alasan harus diisi');

        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id } });
            if (!user) throw new NotFoundException('User tidak ditemukan');

            const balanceBefore = user.balance;
            let balanceAfter = Number(balanceBefore);

            if (type === 'ADD') {
                balanceAfter += amount;
            } else {
                if (balanceAfter < amount) throw new BadRequestException('Saldo user tidak mencukupi untuk pengurangan');
                balanceAfter -= amount;
            }

            await tx.user.update({
                where: { id },
                data: { balance: balanceAfter }
            });

            await tx.balanceTransaction.create({
                data: {
                    userId: id,
                    type: 'ADJUSTMENT',
                    amount: amount,
                    balanceBefore: balanceBefore,
                    balanceAfter: balanceAfter,
                    note: `Manual: ${type} ${note} (By ${operatorId})`
                }
            });

            return { success: true, balanceAfter };
        });
    }

    async getBalanceHistories(id: string, limit = 50) {
        return this.prisma.balanceTransaction.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    async getLoginSessions(id: string) {
        return this.prisma.userSession.findMany({
            where: { userId: id, expiresAt: { gt: new Date() } },
            orderBy: { lastActiveAt: 'desc' }
        });
    }

    async forceLogoutAllSessions(id: string) {
        // Delete all active sessions
        const res = await this.prisma.userSession.deleteMany({
            where: { userId: id }
        });

        await this.prisma.auditLog.create({
            data: {
                action: 'FORCE_LOGOUT_ALL',
                entity: 'User',
                entityId: id,
                newData: { sessionsRevoked: res.count },
                oldData: {}
            }
        });

        return { success: true, revoked: res.count };
    }
}
