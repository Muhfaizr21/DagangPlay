import { Module } from '@nestjs/common';
import { PublicOrdersController } from './public-orders.controller';
import { PublicOrdersService } from './public-orders.service';
import { PrismaService } from '../../prisma.service';
import { TripayModule } from '../../tripay/tripay.module';
import { DigiflazzModule } from '../../admin/digiflazz/digiflazz.module';

@Module({
    imports: [TripayModule, DigiflazzModule],
    controllers: [PublicOrdersController],
    providers: [PublicOrdersService, PrismaService],
    exports: [PublicOrdersService]
})
export class PublicOrdersModule { }
