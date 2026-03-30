const axios = require('axios');
async function run() {
    try {
        const loginRes = await axios.post('http://localhost:3001/api/auth/admin/login', {
            email: 'superadmin@dagangplay.com',
            password: 'DagangPlay123!'
        });

        const token = loginRes.data.access_token || loginRes.data.token || loginRes.data.data?.access_token;
        console.log("Token:", typeof token);

        const addRes = await axios.post('http://localhost:3001/admin/settings/staff', {
            name: "Test Staff",
            email: "staff_test2@test.com",
            password: "password123",
            status: "ACTIVE",
            permissions: ["manage_products"]
        }, { headers: { Authorization: `Bearer ${token}` } });

        console.log("Add Staff Success", addRes.data);
    } catch (e) {
        console.error("Add Staff Failed:", e.response?.data || e.message);
    }
}
run();
