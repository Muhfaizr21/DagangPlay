import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('admin/login')
    @Throttle({ default: { limit: 5, ttl: 900000 } })
    async superAdminLogin(@Body() body: any, @Req() req: any) {
        const loginData = {
            email: body.email,
            password: body.password,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        };
        return this.authService.superAdminLogin(loginData);
    }

    @Post('merchant/login')
    @Throttle({ default: { limit: 5, ttl: 900000 } })
    async merchantLogin(@Body() body: any, @Req() req: any) {
        const loginData = {
            email: body.email,
            password: body.password,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        };
        return this.authService.merchantLogin(loginData);
    }

    @Post('login')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async publicLogin(@Body() body: any, @Req() req: any) {
        const loginData = {
            email: body.email,
            password: body.password,
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        };
        return this.authService.publicLogin(loginData);
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
