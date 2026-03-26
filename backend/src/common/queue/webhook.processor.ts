import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Processor('webhook')
export class WebhookProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { merchantId, event, payload, endpointUrl, secretKey } = job.data;
    const startTime = Date.now();
    let isSuccess = false;
    let statusCode: number | null = null;
    let responseBody: any = null;
    let errorReason: string | null = null;

    try {
      const signature = crypto
        .createHmac('sha256', secretKey || 'dummy_secret')
        .update(JSON.stringify(payload))
        .digest('hex');

      const response = await axios.post(endpointUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-dagangplay-event': event,
          'x-dagangplay-signature': signature,
        },
        timeout: 10000,
      });

      statusCode = response.status;
      responseBody = response.data;
      isSuccess = statusCode >= 200 && statusCode < 300;
    } catch (error: any) {
      if (error.response) {
        statusCode = error.response.status;
        responseBody = error.response.data;
        errorReason = `HTTP Error ${statusCode}: ${JSON.stringify(responseBody)}`;
      } else if (error.request) {
        errorReason = `Timeout: No respons received from server in 10s.`;
      } else {
        errorReason = error.message;
      }
    }

    const latencyMs = Date.now() - startTime;

    // Save to DB Delivery Log
    await this.prisma.webhookDeliveryLog.create({
      data: {
        merchantId,
        endpointUrl,
        event,
        requestPayload: payload,
        responseStatus: statusCode,
        responseBody: responseBody ? responseBody : null,
        latencyMs,
        isSuccess,
        errorReason,
      },
    });

    if (!isSuccess) {
      throw new Error(errorReason || 'Webhook Delivery Failed');
    }

    return { status: 'delivered', latencyMs };
  }
}
