import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DigiflazzService } from '../../admin/digiflazz/digiflazz.service';

@Processor('digiflazz-fulfillment')
export class DigiflazzProcessor extends WorkerHost {
  constructor(private readonly digiflazzService: DigiflazzService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { orderId } = job.data;
    
    console.log(`[DigiflazzWorker] Memproses pesanan otomatis untuk orderId: ${orderId}`);
    
    try {
      // Execute the actual fulfillment logic
      const result = await this.digiflazzService.placeOrder(orderId);
      return { success: true, result };
    } catch (err: any) {
      console.error(`[DigiflazzWorker] Gagal memproses order ${orderId}:`, err.message);
      // Throw error to trigger BullMQ retry logic based on queue configuration
      throw err;
    }
  }
}
