import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WebhookProcessor } from './webhook.processor';
import { DigiflazzProcessor } from './digiflazz.processor';
import { PrismaService } from '../../prisma.service';
import { DigiflazzModule } from '../../admin/digiflazz/digiflazz.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'webhook',
    }),
    BullModule.registerQueue({
      name: 'digiflazz-fulfillment',
    }),
    DigiflazzModule,
  ],
  providers: [WebhookProcessor, DigiflazzProcessor, PrismaService],
  exports: [BullModule],
})
export class QueueConfigModule {}
