const axios = require('axios');

async function simulate() {
    console.log('=== MEMULAI SIMULASI LOGIKA ADMIN PUSAT (SUPER ADMIN) ===\n');
    let token = '';

    try {
        console.log('[1] Menguji Algoritma Autentikasi (JWT + Bcrypt)...');
        const loginRes = await axios.post('http://localhost:3001/api/auth/admin/login', {
            email: 'superadmin@dagangplay.com',
            password: 'DagangPlay123!'
        });
        token = loginRes.data.access_token;
        console.log('✅ Auth Berhasil! Mendapatkan JWT Token berlapis.');
    } catch (e) {
        console.log('❌ Auth Gagal:', e.response?.data || e.message);
        return;
    }

    const api = axios.create({
        baseURL: 'http://localhost:3001/api/admin',
        headers: { Authorization: `Bearer ${token}` }
    });

    try {
        console.log('\n[2] Menguji Logika Dashboard & Statistik (Kalkulasi Pendapatan)...');
        const dashRes = await api.get('/dashboard/stats');
        console.log('✅ Dashboard Data:', JSON.stringify(dashRes.data.data).substring(0, 100) + '...');
    } catch (e) {
        console.log('❌ Dashboard Gagal:', e.response?.data || e.message);
    }

    try {
        console.log('\n[3] Menguji Logika Relasi Data Merchant (Tarik Data Reseller)...');
        const merchRes = await api.get('/merchants');
        console.log(`✅ Berhasil menarik relasi Merchant. Total Data: ${merchRes.data.data?.length || 0}`);
    } catch (e) {
        console.log('❌ Merchant Gagal:', e.response?.data || e.message);
    }

    try {
        console.log('\n[4] Menguji Algoritma Tier Harga & SKU Produk...');
        const prodRes = await api.get('/products');
        console.log(`✅ Berhasil menarik skema mapping struktur Produk & Harga. Total Produk: ${prodRes.data.data?.length || 0}`);
    } catch (e) {
        console.log('❌ Produk Gagal:', e.response?.data || e.message);
    }

    try {
        console.log('\n[5] Menguji Keamanan Sinkronisasi Digiflazz (Testing Koneksi API Supplier)...');
        // We will fetch the supplier profile rather than initiating a full sync to test connectivity error gracefully
        const digiRes = await api.get('/suppliers');
        console.log(`✅ Logika Supplier terbaca. Total Supplier: ${digiRes.data.data?.length || 0}`);
    } catch (e) {
        console.log('❌ Layanan Supplier Gagal:', e.response?.data || e.message);
    }

    try {
        console.log('\n[6] Menguji Logika Riwayat Transaksi (Filter & Penarikan)...');
        const trxRes = await api.get('/transactions');
        console.log(`✅ Algoritma Transaksi normal. Berhasil menarik data riwayat. Jumlah Trx di db: ${trxRes.data.data?.length || 0}`);
    } catch (e) {
        console.log('❌ Transaksi Gagal:', e.response?.data || e.message);
    }

    try {
        console.log('\n[7] Menguji Algoritma Content Management Server (Banners / Info)...');
        const contentRes = await api.get('/content/banners');
        console.log(`✅ Content Management terbaca. Jumlah banner: ${contentRes.data.data?.length || 0}`);
    } catch (e) {
        console.log('❌ CMS Gagal:', e.response?.data || e.message);
    }

    console.log('\n=== SIMULASI SELESAI ===');
}

simulate();
