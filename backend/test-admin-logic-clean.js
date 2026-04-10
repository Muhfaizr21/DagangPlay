const axios = require('axios');
const fs = require('fs');

async function simulate() {
    let log = '=== HASIL AUDIT LOGIKA ADMIN PANEL ===\n\n';
    let token = '';

    try {
        const loginRes = await axios.post('http://localhost:3001/api/auth/admin/login', {
            email: 'superadmin@dagangplay.com',
            password: 'DagangPlay123!'
        });
        token = loginRes.data.access_token;
        log += '✅ [Auth/Login] Berhasil. Token didapatkan.\n';
    } catch (e) {
        log += '❌ [Auth/Login] Gagal: ' + (e.response?.status || e.message) + '\n';
        fs.writeFileSync('audit-result.txt', log);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const tests = [
        { name: 'Dashboard/Stats Algoritma', url: 'http://localhost:3001/admin/dashboard/stats' },
        { name: 'Manajemen Data Merchant', url: 'http://localhost:3001/admin/merchants' },
        { name: 'Struktur Data Produk', url: 'http://localhost:3001/admin/products' },
        { name: 'Konektivitas Digiflazz/Supplier', url: 'http://localhost:3001/admin/suppliers' },
        { name: 'Riwayat Transaksi Caching', url: 'http://localhost:3001/admin/transactions' },
        { name: 'CMS & Konten Banner', url: 'http://localhost:3001/admin/content/banners' }
    ];

    for (let t of tests) {
        try {
            const res = await axios.get(t.url, { headers });
            const dataLength = Array.isArray(res.data.data) ? res.data.data.length : (res.data.data ? 1 : 0);
            log += `✅ [${t.name}] Berjalan. Status 200 OK. Menarik ${dataLength} data (atau objek terstruktur).\n`;
        } catch (e) {
            log += `❌ [${t.name}] Gagal: API Error (Status ${e.response?.status || e.message})\n`;
        }
    }

    fs.writeFileSync('audit-result.txt', log);
}

simulate();
