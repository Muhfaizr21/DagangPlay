
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true, email: true, role: true, name: true, status: true }
    });
    console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
