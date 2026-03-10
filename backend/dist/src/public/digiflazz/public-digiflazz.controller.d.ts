import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
import type { Response } from 'express';
export declare class PublicDigiflazzController {
    private readonly digiflazzService;
    constructor(digiflazzService: DigiflazzService);
    handleWebhook(delivery: string, event: string, body: any, res: Response): Promise<Response<any, Record<string, any>>>;
}
