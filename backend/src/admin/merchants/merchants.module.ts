import { Module } from '@nestjs/common';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [MerchantsController],
    providers: [MerchantsService, PrismaService],
})
export class MerchantsModule { }
