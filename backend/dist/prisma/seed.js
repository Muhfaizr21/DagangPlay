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
    console.log('🌱 Starting seeder...');
    const existingSuperAdmin = await prisma.user.findUnique({
        where: { email: 'superadmin@dagangplay.com' },
    });
    if (existingSuperAdmin) {
        console.log('✅ Super Admin account already exists.');
        return;
    }
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@dagangplay.com',
            password: 'dagangplayadmin2026',
            name: 'Super Admin DagangPlay',
            username: 'dagangplay_official',
            phone: '081234567890',
            role: client_1.Role.SUPER_ADMIN,
            status: client_1.UserStatus.ACTIVE,
            isVerified: true,
            isOfficial: true,
        },
    });
    console.log(`👤 Super Admin created: ${superAdmin.email}`);
    const officialMerchant = await prisma.merchant.create({
        data: {
            name: 'DagangPlay Official Store',
            slug: 'dagangplay',
            description: 'Official store of DagangPlay Platform',
            contactEmail: 'support@dagangplay.com',
            status: client_1.MerchantStatus.ACTIVE,
            plan: client_1.MerchantPlan.ENTERPRISE,
            isOfficial: true,
            ownerId: superAdmin.id,
        },
    });
    console.log(`🏪 Official Merchant created: ${officialMerchant.name}`);
    await prisma.user.update({
        where: { id: superAdmin.id },
        data: { merchantId: officialMerchant.id },
    });
    await prisma.merchantMember.create({
        data: {
            merchantId: officialMerchant.id,
            userId: superAdmin.id,
            role: client_1.MerchantMemberRole.OWNER,
        },
    });
    console.log('🔗 Super Admin linked to Official Merchant.');
    console.log('🎉 Seeding finished.');
    console.log('--------------------------------------------------');
    console.log('📧 Login Email    : superadmin@dagangplay.com');
    console.log('🔑 Login Password : dagangplayadmin2026');
    console.log('--------------------------------------------------');
}
main()
    .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map