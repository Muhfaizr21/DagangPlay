require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Generating Real Simulation Data with 100% Verified Enums ---');

  try {
    const merchant = await prisma.merchant.findFirst();
    const user = await prisma.user.findFirst();

    if (!merchant || !user) {
      console.error('❌ Error: Tidak ditemukan Merchant atau User.');
      return;
    }

    // 1. REFUND/PAYMENT Dispute (Urgent)
    await prisma.supportTicket.create({
      data: {
        userId: user.id,
        merchantId: merchant.id,
        subject: 'DISPUTE: Pesanan #ORD-9921 Gagal Kirim tapi Saldo Terpotong',
        description: 'Pesanan dari supplier Digiflazz stuck di PENDING tapi saldo platform sudah terpotong Rp 25.000.',
        category: 'REFUND',
        priority: 'URGENT',
        status: 'OPEN',
      }
    });

    // 2. ORDER Dispute (High)
    await prisma.supportTicket.create({
      data: {
        userId: user.id,
        merchantId: merchant.id,
        subject: 'Sengketa Harga Anti-Loss: Harga Supplier Naik Mendadak',
        description: 'Sistem otomatis menghentikan pesanan karena harga di pusat naik mendadak.',
        category: 'ORDER',
        priority: 'HIGH',
        status: 'OPEN'
      }
    });

    console.log('✅ Success: 2 Data Real (Disputes) Berhasil di-Inject ke Database!');
  } catch (err) {
    console.error('❌ Database Error:', err.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
  });
