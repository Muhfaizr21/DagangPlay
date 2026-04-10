import { Module } from '@nestjs/common';
import { PromosController } from './promos.controller';
import { PromosService } from './promos.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PromosController],
  providers: [PromosService, PrismaService],
})
export class PromosModule {}
