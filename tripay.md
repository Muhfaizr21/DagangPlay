PANDUAN INTEGRASI API TRIPAY
Untuk Digunakan oleh Antigravity AI
Versi 1.0  •  Maret 2025
1. Overview Singkat TriPay
TriPay adalah payment gateway Indonesia yang menyediakan API untuk memproses pembayaran. Integrasi dilakukan via HTTP REST API dengan autentikasi Bearer Token.

Base URL Production: https://payment.tripay.co.id

Base URL Sandbox: https://payment.tripay.co.id  (dengan endpoint /api-sandbox/...)

2. Credential yang Dibutuhkan
Sebelum bisa hit API, siapkan 3 credential berikut dari Dashboard TriPay:

Credential	Fungsi	Cara Dapat
API Key	Autentikasi di header request	Dashboard → API & Integrasi
Private Key	Generate signature HMAC-SHA256	Dashboard → API & Integrasi
Merchant Code	Identifier merchant unik	Dashboard → API & Integrasi

⚠️ PENTING: Sandbox dan Production punya credential berbeda. Jangan campur keduanya!

3. Header Request Wajib
Setiap request ke API TriPay HARUS menyertakan header berikut:

Content-Type: application/json
Authorization: Bearer {API_KEY}

Ganti {API_KEY} dengan API Key milik merchant. Tanpa header ini, semua request akan ditolak (HTTP 401).

4. Cara Generate Signature (Krusial!)
Signature adalah hash HMAC-SHA256 yang wajib disertakan saat membuat transaksi. Ini untuk memverifikasi bahwa request benar-benar dari merchant.

Formula Signature:
HMAC-SHA256( merchant_code + merchant_ref + amount , private_key )

Contoh Kode NestJS (tripay.service.ts):
import { createHmac } from 'crypto';

generateSignature(merchantRef: string, amount: number): string {
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
  const privateKey   = process.env.TRIPAY_PRIVATE_KEY;

  return createHmac('sha256', privateKey)
    .update(merchantCode + merchantRef + amount)
    .digest('hex');
}

❌ Jika signature salah: Request akan ditolak dengan error 'Invalid Signature'. Pastikan urutan konkatenasi benar: merchantCode + merchantRef + amount.

5. Membuat Transaksi (Create Transaction)
5.1 Endpoint
Mode	Endpoint
Sandbox	POST https://payment.tripay.co.id/api-sandbox/transaction/create
Production	POST https://payment.tripay.co.id/api/transaction/create

5.2 Parameter Body (JSON)
Parameter	Tipe	Wajib?	Keterangan
method	string	✅ Ya	Kode channel bayar (ex: BRIVA, BCAVA, QRIS)
merchant_ref	string	✅ Ya	ID invoice unik dari sisi merchant
amount	integer	✅ Ya	Nominal transaksi dalam Rupiah (tanpa desimal)
customer_name	string	✅ Ya	Nama lengkap pelanggan
customer_email	string	✅ Ya	Email pelanggan
customer_phone	string	⬜ Opsional	Nomor HP pelanggan
order_items	array	✅ Ya	Array produk yang dibeli (lihat struktur di bawah)
callback_url	string	⬜ Opsional	URL untuk terima notifikasi dari TriPay
return_url	string	⬜ Opsional	URL redirect setelah bayar (REDIRECT channel)
expired_time	integer	⬜ Opsional	Unix timestamp batas waktu bayar
signature	string	✅ Ya	Hash HMAC-SHA256 (lihat Section 4)

5.3 Contoh Body Request Lengkap
{
  "method": "BRIVA",
  "merchant_ref": "INV-2025-001",
  "amount": 150000,
  "customer_name": "Budi Santoso",
  "customer_email": "budi@email.com",
  "customer_phone": "081234567890",
  "order_items": [
    {
      "sku": "PROD-001",
      "name": "Paket Premium 1 Bulan",
      "price": 150000,
      "quantity": 1
    }
  ],
  "callback_url": "https://situmu.com/callback/tripay",
  "return_url": "https://situmu.com/thankyou",
  "expired_time": 1743000000,
  "signature": "abc123def456..."
}

5.4 Contoh Response Sukses
{
  "success": true,
  "message": "Transaksi berhasil dibuat",
  "data": {
    "reference": "DEV-XXXX",
    "merchant_ref": "INV-2025-001",
    "payment_method": "BRIVA",
    "payment_name": "BRI Virtual Account",
    "customer_name": "Budi Santoso",
    "amount": 150000,
    "fee_merchant": 1000,
    "fee_customer": 0,
    "total_fee": 1000,
    "amount_received": 149000,
    "pay_code": "1234567890123",
    "pay_url": null,
    "checkout_url": "https://payment.tripay.co.id/checkout/...",
    "status": "UNPAID",
    "expired_time": 1743000000
  }
}

6. Daftar Channel Pembayaran (method)
Beberapa kode channel yang umum digunakan:

Kode	Nama Channel	Tipe	Catatan
BRIVA	BRI Virtual Account	DIRECT	
BCAVA	BCA Virtual Account	DIRECT	
BNIVA	BNI Virtual Account	DIRECT	
MANDIRIVA	Mandiri Virtual Account	DIRECT	
QRIS	QRIS (semua e-wallet)	DIRECT	Tampilkan QR code
GOPAY	GoPay	REDIRECT	User diarahkan ke halaman TriPay
OVO	OVO	REDIRECT	User diarahkan ke halaman TriPay

DIRECT vs REDIRECT: DIRECT = kamu tampilkan sendiri halaman instruksi bayar. REDIRECT = user diarahkan ke halaman pembayaran TriPay (lebih mudah diimplementasi).

