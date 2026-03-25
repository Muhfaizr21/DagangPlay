# Integrasi Tripay Payment Gateway dengan NestJS

Panduan lengkap untuk mengintegrasikan Tripay sebagai payment gateway pada aplikasi NestJS.

---

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Struktur Folder](#struktur-folder)
- [Implementasi](#implementasi)
  - [TripayModule](#1-tripaymodule)
  - [TripayService](#2-tripayservice)
  - [PaymentController](#3-paymentcontroller)
  - [WebhookController](#4-webhookcontroller)
  - [DTO](#5-dto)
- [Daftarkan ke AppModule](#6-daftarkan-ke-appmodule)
- [Contoh Request & Response](#contoh-request--response)
- [Alur Transaksi](#alur-transaksi)
- [Catatan Penting](#catatan-penting)

---

## Prasyarat

- Node.js >= 18
- NestJS >= 10
- Akun Tripay (https://tripay.co.id)
- API Key, Private Key, dan Merchant Code dari dashboard Tripay

---

## Instalasi

```bash
npm install @nestjs/axios @nestjs/config axios
```

---

## Konfigurasi Environment

Buat atau tambahkan variabel berikut di file `.env`:

```env
TRIPAY_API_KEY=your_api_key_here
TRIPAY_PRIVATE_KEY=your_private_key_here
TRIPAY_MERCHANT_CODE=your_merchant_code

# Production
TRIPAY_BASE_URL=https://tripay.co.id/api

# Sandbox (untuk testing)
# TRIPAY_BASE_URL=https://tripay.co.id/api-sandbox
```

---

## Struktur Folder

```
src/
└── tripay/
    ├── tripay.module.ts
    ├── tripay.service.ts
    ├── payment.controller.ts
    ├── webhook.controller.ts
    └── dto/
        └── create-transaction.dto.ts
```

---

## Implementasi

### 1. TripayModule

**`src/tripay/tripay.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TripayService } from './tripay.service';
import { PaymentController } from './payment.controller';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [HttpModule],
  providers: [TripayService],
  controllers: [PaymentController, WebhookController],
  exports: [TripayService],
})
export class TripayModule {}
```

---

### 2. TripayService

**`src/tripay/tripay.service.ts`**

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class TripayService {
  private readonly apiKey: string;
  private readonly privateKey: string;
  private readonly merchantCode: string;
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('TRIPAY_API_KEY');
    this.privateKey = this.config.get<string>('TRIPAY_PRIVATE_KEY');
    this.merchantCode = this.config.get<string>('TRIPAY_MERCHANT_CODE');
    this.baseUrl = this.config.get<string>('TRIPAY_BASE_URL');
  }

  // Generate signature untuk request transaksi
  private generateSignature(merchantRef: string, amount: number): string {
    return crypto
      .createHmac('sha256', this.privateKey)
      .update(`${this.merchantCode}${merchantRef}${amount}`)
      .digest('hex');
  }

  // Verifikasi signature dari callback webhook Tripay
  verifyWebhookSignature(rawBody: string, callbackSignature: string): boolean {
    const expected = crypto
      .createHmac('sha256', this.privateKey)
      .update(rawBody)
      .digest('hex');
    return expected === callbackSignature;
  }

  // Membuat transaksi baru (closed payment)
  async createTransaction(data: {
    method: string;
    merchantRef: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    orderItems: { name: string; price: number; quantity: number }[];
    returnUrl?: string;
    expiredTime?: number;
  }) {
    const signature = this.generateSignature(data.merchantRef, data.amount);

    const payload = {
      method: data.method,
      merchant_ref: data.merchantRef,
      amount: data.amount,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      order_items: data.orderItems,
      return_url: data.returnUrl ?? '',
      expired_time: data.expiredTime ?? Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      signature,
    };

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/transaction/create`, payload, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message ?? 'Gagal membuat transaksi Tripay',
      );
    }
  }

  // Cek status transaksi berdasarkan referensi merchant
  async getTransactionDetail(merchantRef: string) {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/transaction/detail`, {
          params: { reference: merchantRef },
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }),
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error.response?.data?.message ?? 'Gagal mengambil detail transaksi',
      );
    }
  }

  // Ambil daftar channel pembayaran yang tersedia
  async getPaymentChannels() {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/merchant/payment-channel`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }),
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException('Gagal mengambil daftar channel pembayaran');
    }
  }
}
```

---

### 3. PaymentController

**`src/tripay/payment.controller.ts`**

```typescript
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TripayService } from './tripay.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly tripayService: TripayService) {}

  // Buat transaksi baru
  @Post('create')
  async create(@Body() dto: CreateTransactionDto) {
    const merchantRef = `ORDER-${Date.now()}`;

    const result = await this.tripayService.createTransaction({
      method: dto.method,
      merchantRef,
      amount: dto.amount,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      orderItems: dto.orderItems,
      returnUrl: dto.returnUrl,
    });

    return {
      success: true,
      merchantRef,
      data: result.data,
    };
  }

  // Cek status transaksi
  @Get('status/:merchantRef')
  async status(@Param('merchantRef') merchantRef: string) {
    return this.tripayService.getTransactionDetail(merchantRef);
  }

  // Daftar channel pembayaran
  @Get('channels')
  async channels() {
    return this.tripayService.getPaymentChannels();
  }
}
```

---

### 4. WebhookController

**`src/tripay/webhook.controller.ts`**

> Tripay mengirim notifikasi ke endpoint ini setelah pembayaran berhasil atau gagal.

```typescript
import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { TripayService } from './tripay.service';

@Controller('payment')
export class WebhookController {
  constructor(private readonly tripayService: TripayService) {}

  @Post('callback')
  @HttpCode(200)
  async handleCallback(
    @Req() req: Request,
    @Headers('X-Callback-Signature') signature: string,
  ) {
    // Ambil raw body sebagai string untuk verifikasi signature
    const rawBody = JSON.stringify(req.body);

    const isValid = this.tripayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new BadRequestException('Signature tidak valid');
    }

    const {
      reference,
      merchant_ref,
      payment_method,
      total_amount,
      status,
    } = req.body;

    // TODO: Update status order di database kamu di sini
    // Contoh: await this.orderService.updateStatus(merchant_ref, status);

    console.log(`Pembayaran ${merchant_ref} | Status: ${status} | Ref: ${reference}`);

    return { success: true };
  }
}
```

> **Penting:** Agar `req.body` bisa dipakai untuk verifikasi signature, pastikan raw body tersedia. Tambahkan middleware berikut di `main.ts`:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Simpan raw body untuk keperluan verifikasi webhook
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

---

### 5. DTO

**`src/tripay/dto/create-transaction.dto.ts`**

```typescript
import { IsString, IsNumber, IsEmail, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}

export class CreateTransactionDto {
  @IsString()
  method: string; // Contoh: 'BRIVA', 'BCAVA', 'MANDIRIVA', 'OVO', 'QRIS'

  @IsNumber()
  amount: number;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  customerPhone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @IsOptional()
  @IsString()
  returnUrl?: string;
}
```

---

### 6. Daftarkan ke AppModule

**`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripayModule } from './tripay/tripay.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TripayModule,
  ],
})
export class AppModule {}
```

---

## Contoh Request & Response

### Buat Transaksi

**Request:**

```http
POST /payment/create
Content-Type: application/json

{
  "method": "BRIVA",
  "amount": 150000,
  "customerName": "Budi Santoso",
  "customerEmail": "budi@email.com",
  "customerPhone": "08123456789",
  "orderItems": [
    {
      "name": "Produk A",
      "price": 100000,
      "quantity": 1
    },
    {
      "name": "Produk B",
      "price": 50000,
      "quantity": 1
    }
  ],
  "returnUrl": "https://yourapp.com/payment/success"
}
```

**Response:**

```json
{
  "success": true,
  "merchantRef": "ORDER-1718000000000",
  "data": {
    "reference": "T0001000000000000006",
    "merchant_ref": "ORDER-1718000000000",
    "payment_selection_type": "static",
    "payment_method": "BRIVA",
    "payment_name": "BRI Virtual Account",
    "customer_name": "Budi Santoso",
    "customer_email": "budi@email.com",
    "customer_phone": "08123456789",
    "callback_url": "https://yourapp.com/payment/callback",
    "return_url": "https://yourapp.com/payment/success",
    "amount": 150000,
    "fee_merchant": 1500,
    "fee_customer": 0,
    "total_fee": 1500,
    "amount_received": 148500,
    "pay_code": "70017000000001",
    "pay_url": null,
    "checkout_url": "https://tripay.co.id/checkout/T0001000000000000006",
    "status": "UNPAID",
    "expired_time": 1718086400
  }
}
```

---

## Alur Transaksi

```
Client App
   │
   │  POST /payment/create
   ▼
PaymentController
   │
   │  Panggil createTransaction()
   ▼
TripayService ──── HTTPS POST ───▶ Tripay API
                                        │
                                        │ Kembalikan payment_url / pay_code
                                        ▼
                                   TripayService
                                        │
                                        │ Return ke Client
                                        ▼
                                   Client (tampilkan instruksi bayar)

--- Setelah user bayar ---

Tripay Server
   │
   │  POST /payment/callback  (+ Header: X-Callback-Signature)
   ▼
WebhookController
   │
   │  Verifikasi HMAC-SHA256 Signature
   │  Update status order di database
   ▼
  200 OK
```

---

## Catatan Penting

| Hal | Keterangan |
|---|---|
| **Signature** | Selalu verifikasi `X-Callback-Signature` di setiap webhook masuk untuk mencegah pemalsuan notifikasi |
| **Idempotency** | Tripay bisa mengirim webhook lebih dari sekali; pastikan logika update status idempotent |
| **Raw Body** | Gunakan raw body string (bukan parsed object) saat menghitung signature webhook |
| **Sandbox** | Gunakan `https://tripay.co.id/api-sandbox` dan kredensial sandbox untuk testing |
| **Channel Kode** | Daftar kode metode pembayaran: `BRIVA`, `BCAVA`, `MANDIRIVA`, `PERMATAVA`, `OVO`, `DANA`, `GOPAY`, `QRIS`, dll — cek endpoint `/merchant/payment-channel` |
| **Expired Time** | Default expired 24 jam dari waktu pembuatan transaksi; bisa dikustomisasi dengan unix timestamp |