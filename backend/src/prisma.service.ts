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
    get category() { return this.client.category; }
    get product() { return this.client.product; }
    get productSku() { return this.client.productSku; }
    get supplier() { return this.client.supplier; }
    get supplierLog() { return this.client.supplierLog; }
    get supplierBalanceHistory() { return this.client.supplierBalanceHistory; }
    get userSession() { return this.client.userSession; }
    get balanceTransaction() { return this.client.balanceTransaction; }
    get deposit() { return this.client.deposit; }
    get withdrawal() { return this.client.withdrawal; }
    get orderStatusHistory() { return this.client.orderStatusHistory; }
    get fraudDetection() { return this.client.fraudDetection; }
    get commission() { return this.client.commission; }
    get mLMCommission() { return this.client.mLMCommission; }
    get resellerLevel() { return this.client.resellerLevel; }
    get downlineTree() { return this.client.downlineTree; }
    get promoCode() { return this.client.promoCode; }
    get promoUsage() { return this.client.promoUsage; }
    get invoice() { return this.client.invoice; }
    get subscriptionHistory() { return this.client.subscriptionHistory; }
    get systemSetting() { return this.client.systemSetting; }
    get banner() { return this.client.banner; }
    get announcement() { return this.client.announcement; }
    get emailCampaign() { return this.client.emailCampaign; }
    get iPBlacklist() { return this.client.iPBlacklist; }
    get supportTicket() { return this.client.supportTicket; }
    get supportTicketReply() { return this.client.supportTicketReply; }
    get loginAttempt() { return this.client.loginAttempt; }
    get jobQueue() { return this.client.jobQueue; }
    get notificationTemplate() { return this.client.notificationTemplate; }

    async onModuleInit() {
        await this.client.$connect();
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
    }
}
