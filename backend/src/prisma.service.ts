import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (PrismaClient as any)({ adapter });
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    private client: PrismaClient;

    constructor() {
        if (!prismaInstance) {
            prismaInstance = createPrismaClient();
        }
        this.client = prismaInstance;
    }

    get $transaction() {
        return this.client.$transaction.bind(this.client);
    }

    // Expose all Prisma model accessors
    get user() { return this.client.user; }
    get order() { return this.client.order; }
    get merchant() { return this.client.merchant; }
    get auditLog() { return this.client.auditLog; }

    async onModuleInit() {
        await this.client.$connect();
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
    }
}
