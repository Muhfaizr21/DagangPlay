import { Module } from '@nestjs/common';
import { TripayService } from './tripay.service';
import { TripayController } from './tripay.controller';
import { PrismaService } from '../prisma.service';

import { DigiflazzModule } from '../admin/digiflazz/digiflazz.module';

@Module({
    imports: [DigiflazzModule],
    providers: [TripayService, PrismaService],
    controllers: [TripayController],
    exports: [TripayService],
})
export class TripayModule { }
