import {
  UseGuards,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { MarketingService } from './marketing.service';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_marketing')
@Controller('admin/marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('guides')
  async getGuides(@Query('search') search?: string, @Query('plan') plan?: any) {
    return this.marketingService.getAllGuides(search, plan);
  }

  @Post('guides')
  async createGuide(@Body() data: any) {
    return this.marketingService.createGuide(data);
  }

  @Patch('guides/:id')
  async updateGuide(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateGuide(id, data);
  }

  @Delete('guides/:id')
  async deleteGuide(@Param('id') id: string) {
    return this.marketingService.deleteGuide(id);
  }

  @Post('broadcast')
  @HttpCode(200)
  async broadcastAnnouncement(@Body('message') message: string) {
    return this.marketingService.broadcastAnnouncement(message, 'SuperAdmin');
  }
}
