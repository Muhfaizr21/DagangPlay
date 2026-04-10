import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Starting Password Migration ---');

  const users = await prisma.user.findMany({
    where: {
      // Find passwords that don't start with bcrypt prefix $2
      OR: [
        { password: { not: { startsWith: '$2' } } },
        { password: 'GUEST_NO_LOGIN' },
      ],
    },
  });

  console.log(
    `Found ${users.length} users with potentially plain text passwords.`,
  );

  let updatedCount = 0;
  for (const user of users) {
    // If it looks like it's already hashed (starts with $2), skip it
    if (user.password && user.password.startsWith('$2')) {
      continue;
    }

    const hashedPassword = await bcrypt.hash(
      user.password || 'password123',
      10,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    updatedCount++;
    if (updatedCount % 10 === 0) {
      console.log(`Updated ${updatedCount} users...`);
    }
  }

  console.log(`Successfully migrated ${updatedCount} users' passwords.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
