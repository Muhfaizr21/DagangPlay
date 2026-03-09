"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    let merchant = await prisma.user.findUnique({
        where: { email: 'merchant1@dagangplay.com' }
    });
    if (!merchant) {
        merchant = await prisma.user.create({
            data: {
                email: 'merchant1@dagangplay.com',
                password: 'password123',
                name: 'Merchant Pertama',
                role: client_1.Role.MERCHANT,
                status: 'ACTIVE',
                referralCode: 'MERCH1',
            }
        });
        await prisma.merchant.create({
            data: {
                name: 'Toko Merchant Satu',
                slug: 'toko-merchant-satu',
                domain: 'merchant1.dagangplay.com',
                plan: 'PRO',
                status: 'ACTIVE',
                ownerId: merchant.id,
            }
        });
        console.log('Merchant created!');
    }
    else {
        await prisma.user.update({
            where: { email: 'merchant1@dagangplay.com' },
            data: { password: 'password123', role: client_1.Role.MERCHANT }
        });
        console.log('Merchant updated!');
    }
    console.log('Use email: merchant1@dagangplay.com | password: password123');
}
main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
//# sourceMappingURL=create_merchant.js.map