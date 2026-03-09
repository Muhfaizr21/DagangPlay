import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class ResellersService {
    constructor(private prisma: PrismaService) { }

    async getResellers(merchantId: string, search?: string) {
        const whereClause: any = {
            merchantId,
            role: 'CUSTOMER'
        };

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const resellers = await this.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                balance: true,
                createdAt: true,
                _count: {
                    select: { ordersAsCustomer: { where: { paymentStatus: 'PAID' } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return resellers.map(r => ({
            ...r,
            totalOrders: r._count.ordersAsCustomer
        }));
    }

    async updateStatus(merchantId: string, resellerId: string, status: UserStatus) {
        const reseller = await this.prisma.user.findFirst({
            where: { id: resellerId, merchantId, role: 'CUSTOMER' }
        });

        if (!reseller) throw new NotFoundException('Reseller tidak ditemukan');

        return this.prisma.user.update({
            where: { id: resellerId },
            data: { status }
        });
    }

    async adjustBalance(merchantId: string, userId: string, resellerId: string, type: 'ADD' | 'SUBTRACT', amount: number, notes: string) {
        const reseller = await this.prisma.user.findFirst({
            where: { id: resellerId, merchantId, role: 'CUSTOMER' }
        });

        if (!reseller) throw new NotFoundException('Reseller tidak ditemukan');
        if (amount <= 0) throw new BadRequestException('Amount harus lebih dari 0');

        // Here we assume merchant balance is central or not deducted right now, 
        // or we only track reseller balance. For realistic SAAS, modifying reseller balance
        // might also deduct from merchant's omset or main balance, but we'll stick to a simple 
        // ledger for now as requested.

        return this.prisma.$transaction(async (tx) => {
            // Create transaction log
            const log = await tx.balanceTransaction.create({
                data: {
                    userId: resellerId,
                    type: type === 'ADD' ? 'DEPOSIT' : 'WITHDRAWAL',
                    amount: type === 'SUBTRACT' ? -amount : amount,
                    description: `Adjustment by Merchant: ${notes}`
                }
            });

            // Update user balance
            const action = type === 'ADD' ? { increment: amount } : { decrement: amount };

            if (type === 'SUBTRACT' && Number(reseller.balance) < amount) {
                throw new BadRequestException('Saldo reseller tidak mencukupi untuk pengurangan');
            }

            await tx.user.update({
                where: { id: resellerId },
                data: { balance: action }
            });

            return log;
        });
    }

    async createReseller(merchantId: string, data: any) {
        const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existingEmail) {
            throw new BadRequestException('Email sudah digunakan');
        }

        const existingPhone = await this.prisma.user.findUnique({ where: { phone: data.phone } });
        if (existingPhone && data.phone) {
            throw new BadRequestException('Nomor telepon sudah digunakan');
        }

        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: hashedPassword,
                role: 'CUSTOMER',
                merchantId,
                status: 'ACTIVE',
                referralCode: `REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            }
        });
    }
}
