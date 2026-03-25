import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('admin/login')
    @Throttle({ default: { limit: 5, ttl: 900000 } }) // 15 Menit lockout
    async adminLogin(@Body() body: any, @Req() req: any) {
        console.log('--- Incoming Login Request ---');
        console.log('Body:', JSON.stringify(body));
        const loginData = {
            email: body.email,
            password: body.password,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        };
        return this.authService.adminLogin(loginData);
    }

    @Post('logout')
    async logout(@Req() req: any) {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            await this.authService.logout(token);
        }
        return { statusCode: 200, message: 'Berhasil logout' };
    }

    @Post('verify-email')
    async verifyEmail(@Body() body: { token: string; code: string }) {
        return this.authService.verifyEmail(body.token, body.code);
    }
}
