import { Controller, Get, Patch, Post, Param, Body, Query, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserStatus } from '@prisma/client';

@Controller('admin/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async getAllUsers(
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('status') status?: string
    ) {
        return this.usersService.getAllUsers(search, role, status);
    }

    @Get(':id')
    async getUserDetail(@Param('id') id: string) {
        return this.usersService.getUserDetail(id);
    }

    @Patch(':id/status')
    async updateUserStatus(@Param('id') id: string, @Body() body: { status: UserStatus; reason?: string }) {
        return this.usersService.updateUserStatus(id, body.status, body.reason);
    }

    @Post(':id/balance/adjust')
    @HttpCode(200)
    async adjustBalance(
        @Param('id') id: string,
        @Body() body: { type: 'ADD' | 'DEDUCT'; amount: number; note: string }
    ) {
        // In actual production, operatorId would derive from req.user context (JWT)
        // For now, we mock it as "SuperAdmin"
        return this.usersService.adjustBalance(id, 'SuperAdmin', body.type, body.amount, body.note);
    }

    @Get(':id/balance-history')
    async getBalanceHistories(@Param('id') id: string) {
        return this.usersService.getBalanceHistories(id);
    }

    @Get(':id/sessions')
    async getSessions(@Param('id') id: string) {
        return this.usersService.getLoginSessions(id);
    }

    @Post(':id/sessions/force-logout')
    @HttpCode(200)
    async forceLogoutAll(@Param('id') id: string) {
        return this.usersService.forceLogoutAllSessions(id);
    }
}
