import { Module } from '@nestjs/common';
import { DigiflazzController } from './digiflazz.controller';
import { DigiflazzService } from './digiflazz.service';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [DigiflazzController],
    providers: [DigiflazzService, PrismaService],
    exports: [DigiflazzService],
})
export class DigiflazzModule { }
