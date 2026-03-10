import { Module } from '@nestjs/common';
import { PublicDigiflazzController } from './public-digiflazz.controller';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [PublicDigiflazzController],
    providers: [DigiflazzService, PrismaService],
    exports: [DigiflazzService]
})
export class PublicDigiflazzModule { }
