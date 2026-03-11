import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('admin/login')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
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
}
