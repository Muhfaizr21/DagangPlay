import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('merchant/audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async getLogs(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const merchantId = req.user.merchantId;
        return this.auditService.getLogs(
            merchantId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 50
        );
    }
}
