import * as bcrypt from 'bcrypt';
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
        console.log('--- Auth Audit: Admin Login Attempt ---');
        // REMOVED sensitive log: console.log('Email:', data.email);

        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
            include: { ownedMerchant: true }
        });

        if (!user) {
            console.log('Result: FAILED - User not found');
            throw new UnauthorizedException('Email administrator tidak terdaftar.');
        }

        // Add Guest Check
        if (user.isGuest) {
            console.log('Result: FAILED - isGuest is true');
            throw new UnauthorizedException('Akun Guest tidak dapat login ke Admin Panel.');
        }

        // Verify Role
        if (!['SUPER_ADMIN', 'ADMIN_STAFF', 'MERCHANT'].includes(user.role)) {
            console.log('Result: FAILED - Invalid Role:', user.role);
            throw new UnauthorizedException('Anda tidak memiliki akses ke area dashboard ini.');
        }

        // Verify Status
        if (user.status !== 'ACTIVE') {
            console.log('Result: FAILED - Status:', user.status);
            throw new UnauthorizedException('Akun admin Anda sedang dinonaktifkan.');
        }

        // Verify Password — bcrypt only. No plaintext fallback.
        let isMatch = false;
        if (user.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(data.password, user.password);
        } else {
            // FIX F: Account has a legacy non-bcrypt password.
            // Reject the login and instruct the admin to reset via the Super Admin panel.
            // This removes the plaintext comparison security vulnerability.
            console.warn(`[AuthAudit] User ${user.email} has non-bcrypt password. Login rejected. Require password reset via admin panel.`);
            throw new UnauthorizedException('Akun Anda memiliki format password lama yang tidak aman. Silakan hubungi Super Admin untuk reset password Anda.');
        }

        if (!isMatch) {
            console.log('Result: FAILED - Wrong Password');
            throw new UnauthorizedException('Password yang Anda masukkan salah.');
        }

        console.log('Result: SUCCESS - User authenticated');

        // Record login attempt
        await this.prisma.loginAttempt.create({
            data: {
                userId: user.id,
                ipAddress: data.ip || '127.0.0.1',
                userAgent: data.userAgent || 'DagangPlay Admin Panel',
                isSuccess: true
            }
        });

        // Track session for revokation
        const session = await this.prisma.userSession.create({
            data: {
                userId: user.id,
                token: 'placeholder_' + Date.now(),
                refreshToken: 'rt_' + Date.now() + Math.random().toString(36).substring(7),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
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
                adminPermissions: (user as any).adminPermissions || [],
                plan: user.ownedMerchant ? user.ownedMerchant.plan : 'PRO',
                merchantSlug: user.ownedMerchant?.slug
            }
        };
    }

    async logout(token: string) {
        try {
            await this.prisma.userSession.delete({
                where: { token: token }
            });
        } catch (e) {
            // ignore if not found
        }
    }

    async verifyEmail(token: string, code: string) {
        const otp = await this.prisma.otpVerification.findFirst({
            where: { token, code, type: 'EMAIL_VERIFY' }
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new UnauthorizedException('Token/Kode tidak valid atau sudah kadaluarsa.');
        }
        await this.prisma.user.update({
            where: { id: otp.userId },
            data: { isVerified: true, verifiedAt: new Date() }
        });
        await this.prisma.otpVerification.delete({ where: { id: otp.id } });
        return { statusCode: 200, message: 'Email berhasil diverifikasi' };
    }
}
