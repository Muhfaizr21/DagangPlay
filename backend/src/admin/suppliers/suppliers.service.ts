import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';
import { SupplierStatus } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async getAllSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier tidak ditemukan');
    return supplier;
  }

  async updateSupplier(
    id: string,
    data: {
      name?: string;
      apiUrl?: string;
      apiKey?: string;
      apiSecret?: string;
      status?: SupplierStatus;
    },
  ) {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async testConnection(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier tidak ditemukan');

    // Currently implementing DIGIFLAZZ logic
    if (supplier.code === 'DIGIFLAZZ') {
      try {
        const username = process.env.DIGIFLAZZ_USERNAME;
        const key = process.env.DIGIFLAZZ_KEY;
        const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';

        if (!username || !key)
          throw new Error('Digiflazz Credentials not configured in .env');

        const sign = crypto
          .createHash('md5')
          .update(username + key + 'depo')
          .digest('hex');

        const startTime = Date.now();
        const response = await fetch(`${url}/cek-saldo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cmd: 'deposit',
            username: username,
            sign: sign,
          }),
        });

        const duration = Date.now() - startTime;
        const resJson = await response.json();

        // Logging
        await this.prisma.supplierLog.create({
          data: {
            supplierId: supplier.id,
            method: 'POST',
            endpoint: '/cek-saldo',
            requestBody: { cmd: 'deposit', username, sign: '***' },
            responseBody: resJson,
            httpStatus: response.status,
            duration,
            isSuccess: response.ok && !!resJson.data,
          },
        });

        if (!response.ok || !resJson.data) {
          await this.prisma.supplier.update({
            where: { id },
            data: { status: 'MAINTENANCE' },
          });
          throw new Error(
            'API Digiflazz meresponse dengan error: ' + JSON.stringify(resJson),
          );
        }

        const balanceApi = Number(resJson.data.deposit || 0);

        // Update Local balance
        await this.prisma.supplier.update({
          where: { id },
          data: {
            balance: balanceApi,
            status: 'ACTIVE',
            lastSyncAt: new Date(),
          },
        });

        return {
          success: true,
          message: 'Koneksi Berhasil',
          balance: balanceApi,
        };
      } catch (err: any) {
        throw new InternalServerErrorException(err.message || 'Koneksi Gagal');
      }
    } else {
      throw new InternalServerErrorException(
        'Ping test belum didukung untuk supplier ini',
      );
    }
  }

  async topupBalance(id: string, amount: number, note?: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier tidak ditemukan');

    // Simulation logic to add balance to Local Record
    return this.prisma.$transaction(async (tx) => {
      const balanceBefore = supplier.balance;
      const balanceAfter = Number(balanceBefore) + Number(amount);

      const updated = await tx.supplier.update({
        where: { id },
        data: { balance: balanceAfter },
      });

      await tx.supplierBalanceHistory.create({
        data: {
          supplierId: id,
          type: 'TOPUP',
          amount: amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          note: note || 'Manual Topup dari Super Admin',
        },
      });

      return updated;
    });
  }

  async getSupplierLogs(id: string, limit = 50) {
    return this.prisma.supplierLog.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getSupplierBalanceHistories(id: string, limit = 50) {
    return this.prisma.supplierBalanceHistory.findMany({
      where: { supplierId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
