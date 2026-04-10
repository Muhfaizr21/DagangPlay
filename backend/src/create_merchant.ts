import {
  PrismaClient,
  Role,
  UserStatus,
  MerchantStatus,
  MerchantPlan,
} from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  let merchant = await prisma.user.findUnique({
    where: { email: 'merchant1@dagangplay.com' },
  });

  if (!merchant) {
    const hashedPassword = await require('bcrypt').hash('password123', 10);
    merchant = await prisma.user.create({
      data: {
        email: 'merchant1@dagangplay.com',
        password: hashedPassword,
        name: 'Merchant Pertama',
        role: Role.MERCHANT,
        status: 'ACTIVE',
        referralCode: 'MERCH1',
      },
    });

    // Buat merchant store
    await prisma.merchant.create({
      data: {
        name: 'Toko Merchant Satu',
        slug: 'toko-merchant-satu',
        domain: 'merchant1.dagangplay.com',
        plan: 'PRO',
        status: 'ACTIVE',
        ownerId: merchant.id,
      },
    });
    console.log('Merchant created!');
  } else {
    const hashedPassword = await require('bcrypt').hash('password123', 10);
    await prisma.user.update({
      where: { email: 'merchant1@dagangplay.com' },
      data: { password: hashedPassword, role: Role.MERCHANT },
    });
    console.log('Merchant updated!');
  }
  console.log('Use email: merchant1@dagangplay.com | password: password123');
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
