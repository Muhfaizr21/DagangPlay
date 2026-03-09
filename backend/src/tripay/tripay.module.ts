import { Module } from '@nestjs/common';
import { TripayService } from './tripay.service';
import { TripayController } from './tripay.controller';

@Module({
    providers: [TripayService],
    controllers: [TripayController],
    exports: [TripayService],
})
export class TripayModule { }
