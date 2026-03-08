import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async adminLogin(data: any) {
        // Very basic login flow for demonstration
        // Ensure we hit the database to find SUPER_ADMIN or ADMIN_STAFF
        const adminParams = {
            email: data.email,
            role: { in: ['SUPER_ADMIN', 'ADMIN_STAFF'] } as any,
            status: 'ACTIVE' as any
        };

        const user = await this.prisma.user.findFirst({
            where: adminParams
        });

        if (!user) {
            throw new UnauthorizedException('Email admin tidak terdaftar atau telah disuspend.');
        }

        // Check password (In real app, compare hashed password using bcrypt)
        if (user.password !== data.password) {
            throw new UnauthorizedException('Password administrator yang Anda masukkan salah.');
        }

        // Record login attempt for Security Audit
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
}
