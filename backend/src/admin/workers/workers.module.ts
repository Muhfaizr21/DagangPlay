import { Module } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { PrismaService } from '../../prisma.service';
import { DigiflazzService } from '../digiflazz/digiflazz.service';

@Module({
  providers: [WorkersService, PrismaService, DigiflazzService]
})
export class WorkersModule { }
