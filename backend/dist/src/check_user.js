"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkUser() {
    const users = await prisma.user.findMany({
        where: { email: { contains: 'superadmin' } }
    });
    console.log('--- USER CHECK START ---');
    console.log(JSON.stringify(users, null, 2));
    console.log('--- USER CHECK END ---');
    process.exit();
}
checkUser();
//# sourceMappingURL=check_user.js.map