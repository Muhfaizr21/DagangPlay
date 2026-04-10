import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../../prisma.service';

import { SubscriptionsModule } from '../../admin/subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [MembersController],
  providers: [MembersService, PrismaService],
  exports: [MembersService],
})
export class MembersModule {}
