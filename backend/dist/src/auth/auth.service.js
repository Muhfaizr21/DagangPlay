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
exports.AuthService = void 0;
const bcrypt = __importStar(require("bcrypt"));
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
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
            include: { ownedMerchant: true }
        });
        if (!user) {
            console.log('Result: FAILED - User not found');
            throw new common_1.UnauthorizedException('Email administrator tidak terdaftar.');
        }
        if (user.isGuest) {
            console.log('Result: FAILED - isGuest is true');
            throw new common_1.UnauthorizedException('Akun Guest tidak dapat login ke Admin Panel.');
        }
        if (!['SUPER_ADMIN', 'ADMIN_STAFF', 'MERCHANT'].includes(user.role)) {
            console.log('Result: FAILED - Invalid Role:', user.role);
            throw new common_1.UnauthorizedException('Anda tidak memiliki akses ke area dashboard ini.');
        }
        if (user.status !== 'ACTIVE') {
            console.log('Result: FAILED - Status:', user.status);
            throw new common_1.UnauthorizedException('Akun admin Anda sedang dinonaktifkan.');
        }
        let isMatch = false;
        if (user.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(data.password, user.password);
        }
        else {
            console.warn(`[AuthAudit] User ${user.email} has non-bcrypt password. Login rejected. Require password reset via admin panel.`);
            throw new common_1.UnauthorizedException('Akun Anda memiliki format password lama yang tidak aman. Silakan hubungi Super Admin untuk reset password Anda.');
        }
        if (!isMatch) {
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
        const session = await this.prisma.userSession.create({
            data: {
                userId: user.id,
                token: 'placeholder_' + Date.now(),
                refreshToken: 'rt_' + Date.now() + Math.random().toString(36).substring(7),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        });
        const payload = { sub: user.id, email: user.email, role: user.role, sessionId: session.id };
        const token = this.jwtService.sign(payload);
        await this.prisma.userSession.update({
            where: { id: session.id },
            data: { token: token }
        });
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
    async logout(token) {
        try {
            await this.prisma.userSession.delete({
                where: { token: token }
            });
        }
        catch (e) {
        }
    }
    async verifyEmail(token, code) {
        const otp = await this.prisma.otpVerification.findFirst({
            where: { token, code, type: 'EMAIL_VERIFY' }
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Token/Kode tidak valid atau sudah kadaluarsa.');
        }
        await this.prisma.user.update({
            where: { id: otp.userId },
            data: { isVerified: true, verifiedAt: new Date() }
        });
        await this.prisma.otpVerification.delete({ where: { id: otp.id } });
        return { statusCode: 200, message: 'Email berhasil diverifikasi' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map