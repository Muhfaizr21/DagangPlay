import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('digiflazz-fulfillment')
export class DigiflazzProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    const { orderId, supplierCode } = job.data;
    
    // Ini adalah kerangka untuk mengeksekusi API Digiflazz / VIP Reseller via background Worker
    // Jika API timeout/gagal, BullMQ akan retry otomatis perlahan.
    // Jika retries habis (langso ke Dead Letter Queue).
    
    console.log(`[DigiflazzWorker] Memproses pesanan untuk orderId: ${orderId} ke ${supplierCode}`);
    
    // Simulasi aksi async ke pihak ke 3
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return { success: true, ref_id: `MOCK_REF_${orderId}` };
  }
}
