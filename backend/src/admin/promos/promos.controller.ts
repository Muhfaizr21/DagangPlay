import { UseGuards,  Controller, Get, Post, Patch, Delete, Body, Param, Query  } from "@nestjs/common";
import { PromosService } from './promos.service';

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Controller('admin/promos')
export class PromosController {
    constructor(private readonly promosService: PromosService) { }

    @Get()
    async getAll(@Query('search') search?: string) {
        return this.promosService.getAllPromos(search);
    }

    @Get('report')
    async getReport() {
        return this.promosService.getPromoReport();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.promosService.getPromoById(id);
    }

    @Post()
    async create(@Body() body: any) {
        return this.promosService.createPromo(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.promosService.updatePromo(id, body);
    }

    @Patch(':id/toggle')
    async toggle(@Param('id') id: string) {
        return this.promosService.togglePromoStatus(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.promosService.deletePromo(id);
    }
}
