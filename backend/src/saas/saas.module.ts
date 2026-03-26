import { Module } from '@nestjs/common';
import { SaasController } from './saas.controller';
import { SaasService } from './saas.service';
import { PrismaService } from 'src/prisma.service';
import { QueueConfigModule } from 'src/common/queue/queue.module';

@Module({
  imports: [QueueConfigModule],
  controllers: [SaasController],
  providers: [SaasService, PrismaService],
})
export class SaasModule {}
