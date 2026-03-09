import { Module } from '@nestjs/common';
import { MerchantsController } from './merchants.controller';
import { MerchantOverridesController } from './overrides.controller';
import { MerchantsService } from './merchants.service';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [MerchantsController, MerchantOverridesController],
    providers: [MerchantsService, PrismaService],
})
export class MerchantsModule { }