7. Menangani Callback (Notifikasi Pembayaran)
Callback adalah notifikasi POST dari server TriPay ke server kamu ketika ada update status transaksi (dibayar, expired, dll).

7.1 Cara Kerja Callback
1.	Pelanggan melakukan pembayaran
2.	Server TriPay mendeteksi pembayaran
3.	TriPay POST data ke callback_url yang kamu daftarkan
4.	Server kamu memvalidasi signature, lalu update status order

7.2 Validasi Signature Callback
WAJIB validasi signature dari TriPay sebelum memproses callback, untuk menghindari request palsu.

tripay.controller.ts
import { Controller, Post, Headers, RawBodyRequest, Req, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { TripayService } from './tripay.service';

@Controller('callback')
export class TripayController {
  constructor(private readonly tripayService: TripayService) {}

  @Post('tripay')
  @HttpCode(200)
  async handleCallback(
    @Headers('x-callback-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.tripayService.processCallback(signature, req.rawBody);
  }
}

tripay.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class TripayService {
  private readonly privateKey = process.env.TRIPAY_PRIVATE_KEY;
  private readonly apiKey    = process.env.TRIPAY_API_KEY;
  private readonly merchantCode = process.env.TRIPAY_MERCHANT_CODE;

  // ── CREATE TRANSACTION ──────────────────────────────────
  async createTransaction(payload: {
    merchantRef: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    items: { sku: string; name: string; price: number; quantity: number }[];
  }) {
    const signature = createHmac('sha256', this.privateKey)
      .update(this.merchantCode + payload.merchantRef + payload.amount)
      .digest('hex');

    const body = {
      method: 'BRIVA',
      merchant_ref: payload.merchantRef,
      amount: payload.amount,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      order_items: payload.items,
      signature,
    };

    const res = await fetch(
      'https://payment.tripay.co.id/api/transaction/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      },
    );

    return res.json();
  }

  // ── VALIDATE CALLBACK ───────────────────────────────────
  processCallback(incomingSignature: string, rawBody: Buffer) {
    const expected = createHmac('sha256', this.privateKey)
      .update(rawBody)
      .digest('hex');

    if (incomingSignature !== expected) {
      throw new BadRequestException('Invalid signature');
    }

    const data = JSON.parse(rawBody.toString());

    if (data.status === 'PAID') {
      // Update status order di database
      // this.orderService.markAsPaid(data.merchant_ref);
    }

    return { success: true };
  }
}

main.ts — Aktifkan rawBody
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,  // <-- WAJIB agar rawBody tersedia di callback
  });
  await app.listen(3000);
}
bootstrap();

7.3 Status Transaksi yang Dikirim via Callback
Status	Arti
UNPAID	Transaksi dibuat, belum dibayar
PAID	Pembayaran berhasil diterima ✅
FAILED	Pembayaran gagal
REFUND	Dana telah direfund
EXPIRED	Melewati batas waktu bayar ⏰

8. Syarat, Ketentuan & Batasan Penting
8.1 Teknis
•	IP server wajib didaftarkan di whitelist Dashboard TriPay → Keamanan API
•	Signature wajib benar di setiap request create transaksi
•	merchant_ref harus UNIK per transaksi — tidak boleh duplikat
•	amount harus integer (bilangan bulat Rupiah, tanpa titik/koma/desimal)
•	expired_time menggunakan Unix Timestamp (integer)
•	Server kamu wajib balas callback dengan HTTP 200, jika tidak TriPay akan retry

8.2 Bisnis & Legal
•	Akun TriPay tidak boleh dipindahtangankan atau dijual ke pihak lain
•	Chargeback berlebihan bisa menyebabkan akun dibekukan
•	Merchant bertanggung jawab penuh atas penipuan dari sisi pelanggan
•	TriPay berhak membekukan akun sewaktu-waktu jika ditemukan pelanggaran

⚠️ Tentang Sandbox: Di mode sandbox, transaksi tidak nyata. Gunakan simulator di Dashboard TriPay untuk mensimulasikan pembayaran berhasil/gagal. Jangan gunakan credential sandbox di production!

9. Alur Integrasi Lengkap (End-to-End)

┌─────────────────────────────────────────────────────────┐
│                   ALUR INTEGRASI TRIPAY                │
├─────────────────────────────────────────────────────────┤
│  1. Daftarkan IP server di Dashboard TriPay             │
│  2. Ambil API Key, Private Key, Merchant Code           │
│  3. Generate signature HMAC-SHA256                      │
│     → HMAC(merchantCode + merchantRef + amount, privKey)│
│  4. POST ke /api/transaction/create                     │
│     dengan header: Authorization: Bearer {API_KEY}      │
│  5. Tampilkan pay_code / redirect ke checkout_url       │
│  6. Tunggu callback dari TriPay (POST ke callback_url)  │
│  7. Validasi signature callback                         │
│  8. Cek status === 'PAID' → update order di database    │
│  9. Balas callback dengan HTTP 200                      │
└─────────────────────────────────────────────────────────┘

10. Checklist Sebelum Go Live
•	✅  IP server sudah didaftarkan di whitelist
•	✅  Menggunakan credential Production (bukan Sandbox)
•	✅  Signature generate dengan benar di setiap transaksi
•	✅  Callback URL bisa diakses publik (bukan localhost)
•	✅  Validasi signature callback sudah diimplementasi
•	✅  Server membalas callback dengan HTTP 200
•	✅  merchant_ref selalu unik per transaksi
•	✅  Sudah tes dengan mode Sandbox terlebih dahulu

📖 Dokumentasi Resmi: https://tripay.co.id/developer

