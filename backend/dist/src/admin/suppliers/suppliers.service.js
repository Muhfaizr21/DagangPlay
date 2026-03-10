"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const crypto = __importStar(require("crypto"));
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllSuppliers() {
        return this.prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async getSupplierById(id) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier tidak ditemukan');
        return supplier;
    }
    async updateSupplier(id, data) {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }
    async testConnection(id) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier tidak ditemukan');
        if (supplier.code === 'DIGIFLAZZ') {
            try {
                const username = process.env.DIGIFLAZZ_USERNAME;
                const key = process.env.DIGIFLAZZ_KEY;
                const url = process.env.DIGIFLAZZ_URL || 'https://api.digiflazz.com/v1';
                if (!username || !key)
                    throw new Error('Digiflazz Credentials not configured in .env');
                const sign = crypto.createHash('md5').update(username + key + 'depo').digest('hex');
                const startTime = Date.now();
                const response = await fetch(`${url}/cek-saldo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cmd: "deposit",
                        username: username,
                        sign: sign
                    })
                });
                const duration = Date.now() - startTime;
                const resJson = await response.json();
                await this.prisma.supplierLog.create({
                    data: {
                        supplierId: supplier.id,
                        method: 'POST',
                        endpoint: '/cek-saldo',
                        requestBody: { cmd: 'deposit', username, sign: '***' },
                        responseBody: resJson,
                        httpStatus: response.status,
                        duration,
                        isSuccess: response.ok && !!resJson.data
                    }
                });
                if (!response.ok || !resJson.data) {
                    await this.prisma.supplier.update({ where: { id }, data: { status: 'MAINTENANCE' } });
                    throw new Error('API Digiflazz meresponse dengan error: ' + JSON.stringify(resJson));
                }
                const balanceApi = Number(resJson.data.deposit || 0);
                await this.prisma.supplier.update({
                    where: { id },
                    data: { balance: balanceApi, status: 'ACTIVE', lastSyncAt: new Date() }
                });
                return {
                    success: true,
                    message: 'Koneksi Berhasil',
                    balance: balanceApi,
                };
            }
            catch (err) {
                throw new common_1.InternalServerErrorException(err.message || 'Koneksi Gagal');
            }
        }
        else {
            throw new common_1.InternalServerErrorException('Ping test belum didukung untuk supplier ini');
        }
    }
    async topupBalance(id, amount, note) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier tidak ditemukan');
        return this.prisma.$transaction(async (tx) => {
            const balanceBefore = supplier.balance;
            const balanceAfter = Number(balanceBefore) + Number(amount);
            const updated = await tx.supplier.update({
                where: { id },
                data: { balance: balanceAfter }
            });
            await tx.supplierBalanceHistory.create({
                data: {
                    supplierId: id,
                    type: 'TOPUP',
                    amount: amount,
                    balanceBefore: balanceBefore,
                    balanceAfter: balanceAfter,
                    note: note || 'Manual Topup dari Super Admin'
                }
            });
            return updated;
        });
    }
    async getSupplierLogs(id, limit = 50) {
        return this.prisma.supplierLog.findMany({
            where: { supplierId: id },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
    async getSupplierBalanceHistories(id, limit = 50) {
        return this.prisma.supplierBalanceHistory.findMany({
            where: { supplierId: id },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map