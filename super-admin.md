 SUPER ADMIN DAGANGPLAY
Pengelola penuh seluruh ekosistem platform DagangPlay
1.1 Dashboard Utama
•	Ringkasan revenue: hari ini, bulan ini, tahun ini (total & per sumber)
•	Total transaksi real-time: sukses, gagal, pending, diproses
•	Jumlah merchant aktif, merchant baru hari ini, merchant expired
•	Total reseller aktif, reseller baru, reseller top performer
•	Total customer terdaftar & customer aktif hari ini
•	Grafik pendapatan interaktif: harian, mingguan, bulanan, tahunan
•	Grafik transaksi per kategori produk (Mobile Legend, FF, PUBG, dll)
•	Top 10 produk terlaris berdasarkan volume & revenue
•	Top 10 merchant berdasarkan omset
•	Top 10 reseller berdasarkan transaksi
•	Status supplier real-time: aktif, maintenance, error
•	Monitor saldo supplier: saldo tersisa & alert jika menipis
•	Alert otomatis: transaksi gagal tinggi, saldo tipis, merchant expired
•	Widget perbandingan: revenue bulan ini vs bulan lalu
•	Map sebaran merchant & reseller seluruh Indonesia
•	Revenue dari SaaS subscription vs revenue dari toko sendiri

1.2 Manajemen Merchant
•	List semua merchant dengan filter: status, plan, tanggal daftar, omset
•	Approve / reject pendaftaran merchant baru dengan notifikasi otomatis
•	Suspend merchant (sementara) dengan alasan & log waktu
•	Ban merchant permanen dengan dokumentasi pelanggaran
•	Aktifkan kembali merchant yang sudah suspend/ban
•	Lihat detail merchant: profil, omset, jumlah reseller, riwayat transaksi
•	Upgrade / downgrade plan merchant (FREE → STARTER → PRO → ENTERPRISE)
•	Perpanjang masa aktif plan merchant secara manual
•	Override harga produk khusus untuk merchant tertentu
•	Login as merchant (impersonate) untuk debugging & support
•	Reset password merchant
•	Kirim notifikasi / pesan langsung ke merchant
•	Lihat semua reseller di bawah merchant
•	Export data merchant ke Excel / CSV
•	Riwayat perubahan status merchant + siapa yang mengubah

1.3 Manajemen Produk & Kategori
•	CRUD kategori produk dengan nested sub-kategori
•	Upload ikon & gambar kategori
•	Atur urutan tampilan kategori (drag & drop)
•	Aktif / nonaktif kategori
•	CRUD produk baru (nama, deskripsi, thumbnail, banner, instruksi)
•	CRUD SKU / varian produk (86 Diamond, 172 Diamond, dll)
•	Set harga dasar (base price) dari supplier
•	Set harga jual default platform
•	Sinkronisasi produk otomatis dari supplier (Digiflazz)
•	Sinkronisasi manual: update harga & stok sekarang
•	Aktif / nonaktif / maintenance produk
•	Set produk sebagai Featured / Popular
•	Atur urutan produk di halaman
•	Jadwal maintenance produk (set waktu mulai & selesai)
•	Riwayat perubahan harga produk (siapa, kapan, berapa)
•	Manajemen server / region per game (ML server 1–999)
•	Monitor stok produk real-time
•	Duplikasi produk yang sudah ada

1.4 Manajemen Supplier
•	CRUD data supplier (Digiflazz, Voucherku, PotatoBoy, APIGames)
•	Konfigurasi API: URL, API Key, API Secret per supplier
•	Monitor status supplier: aktif, maintenance, error
•	Monitor saldo supplier real-time
•	Top up saldo ke supplier dengan riwayat lengkap
•	Riwayat perubahan saldo supplier
•	Log semua request & response ke supplier (untuk debugging)
•	Atur supplier utama & backup per produk (failover otomatis)
•	Test koneksi API supplier
•	Alert email/WA jika saldo supplier menipis (threshold custom)
•	Statistik success rate per supplier
•	Switch supplier aktif tanpa downtime

1.5 Manajemen User
•	List semua user dengan filter: role, status, tanggal, saldo
•	Detail user: profil, riwayat transaksi, mutasi saldo, login history
•	Suspend / ban / aktifkan user
•	Reset password user
•	Verifikasi akun manual (email / KTP)
•	Tambah saldo manual (adjustment) dengan alasan & log
•	Kurangi saldo manual dengan alasan & log
•	Login as user (impersonate) untuk debugging
•	Lihat semua sesi login aktif user
•	Force logout semua sesi user
•	Export data user ke Excel / CSV
•	Merge akun duplikat
•	Riwayat perubahan data user

1.6 Manajemen Transaksi
•	List semua transaksi seluruh platform dengan filter lengkap
•	Filter: status, merchant, produk, reseller, tanggal, nominal, payment method
•	Detail transaksi: request supplier, response supplier, log lengkap
•	Retry transaksi gagal secara manual
•	Refund transaksi: kembalikan saldo ke user
•	Tandai transaksi sebagai fraud
•	Override status transaksi (dengan alasan & log)
•	Lihat log status history setiap transaksi
•	Export laporan transaksi ke Excel / PDF
•	Bulk action: retry / refund / tandai fraud banyak transaksi sekaligus
•	Monitor transaksi pending yang terlalu lama
•	Statistik success rate transaksi per produk / supplier

