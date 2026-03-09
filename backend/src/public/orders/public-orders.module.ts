import { Module } from '@nestjs/common';
import { PublicOrdersController } from './public-orders.controller';
import { PublicOrdersService } from './public-orders.service';
import { PrismaService } from '../../prisma.service';
import { TripayModule } from '../../tripay/tripay.module';

@Module({
    imports: [TripayModule],
    controllers: [PublicOrdersController],
    providers: [PublicOrdersService, PrismaService]
})
export class PublicOrdersModule { }
