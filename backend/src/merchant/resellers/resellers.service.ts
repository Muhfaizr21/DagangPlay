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
        if (amount <= 0) throw new BadRequestException('Amount harus lebih dari 0');

        return this.prisma.$transaction(async (tx) => {
            const reseller = await tx.user.findFirst({
                where: { id: resellerId, merchantId, role: 'CUSTOMER' }
            });

            if (!reseller) throw new NotFoundException('Reseller tidak ditemukan');

            const merchant = await tx.merchant.findUnique({
                where: { id: merchantId },
                include: { owner: true }
            });

            if (!merchant) throw new NotFoundException('Merchant tidak valid');

            if (type === 'ADD') {
                if (Number(merchant.owner.balance) < amount) {
                    throw new BadRequestException('Saldo platform utama Toko (Merchant) tidak mencukupi untuk ditransfer ke Reseller.');
                }
                
                await tx.user.update({
                    where: { id: merchant.ownerId },
                    data: { balance: { decrement: amount } }
                });
                
                await tx.balanceTransaction.create({
                    data: {
                        userId: merchant.ownerId,
                        type: 'WITHDRAWAL',
                        amount: -amount,
                        description: `Transfer mutasi saldo (Modal) ke akun Reseller: ${reseller.name} - ${notes}`
                    }
                });

                await tx.user.update({
                    where: { id: resellerId },
                    data: { balance: { increment: amount } }
                });

                return tx.balanceTransaction.create({
                    data: {
                        userId: resellerId,
                        type: 'DEPOSIT',
                        amount: amount,
                        description: `Deposit saldo dari Merchant Toko: ${notes}`
                    }
                });

            } else {
                if (Number(reseller.balance) < amount) {
                    throw new BadRequestException('Saldo reseller tidak mencukupi untuk ditarik kembali/dikurangi.');
                }

                await tx.user.update({
                    where: { id: resellerId },
                    data: { balance: { decrement: amount } }
                });

                const log = await tx.balanceTransaction.create({
                    data: {
                        userId: resellerId,
                        type: 'WITHDRAWAL',
                        amount: -amount,
                        description: `Pengurangan/Penarikan Saldo oleh Merchant Toko: ${notes}`
                    }
                });

                await tx.user.update({
                    where: { id: merchant.ownerId },
                    data: { balance: { increment: amount } }
                });

                await tx.balanceTransaction.create({
                    data: {
                        userId: merchant.ownerId,
                        type: 'DEPOSIT',
                        amount: amount,
                        description: `Pengembalian mutasi saldo (Modal) dari Reseller: ${reseller.name} - ${notes}`
                    }
                });

                return log;
            }
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
