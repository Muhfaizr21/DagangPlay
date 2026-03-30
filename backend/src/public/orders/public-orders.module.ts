import { Module } from '@nestjs/common';
import { PublicOrdersController } from './public-orders.controller';
import { PublicOrdersService } from './public-orders.service';
import { PrismaService } from '../../prisma.service';
import { TripayModule } from '../../tripay/tripay.module';
import { DigiflazzModule } from '../../admin/digiflazz/digiflazz.module';

import { SubscriptionsModule } from '../../admin/subscriptions/subscriptions.module';
import { PublicOtpService } from './otp.service';

@Module({
    imports: [TripayModule, DigiflazzModule, SubscriptionsModule],
    controllers: [PublicOrdersController],
    providers: [PublicOrdersService, PrismaService, PublicOtpService],
    exports: [PublicOrdersService]
})
export class PublicOrdersModule { }
