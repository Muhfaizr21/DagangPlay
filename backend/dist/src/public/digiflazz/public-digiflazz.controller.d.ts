import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';
export declare class PublicDigiflazzController {
    private readonly digiflazzService;
    constructor(digiflazzService: DigiflazzService);
    handleWebhook(delivery: string, event: string, body: any, req: any, res: any): Promise<any>;
}
