import { Module } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [WorkersService, PrismaService]
})
export class WorkersModule { }
