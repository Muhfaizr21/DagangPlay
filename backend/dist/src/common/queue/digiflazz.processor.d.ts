import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
export declare class DigiflazzProcessor extends WorkerHost {
    private readonly digiflazzService;
    constructor(digiflazzService: DigiflazzService);
    process(job: Job<any, any, string>): Promise<any>;
}
