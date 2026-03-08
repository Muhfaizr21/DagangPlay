import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { DashboardModule } from './admin/dashboard/dashboard.module';
import { MerchantsModule } from './admin/merchants/merchants.module';

@Module({
  imports: [DashboardModule, MerchantsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
