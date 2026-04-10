import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { PlanMappingController } from './plan-mapping.controller';
import { SettingsService } from './settings.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SettingsController, PlanMappingController],
  providers: [SettingsService, PrismaService],
})
export class SettingsModule {}
