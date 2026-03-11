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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async adminLogin(data) {
        console.log('--- Auth Audit: Admin Login Attempt ---');
        console.log('Email:', data.email);
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
            include: { ownedMerchant: true }
        });
        if (!user) {
            console.log('Result: FAILED - Email not found');
            throw new common_1.UnauthorizedException('Email administrator tidak terdaftar.');
        }
        if (!['SUPER_ADMIN', 'ADMIN_STAFF', 'MERCHANT'].includes(user.role)) {
            console.log('Result: FAILED - Invalid Role:', user.role);
            throw new common_1.UnauthorizedException('Anda tidak memiliki akses ke area dashboard ini.');
        }
        if (user.status !== 'ACTIVE') {
            console.log('Result: FAILED - Status:', user.status);
            throw new common_1.UnauthorizedException('Akun admin Anda sedang dinonaktifkan.');
        }
        if (user.password !== data.password) {
            console.log('Result: FAILED - Wrong Password');
            throw new common_1.UnauthorizedException('Password yang Anda masukkan salah.');
        }
        console.log('Result: SUCCESS - User authenticated');
        await this.prisma.loginAttempt.create({
            data: {
                userId: user.id,
                ipAddress: data.ip || '127.0.0.1',
                userAgent: data.userAgent || 'DagangPlay Admin Panel',
                isSuccess: true
            }
        });
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        return {
            statusCode: 200,
            message: 'Berhasil login ke Admin Panel',
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                adminPermissions: user.adminPermissions || [],
                plan: user.ownedMerchant ? user.ownedMerchant.plan : 'PRO',
                merchantSlug: user.ownedMerchant?.slug
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map