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
exports.ResellersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let ResellersService = class ResellersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getResellers(merchantId, search) {
        const whereClause = {
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
    async updateStatus(merchantId, resellerId, status) {
        const reseller = await this.prisma.user.findFirst({
            where: { id: resellerId, merchantId, role: 'CUSTOMER' }
        });
        if (!reseller)
            throw new common_1.NotFoundException('Reseller tidak ditemukan');
        return this.prisma.user.update({
            where: { id: resellerId },
            data: { status }
        });
    }
    async adjustBalance(merchantId, userId, resellerId, type, amount, notes) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount harus lebih dari 0');
        return this.prisma.$transaction(async (tx) => {
            const reseller = await tx.user.findFirst({
                where: { id: resellerId, merchantId, role: 'CUSTOMER' }
            });
            if (!reseller)
                throw new common_1.NotFoundException('Reseller tidak ditemukan');
            const merchant = await tx.merchant.findUnique({
                where: { id: merchantId },
                include: { owner: true }
            });
            if (!merchant)
                throw new common_1.NotFoundException('Merchant tidak valid');
            if (type === 'ADD') {
                if (Number(merchant.owner.balance) < amount) {
                    throw new common_1.BadRequestException('Saldo platform utama Toko (Merchant) tidak mencukupi untuk ditransfer ke Reseller.');
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
            }
            else {
                if (Number(reseller.balance) < amount) {
                    throw new common_1.BadRequestException('Saldo reseller tidak mencukupi untuk ditarik kembali/dikurangi.');
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
    async createReseller(merchantId, data) {
        const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existingEmail) {
            throw new common_1.BadRequestException('Email sudah digunakan');
        }
        const existingPhone = await this.prisma.user.findUnique({ where: { phone: data.phone } });
        if (existingPhone && data.phone) {
            throw new common_1.BadRequestException('Nomor telepon sudah digunakan');
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
};
exports.ResellersService = ResellersService;
exports.ResellersService = ResellersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResellersService);
//# sourceMappingURL=resellers.service.js.map