1.7 Manajemen Keuangan
•	List semua deposit dari seluruh platform
•	Konfirmasi deposit manual (upload bukti transfer)
•	Tolak deposit dengan alasan
•	Filter deposit: status, merchant, user, tanggal, jumlah
•	List semua withdrawal dari seluruh platform
•	Proses / tolak withdrawal
•	Upload bukti transfer withdrawal
•	Laporan keuangan harian / bulanan / tahunan
•	Revenue dari transaksi toko DagangPlay sendiri
•	Revenue dari subscription merchant (SaaS)
•	Breakdown biaya & keuntungan per produk
•	Rekonsiliasi saldo: saldo user vs database vs supplier
•	Export laporan keuangan ke Excel / PDF

1.8 Manajemen Komisi & Reseller
•	Set aturan komisi global (flat / persentase)
•	Set komisi per kategori produk
•	Set komisi per produk spesifik
•	Set komisi berbeda untuk reseller vs merchant
•	Definisi level reseller: Bronze, Silver, Gold, Platinum, Diamond
•	Set syarat naik level: min transaksi, min revenue
•	Set bonus komisi per level
•	Monitor komisi pending belum settle
•	Settle komisi manual ke saldo reseller
•	Settle komisi bulk (banyak reseller sekaligus)
•	Laporan MLM commission multi-level
•	Visualisasi pohon downline reseller
•	Riwayat naik/turun level reseller

1.9 Manajemen Promo & Diskon
•	CRUD promo code global (berlaku di semua merchant)
•	CRUD promo code khusus per merchant
•	Tipe promo: diskon flat, diskon persentase, cashback
•	Set target promo: semua produk, kategori tertentu, SKU tertentu
•	Set target user: semua, customer saja, reseller saja
•	Set kuota penggunaan promo
•	Set periode aktif promo (tanggal mulai & selesai)
•	Monitor jumlah penggunaan promo real-time
•	Aktif / nonaktif promo seketika
•	Laporan efektivitas promo (total diskon yang diberikan)
•	Export data penggunaan promo

1.10 Manajemen Subscription SaaS
•	List semua invoice berlangganan seluruh merchant
•	Konfirmasi pembayaran subscription manual
•	Tolak pembayaran dengan alasan
•	Upgrade / downgrade plan merchant secara manual
•	Perpanjang plan merchant tanpa pembayaran (gratis / reward)
•	Set fitur yang tersedia per plan (FREE, STARTER, PRO, ENTERPRISE)
•	Kirim reminder invoice jatuh tempo otomatis (H-7, H-3, H-1)
•	Suspend akses merchant yang tidak bayar subscription
•	Laporan pendapatan SaaS per bulan / tahun
•	Statistik churn rate merchant
•	Export semua data invoice & subscription

1.11 Manajemen Konten Platform
•	CRUD banner: Hero, Sidebar, Popup, Footer
•	Upload gambar banner dengan preview
•	Set link tujuan banner
•	Set periode tayang banner
•	Atur urutan & prioritas banner
•	Monitor klik banner (click count)
•	CRUD announcement / pengumuman sistem
•	CRUD popup promo
•	Email blast ke semua user / merchant / reseller / customer
•	Jadwal email blast otomatis
•	Push notification massal
•	Template notifikasi: email, WhatsApp, SMS, in-app
•	Personalisasi template dengan variabel ({{nama}}, {{orderId}}, dll)

1.12 Fraud & Keamanan
•	Dashboard fraud: list semua deteksi fraud terbaru
•	Filter fraud berdasarkan risk level: Low, Medium, High, Critical
•	Detail kasus fraud: user, order, alasan, metadata
•	Resolve / dismiss kasus fraud
•	Blacklist IP berbahaya secara manual
•	Hapus / unblacklist IP
•	Monitor login attempts: brute force detection
•	List semua percobaan login gagal per user / IP
•	Block user otomatis jika login gagal > N kali
•	Monitor device terpercaya per user
•	Paksa verifikasi ulang device mencurigakan
•	Audit log seluruh aktivitas admin
•	Filter audit log: aksi, user, entitas, tanggal

1.13 Manajemen Support Ticket
•	List semua tiket dari seluruh merchant & user
•	Filter: status, kategori, prioritas, merchant, tanggal
•	Assign tiket ke staff admin tertentu
•	Balas tiket dengan attachment
•	Escalate tiket ke level lebih tinggi
•	Ubah prioritas tiket
•	Tutup / resolve tiket
•	Reopen tiket yang sudah ditutup
•	Laporan tiket: rata-rata waktu respons, rata-rata waktu selesai
•	Statistik tiket per kategori & status

1.14 Pengaturan Sistem
•	Pengaturan global platform (nama, logo, deskripsi, kontak)
•	Maintenance mode: aktifkan/nonaktifkan dengan pesan kustom
•	Konfigurasi payment gateway: Midtrans, Xendit, Tripay (API key, secret)
•	Konfigurasi channel pembayaran yang aktif (QRIS, VA, e-wallet, dll)
•	Konfigurasi supplier aktif & failover
•	Konfigurasi notifikasi: SMTP email, WhatsApp API, SMS gateway
•	Set batas minimum deposit & withdrawal
•	Set biaya withdrawal (flat / persentase)
•	Set komisi default reseller
•	Set batas maksimal promo
•	Konfigurasi fitur per plan subscription
•	Manajemen tim admin (tambah, edit, hapus staff admin)
•	Set role & permission per staff admin
•	System health log: uptime, error rate, response time
•	Job queue monitoring: lihat antrian background task
•	Retry failed job secara manual
