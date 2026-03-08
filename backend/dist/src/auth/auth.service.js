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
        const adminParams = {
            email: data.email,
            role: { in: ['SUPER_ADMIN', 'ADMIN_STAFF'] },
            status: 'ACTIVE'
        };
        const user = await this.prisma.user.findFirst({
            where: adminParams
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email admin tidak terdaftar atau telah disuspend.');
        }
        if (user.password !== data.password) {
            throw new common_1.UnauthorizedException('Password administrator yang Anda masukkan salah.');
        }
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
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                adminPermissions: user.adminPermissions || []
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