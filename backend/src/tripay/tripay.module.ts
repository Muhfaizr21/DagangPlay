import { Module } from '@nestjs/common';
import { TripayService } from './tripay.service';
import { TripayController } from './tripay.controller';
import { PrismaService } from '../prisma.service';

@Module({
    providers: [TripayService, PrismaService],
    controllers: [TripayController],
    exports: [TripayService],
})
export class TripayModule { }
