import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma.service';
export declare class WebhookProcessor extends WorkerHost {
    private readonly prisma;
    constructor(prisma: PrismaService);
    process(job: Job<any, any, string>): Promise<any>;
}
