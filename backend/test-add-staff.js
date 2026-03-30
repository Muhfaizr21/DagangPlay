const axios = require('axios');
async function run() {
    try {
        // We know the db has a superadmin. What's the password? "password123"?
        // Instead, let's just create a quick direct DB script using PG since Prisma script failed
        const { Client } = require('pg');
        const client = new Client({ connectionString: 'postgresql://muhfaiizr:admin@localhost:5432/dagangplay?schema=public' });
        await client.connect();
        const res = await client.query("SELECT * FROM \"User\" WHERE role = 'SUPER_ADMIN' LIMIT 1");
        console.log(res.rows[0]);
        await client.end();
    } catch (e) { console.error(e); }
}
run();
