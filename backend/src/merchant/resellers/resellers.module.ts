import { Module } from '@nestjs/common';
import { ResellersController } from './resellers.controller';
import { ResellersService } from './resellers.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ResellersController],
  providers: [ResellersService, PrismaService]
})
export class ResellersModule { }

