DAGANGPLAY
Platform SaaS Voucher & Top Up Games
#1 Indonesia
ANALISIS SISTEM LENGKAP
Super Admin  •  Merchant  •  Reseller  •  Customer
Skala 100% Komplit — Fitur, Alur, Akses, MCP & Analisis Bisnis
Versi 1.0  |  2025  |  CONFIDENTIAL
 
RINGKASAN EKSEKUTIF
Overview Platform DagangPlay
Visi & Misi Platform
DagangPlay adalah platform SaaS (Software as a Service) untuk penjualan voucher dan top up games yang beroperasi dengan model multi-tenant. Platform ini memungkinkan siapapun untuk membuka toko voucher games sendiri dengan infrastruktur yang sudah tersedia, tanpa perlu membangun sistem dari nol.
Visi: Menjadi platform distribusi voucher games terbesar dan terpercaya di Indonesia dengan ekosistem reseller yang kuat dan sistem yang transparan.

Arsitektur Bisnis
Komponen	Peran	Model Bisnis	Revenue
DagangPlay Induk	Pemilik Platform	SaaS Provider + Toko Resmi	Subscription + Margin Transaksi
Merchant	Pemilik Toko	White-label Reseller	Margin Harga Jual
Reseller	Agen Penjual	Komisi per Transaksi	Komisi + MLM
Customer	Pembeli Akhir	End User	-
Supplier	Penyedia Produk	Digiflazz, Voucherku dll	Harga Grosir

Statistik Target Platform
Metrik	Target 6 Bulan	Target 1 Tahun	Target 3 Tahun
Total Merchant	50	500	5.000
Total Reseller	500	10.000	100.000
Total Customer	5.000	100.000	2.000.000
Transaksi/Hari	1.000	50.000	500.000
Revenue/Bulan	Rp 50 Juta	Rp 500 Juta	Rp 10 Miliar
Produk Tersedia	50+	100+	200+
 
BAB 1 — SUPER ADMIN
Penguasa penuh seluruh ekosistem DagangPlay
1.1 Identitas & Scope Akses
Atribut	Detail
Role	SUPER_ADMIN
Jumlah Akun	Terbatas (hanya tim inti DagangPlay)
Scope Akses	FULL ACCESS — seluruh data platform tanpa filter
Bisa Impersonate	Ya — bisa login sebagai user/merchant manapun
Bisa Override	Ya — bisa ubah data, harga, status apapun
Multi Admin	Ya — bisa ada beberapa Super Admin dengan permission berbeda
Audit Trail	Semua aksi Super Admin dilog di AuditLog

1.2 Alur Kerja Harian Super Admin
1
Monitor Dashboard	2
Cek Alert	3
Proses Deposit/WD	4
Approve Merchant	5
Handle Fraud	6
Laporan

Rutinitas Pagi (07.00 - 09.00):
•	Cek dashboard: revenue kemarin vs target
•	Monitor saldo semua supplier (Digiflazz dll)
•	Cek transaksi gagal semalam — retry jika perlu
•	Proses withdrawal yang masuk semalam
•	Konfirmasi deposit manual yang pending
•	Review merchant baru yang menunggu approval
Rutinitas Siang (09.00 - 17.00):
•	Handle support ticket yang di-escalate dari merchant
•	Review kasus fraud yang terdeteksi sistem
•	Proses upgrade/downgrade plan merchant
•	Sync harga produk dari supplier jika ada perubahan
•	Monitoring real-time transaksi platform
Rutinitas Malam (17.00 - 22.00):
•	Review laporan harian platform
•	Set jadwal konten: banner & promo esok hari
•	Cek health system: server, queue, database
•	Settle komisi reseller yang sudah jatuh tempo
•	Backup review laporan keuangan

1.3 Modul & Fitur Lengkap Super Admin
A. Dashboard & Analytics
•	Real-time revenue counter: hari ini, bulan ini, YTD
•	Total transaksi live: sukses / gagal / pending / processing
•	Jumlah merchant: aktif, expired, suspended, pending approval
•	Jumlah reseller: aktif, baru hari ini, top performer
•	Jumlah customer: total, aktif hari ini, new register
•	Grafik revenue interaktif: harian, mingguan, bulanan, tahunan
•	Revenue breakdown: toko DagangPlay sendiri vs SaaS subscription
•	Grafik transaksi per kategori produk (ML, FF, PUBG, dll)
•	Top 10 produk terlaris: volume & revenue
•	Top 10 merchant: omset terbesar
•	Top 10 reseller: transaksi terbanyak
•	Map sebaran merchant & reseller seluruh Indonesia
•	Status supplier real-time: aktif/maintenance/error
•	Saldo supplier tersisa + alert threshold
•	Widget perbandingan: bulan ini vs bulan lalu (growth %)
•	Conversion rate: visitor → transaksi
•	Average order value per kategori
•	Failed transaction rate per supplier
B. Manajemen Merchant
•	List semua merchant: filter status, plan, tanggal, omset, region
•	Detail merchant: profil lengkap, statistik, tim, reseller
•	Approve merchant baru dengan review dokumen
•	Reject dengan alasan + notifikasi otomatis ke merchant
•	Suspend sementara dengan batas waktu + alasan
•	Ban permanen dengan dokumentasi pelanggaran
•	Reaktivasi merchant yang suspended/banned
•	Upgrade/downgrade plan (FREE→STARTER→PRO→ENTERPRISE)
•	Perpanjang plan tanpa pembayaran (manual override)
•	Override harga produk khusus untuk merchant tertentu
•	Login as merchant (impersonate) untuk debugging
•	Kirim notifikasi personal ke merchant
•	Reset password merchant
•	Export data semua merchant ke Excel/CSV
•	Riwayat semua perubahan status merchant + siapa yang ubah
•	Lihat semua reseller di bawah merchant tertentu
•	Set limit transaksi harian per merchant
C. Manajemen Produk & Supplier
•	CRUD kategori dengan nested sub-kategori tak terbatas
•	CRUD produk: nama, slug, deskripsi, thumbnail, banner, instruksi
•	CRUD SKU/varian: nama, harga beli, harga jual, stok, kode supplier
•	Sinkronisasi produk otomatis dari Digiflazz (jadwal + manual)
•	Set harga dasar (base price) dan harga jual default
•	Riwayat perubahan harga: kapan, oleh siapa, berapa
•	Aktif/nonaktif/maintenance per produk atau SKU
•	Jadwal maintenance dengan tanggal mulai & selesai
•	Set produk Featured, Popular, New
•	Atur urutan produk di halaman katalog
•	Manajemen server/region game (ML server 1-999, dll)
•	CRUD supplier: API URL, key, secret, status
•	Monitor saldo supplier real-time + top up saldo
•	Log semua request/response ke supplier untuk debugging
•	Set supplier utama & backup per SKU (failover otomatis)
•	Test koneksi API supplier
•	Alert jika saldo supplier < threshold yang ditentukan
•	Switch supplier aktif tanpa downtime
D. Manajemen Transaksi & Keuangan
•	List semua transaksi platform dengan filter ultra-lengkap
•	Filter: status, merchant, reseller, produk, SKU, tanggal, nominal, payment method, supplier
•	Detail transaksi: log lengkap request→supplier→response→status
•	Retry transaksi gagal manual (pilih supplier berbeda jika perlu)
•	Override status transaksi dengan alasan & log
•	Refund ke saldo user dengan catatan
•	Tandai transaksi fraud + lock user otomatis
•	Bulk action: retry/refund/fraud banyak transaksi sekaligus
•	List deposit: filter status, merchant, user, tanggal, jumlah
•	Konfirmasi deposit manual + upload bukti
•	Tolak deposit dengan alasan + notifikasi
•	List withdrawal: filter status, user, tanggal, bank
•	Proses withdrawal: approve + upload bukti transfer
•	Tolak withdrawal dengan alasan
•	Rekonsiliasi saldo: database vs saldo aktual supplier
•	Laporan keuangan harian/bulanan/tahunan
•	Breakdown revenue: margin transaksi vs subscription SaaS
•	Export laporan keuangan Excel/PDF
E. Manajemen Komisi, Reseller & MLM
•	Set aturan komisi global (flat/persentase)
•	Set komisi per kategori produk
•	Set komisi per SKU spesifik
•	Set komisi berbeda untuk reseller vs merchant
•	Definisi level reseller: Bronze, Silver, Gold, Platinum, Diamond
•	Set syarat naik level: min transaksi, min revenue per bulan
•	Set bonus komisi per level
•	Set komisi MLM multi-level (level 1: 3%, level 2: 1.5%, level 3: 0.5%)
•	Visualisasi pohon downline reseller
•	Monitor komisi pending belum settle
•	Settle komisi manual per reseller
•	Settle komisi bulk semua reseller sekaligus
•	Riwayat naik/turun level reseller
•	Laporan MLM: total komisi per level
F. Fraud & Keamanan
•	Dashboard fraud: list deteksi terbaru dengan risk level
•	Filter fraud: Low/Medium/High/Critical, status, tanggal
•	Detail kasus fraud: user, order, alasan, metadata, IP
•	Resolve/dismiss kasus fraud dengan catatan
•	Blacklist IP: tambah, hapus, lihat semua IP terblacklist
•	Monitor login attempts: brute force detection per user/IP
•	Force logout semua sesi user mencurigakan
•	Block user otomatis jika login gagal > N kali
•	Whitelist device terpercaya per user
•	Audit log: filter aksi, user, entitas, tanggal, IP
•	Alert otomatis jika ada pola transaksi mencurigakan
•	Rate limit monitoring: user yang hit limit terlalu sering
G. Manajemen Konten & Marketing
•	CRUD banner: Hero, Sidebar, Popup, Footer
•	Set periode tayang + link tujuan + tracking klik
•	CRUD announcement sistem global
•	CRUD popup promo dengan targeting
•	Email blast ke seluruh user/merchant/reseller/customer
•	Push notification massal dengan targeting
•	Template notifikasi: email, WhatsApp, SMS, in-app
•	Personalisasi template: {{nama}}, {{orderId}}, {{amount}}
•	Jadwal blast otomatis
•	Statistik open rate & click rate email
H. Pengaturan Sistem & Infrastruktur
•	Pengaturan global: nama platform, logo, kontak, deskripsi
•	Maintenance mode: on/off dengan pesan kustom
•	Konfigurasi Midtrans & Xendit: API key, secret, mode sandbox/live
•	Aktif/nonaktif payment channel global
•	Konfigurasi SMTP email, WhatsApp API, SMS gateway
•	Set minimum deposit & withdrawal
•	Set biaya withdrawal (flat/persentase)
•	Set limit transaksi harian per role
•	Konfigurasi komisi default
•	Set fitur yang tersedia per plan subscription
•	Manajemen tim admin: tambah, edit, set permission, hapus
•	Job queue monitoring: lihat antrian, retry failed job
•	System health: uptime, error rate, response time, DB performance
•	Backup database manual

1.4 MCP (Module Control Panel) Super Admin
MCP adalah peta kontrol yang menggambarkan akses penuh Super Admin ke setiap modul sistem
Modul	Create	Read	Update	Delete	Override	Export
User Management	✅	✅	✅	✅	✅	✅
Merchant Management	✅	✅	✅	✅	✅	✅
Product & SKU	✅	✅	✅	✅	✅	✅
Supplier	✅	✅	✅	✅	✅	✅
Order & Transaksi	✅	✅	✅	✅	✅	✅
Payment & Deposit	✅	✅	✅	✅	✅	✅
Withdrawal	✅	✅	✅	✅	✅	✅
Balance & Saldo	✅	✅	✅	✅	✅	✅
Komisi & MLM	✅	✅	✅	✅	✅	✅
Promo & Voucher	✅	✅	✅	✅	✅	✅
Banner & Konten	✅	✅	✅	✅	✅	✅
Subscription SaaS	✅	✅	✅	✅	✅	✅
Support Ticket	✅	✅	✅	✅	✅	✅
Fraud Detection	✅	✅	✅	✅	✅	✅
Audit Log	❌	✅	❌	❌	❌	✅
System Setting	✅	✅	✅	✅	✅	✅
API Key & Webhook	✅	✅	✅	✅	✅	✅
Analytics & Report	✅	✅	✅	❌	❌	✅
 
BAB 2 — MERCHANT
Pemilik toko voucher dengan branding & domain sendiri
2.1 Identitas & Scope Akses
Atribut	Detail
Role	MERCHANT
Cara Daftar	Daftar di DagangPlay → isi form → tunggu approval Super Admin
Scope Data	TERBATAS — hanya data di dalam toko mereka sendiri (merchantId)
Bisa Lihat Data Merchant Lain	❌ Tidak bisa sama sekali
Punya Tim Staff	✅ Bisa tambah Admin & Staff dengan permission granular
Custom Domain	✅ Bisa hubungkan domain sendiri (topupgue.com dll)
White-label	✅ Logo, warna, banner bisa dikustomisasi
Bayar Subscription	✅ Wajib bayar untuk plan berbayar
Bisa Impersonate	❌ Tidak bisa

2.2 Perbedaan Plan Merchant
Fitur	FREE	STARTER	PROFESSIONAL	ENTERPRISE
Harga/Bulan	Rp 0	Rp 99.000	Rp 249.000	Custom
Max Reseller	10	100	1.000	Unlimited
Custom Domain	❌	✅	✅	✅
Custom Branding	Terbatas	✅	✅	✅
API Access	❌	❌	✅	✅
Webhook	❌	❌	✅	✅
Dedicated Support	❌	❌	❌	✅
White-label App	❌	❌	❌	✅
Custom Komisi	❌	✅	✅	✅
Analytics Lanjut	Basic	Standard	Advanced	Full
Staff Akun	1	3	10	Unlimited

2.3 Alur Onboarding Merchant Baru
1
Daftar Form	2
Verifikasi Email	3
Lengkapi Profil	4
Submit Review	5
Approved Admin	6
Setup Toko	7
Go Live

Waktu review oleh Super Admin: maksimal 1x24 jam kerja. Merchant mendapat notifikasi email + WhatsApp.

2.4 Modul & Fitur Lengkap Merchant
A. Dashboard Toko
•	Revenue toko real-time: hari ini, bulan ini, total
•	Total transaksi: sukses/gagal/pending hari ini
•	Saldo toko aktif
•	Jumlah reseller aktif & baru hari ini
•	Total customer terdaftar di toko
•	Grafik penjualan 30 hari terakhir
•	Top produk terlaris di toko
•	Top reseller terlaris bulan ini
•	Perbandingan revenue vs bulan lalu (growth %)
•	Alert: saldo menipis, subscription mau expired, transaksi gagal tinggi
•	Status subscription aktif & sisa hari
B. Manajemen Produk Toko
•	List semua produk dari DagangPlay yang tersedia
•	Aktif/nonaktif produk di toko sendiri
•	Set harga jual custom per SKU (bebas asal > harga dasar)
•	Lihat margin keuntungan otomatis per SKU
•	Atur urutan tampilan produk di toko
•	Set produk sebagai Featured di halaman utama toko
•	Bulk update harga: naikkan/turunkan semua sekaligus
•	Preview tampilan produk di toko customer
•	Filter produk: kategori, status, margin
C. Manajemen Reseller
•	List reseller: filter status, level, join date, omset
•	Detail reseller: profil, saldo, transaksi, komisi earned
•	Approve/reject pendaftaran reseller baru
•	Suspend/ban reseller dengan alasan
•	Reaktivasi reseller
•	Set harga jual khusus per reseller (lebih murah dari default)
•	Set komisi custom per reseller
•	Tambah/kurangi saldo reseller manual + catat alasan
•	Kirim notifikasi ke reseller
•	Lihat struktur downline reseller
•	Export data reseller Excel
•	Statistik reseller: aktif, baru bulan ini, top earner
D. Manajemen Transaksi
•	List transaksi toko dengan filter ultra-lengkap
•	Filter: status, produk, reseller, customer, tanggal, nominal, metode bayar
•	Detail transaksi + log status history
•	Retry transaksi gagal
•	Refund ke saldo user
•	Export laporan transaksi Excel/PDF
•	Bulk export untuk laporan periode
•	Monitor transaksi pending > 10 menit (alert otomatis)
•	Statistik success rate per produk
E. Keuangan Toko
•	Saldo toko real-time
•	Mutasi saldo: semua transaksi in/out
•	Deposit saldo: transfer bank, QRIS, e-wallet
•	Upload bukti deposit manual
•	Riwayat deposit + status
•	Pengajuan withdrawal ke rekening
•	Riwayat withdrawal
•	Laporan pendapatan: breakdown margin + komisi reseller
•	Export laporan keuangan Excel/PDF
F. Komisi & Reward Reseller
•	Set aturan komisi default untuk semua reseller toko
•	Set komisi per kategori produk
•	Set komisi per SKU spesifik
•	Preview komisi reseller per transaksi
•	Monitor total komisi pending
•	Settle komisi ke saldo reseller
•	Settle komisi bulk
•	Laporan komisi: total paid, pending, per reseller
G. Konten & Branding Toko
•	Upload logo, favicon, banner
•	Kustomisasi warna tema (primary, secondary, accent)
•	CRUD banner halaman: hero, sidebar, popup
•	CRUD announcement toko
•	CRUD popup promo
•	Atur teks welcome & deskripsi toko
•	Preview tampilan toko
•	Set SEO: meta title, description, keywords toko
H. Pengaturan & Integrasi
•	Edit profil toko: nama, tagline, deskripsi, kontak
•	Hubungkan custom domain dengan panduan DNS
•	Aktif/nonaktif payment channel di toko
•	Set biaya tambahan per payment method
•	Konfigurasi notifikasi WA otomatis ke customer
•	Template pesan: order masuk, sukses, gagal
•	Generate & kelola API key (plan PRO+)
•	Setup webhook: URL + pilih events
•	Test webhook dengan payload dummy
•	Log pengiriman webhook + retry gagal

2.5 MCP (Module Control Panel) Merchant
Modul	Create	Read	Update	Delete	Override	Export
User di Toko	❌	✅	Terbatas	❌	❌	✅
Reseller di Toko	✅	✅	✅	✅	❌	✅
Produk Toko	❌	✅	Harga	❌	❌	✅
Order Toko	❌	✅	Status	❌	❌	✅
Payment Toko	❌	✅	❌	❌	❌	✅
Saldo & Deposit	✅	✅	❌	❌	❌	✅
Withdrawal	✅	✅	❌	❌	❌	✅
Komisi Reseller	✅	✅	✅	✅	❌	✅
Promo Toko	✅	✅	✅	✅	❌	✅
Banner & Konten	✅	✅	✅	✅	❌	❌
Subscription	❌	✅	Upgrade	❌	❌	✅
Support Ticket	✅	✅	✅	❌	❌	❌
Tim Staff	✅	✅	✅	✅	❌	❌
API Key	✅	✅	✅	✅	❌	❌
Webhook	✅	✅	✅	✅	❌	✅
Analytics Toko	❌	✅	❌	❌	❌	✅
Setting Toko	❌	✅	✅	❌	❌	❌
 
BAB 3 — RESELLER
Agen penjual voucher dengan sistem komisi & downline MLM
3.1 Identitas & Scope Akses
Atribut	Detail
Role	RESELLER
Cara Daftar	Daftar via link merchant → isi form → approve/auto-approve
Scope Data	HANYA data milik sendiri + produk toko tempat bergabung
Bisa Lihat Reseller Lain	❌ Tidak bisa
Bisa Punya Downline	✅ Bisa rekrut reseller lain sebagai downline
Level System	Bronze → Silver → Gold → Platinum → Diamond
Komisi	Per transaksi + bonus level + komisi downline (MLM)
Modal Awal	Deposit saldo (minimum sesuai merchant)
Bisa Top Up Langsung	✅ Bisa proses top up untuk customer

3.2 Sistem Level Reseller
Level	Syarat Transaksi/Bulan	Syarat Revenue/Bulan	Bonus Komisi	Badge
🥉 Bronze	0+	Rp 0+	+0%	Starter
🥈 Silver	50+	Rp 1 Juta+	+2%	Active Seller
🥇 Gold	200+	Rp 5 Juta+	+5%	Top Seller
💎 Platinum	500+	Rp 15 Juta+	+8%	Elite Seller
👑 Diamond	1000+	Rp 50 Juta+	+12%	Legend

3.3 Sistem MLM Komisi Downline
Level Downline	Persentase Komisi	Contoh (transaksi Rp 100rb, margin Rp 5rb)
Level 1 (rekrutan langsung)	30% dari margin	Rp 1.500
Level 2 (rekrutan dari rekrutan)	15% dari margin	Rp 750
Level 3 (3 level ke bawah)	5% dari margin	Rp 250
Komisi MLM hanya berlaku jika downline melakukan transaksi sukses. Bukan money game karena berbasis transaksi nyata.

3.4 Modul & Fitur Lengkap Reseller
A. Dashboard Reseller
•	Saldo utama & saldo bonus real-time
•	Total transaksi hari ini & bulan ini
•	Komisi bulan ini: dari transaksi sendiri + dari downline
•	Komisi pending belum settle
•	Level saat ini + progress ke level berikutnya
•	Bar progress: transaksi & revenue menuju level atas
•	Grafik transaksi & komisi 30 hari terakhir
•	Top 5 produk yang paling sering dijual
•	Jumlah downline aktif
•	Link toko personal untuk dibagikan
•	Quick action: Top Up, Cek Saldo, Deposit
B. Proses Top Up & Transaksi
•	Katalog produk dengan harga reseller (sudah include margin)
•	Search produk berdasarkan nama game
•	Filter produk: kategori, harga, popularitas
•	Input ID game customer & server region
•	Validasi ID game otomatis → tampil nama akun customer
•	Konfirmasi detail sebelum proses
•	Proses transaksi dari saldo reseller
•	Status real-time: pending → processing → sukses
•	Notifikasi sukses/gagal instan
•	Produk favorit untuk akses cepat
•	Quick repeat order dari riwayat
C. Riwayat & Laporan Transaksi
•	List semua transaksi dengan filter: status, produk, tanggal
•	Detail transaksi: ID game, nominal, status, waktu proses
•	Lihat serial number/kode voucher jika ada
•	Download/print bukti transaksi
•	Repeat order 1 klik dari riwayat
•	Laporkan transaksi bermasalah
•	Export riwayat transaksi Excel
•	Statistik personal: success rate, total volume, total profit
D. Manajemen Saldo
•	Saldo utama real-time
•	Saldo bonus (dari cashback, reward, dll)
•	Mutasi saldo lengkap: masuk & keluar
•	Deposit saldo via payment channel toko
•	Upload bukti deposit manual
•	Riwayat deposit + status konfirmasi
•	Pengajuan withdrawal ke rekening bank
•	Riwayat withdrawal
•	Estimasi komisi yang akan diterima bulan ini
E. Komisi & Penghasilan
•	Komisi lifetime total
•	Komisi bulan ini breakdown: per produk, per transaksi
•	Komisi dari downline level 1, 2, 3 terpisah
•	Riwayat komisi pending & yang sudah settle
•	Laporan penghasilan bulanan
•	Grafik komisi 12 bulan terakhir
•	Estimasi penghasilan jika naik ke level berikutnya
•	Bonus komisi berdasarkan level saat ini
F. Manajemen Downline
•	List semua downline yang pernah direkrut
•	Detail downline: level, transaksi, komisi yang dihasilkan untuk kita
•	Link referral unik untuk rekrut downline baru
•	Share link ke WhatsApp, Telegram, Instagram, Tiktok
•	Pohon struktur downline visual (3 level)
•	Statistik: downline aktif vs inactive
•	Total komisi yang sudah diterima dari downline bulan ini
•	Notifikasi saat downline baru bergabung

3.5 MCP (Module Control Panel) Reseller
Modul	Create	Read	Update	Delete	Scope
Profil Sendiri	❌	✅	✅	❌	Data diri sendiri
Top Up / Order	✅	✅	❌	❌	Order milik sendiri
Riwayat Transaksi	❌	✅	❌	❌	Transaksi sendiri
Saldo & Deposit	✅	✅	❌	❌	Saldo sendiri
Withdrawal	✅	✅	❌	❌	Withdrawal sendiri
Komisi	❌	✅	❌	❌	Komisi sendiri
Downline	Rekrut	✅	❌	❌	Downline sendiri
Katalog Produk	❌	✅	❌	❌	Produk toko
Harga Produk	❌	✅ (lihat)	❌	❌	Harga reseller
Promo Aktif	❌	✅	❌	❌	Promo toko
Support Ticket	✅	✅	✅	❌	Tiket sendiri
Notifikasi	❌	✅	✅	✅	Notif sendiri
Level & Badge	❌	✅	❌	❌	Level sendiri
 
BAB 4 — CUSTOMER
Pengguna akhir yang melakukan top up & pembelian voucher
4.1 Identitas & Scope Akses
Atribut	Detail
Role	CUSTOMER
Cara Daftar	Register langsung di toko merchant / via referral reseller
Scope Data	HANYA data transaksi & akun pribadi sendiri
Bisa Lihat User Lain	❌ Tidak bisa
Perlu Login	Bisa top up tanpa login (guest) atau dengan akun
Kelebihan Punya Akun	Riwayat transaksi, saldo, promo, referral reward
Referral	✅ Punya kode referral, dapat bonus jika ajak teman
Review Produk	✅ Bisa beri rating setelah transaksi sukses

4.2 Guest vs Registered Customer
Fitur	Guest (Tanpa Login)	Registered (Punya Akun)
Top Up Produk	✅	✅
Bayar dengan Saldo	❌	✅
Riwayat Transaksi	❌	✅
Kode Promo	Terbatas	✅ Penuh
Cashback ke Saldo	❌	✅
Referral Reward	❌	✅
Notifikasi WA/Email	Manual input	Otomatis
Review Produk	❌	✅
Favorit Game	❌	✅
Quick Repeat Order	❌	✅

4.3 Alur Top Up Customer
1
Pilih Game	2
Pilih Nominal	3
Input ID Game	4
Validasi Nick	5
Pilih Bayar	6
Bayar	7
Terima Item

Proses dari bayar sampai item masuk rata-rata < 30 detik untuk produk otomatis. Maksimal 5 menit untuk produk semi-manual.

4.4 Modul & Fitur Lengkap Customer
A. Katalog & Browsing
•	Halaman beranda: banner promo, game populer, produk baru
•	Katalog semua game dengan thumbnail & kategori
•	Search game: real-time autocomplete
•	Filter: kategori, platform (Mobile, PC, Console)
•	Halaman detail game: deskripsi, cara top up, semua nominal
•	Harga jelas per nominal dengan perbandingan
•	Badge: Terlaris, Promo, Stok Terbatas, Baru
•	Rekomendasi game berdasarkan riwayat beli
•	Game favorit untuk akses cepat dari beranda
•	Panduan cara top up per game (teks + video)
B. Proses Top Up
•	Pilih game & nominal yang diinginkan
•	Input ID game & server (dropdown server jika ada)
•	Validasi ID otomatis: muncul nama karakter/akun
•	Preview detail: apa yang akan diterima
•	Konfirmasi sebelum bayar
•	Pilih metode bayar: saldo, QRIS, transfer, e-wallet
•	Input kode promo/voucher diskon
•	Lihat total setelah diskon real-time
•	Proses pembayaran (redirect ke payment gateway)
•	Status real-time: pending → processing → sukses
•	Notifikasi sukses via in-app + email + WhatsApp
•	Item langsung masuk ke akun game
C. Riwayat & Akun
•	List riwayat transaksi dengan filter: status, tanggal, produk
•	Detail transaksi: produk, nominal, ID game, status, waktu
•	Download/screenshot bukti transaksi
•	Repeat order 1 klik
•	Laporkan transaksi bermasalah → buat tiket
•	Saldo digital & saldo bonus real-time
•	Mutasi saldo lengkap
•	Top up saldo: QRIS, transfer, e-wallet
•	Riwayat deposit
D. Promo, Review & Referral
•	List promo aktif dengan syarat & ketentuan
•	Input kode promo saat checkout
•	Cashback otomatis ke saldo bonus
•	Kode referral unik untuk ajak teman
•	Bonus reward jika teman daftar & transaksi
•	Riwayat penggunaan promo
•	Beri rating & ulasan setelah transaksi sukses
•	Upload screenshot bukti ulasan
•	Baca ulasan dari customer lain sebelum beli

4.5 MCP (Module Control Panel) Customer
Modul	Create	Read	Update	Delete	Scope
Profil Sendiri	❌	✅	✅	❌	Data diri sendiri
Top Up / Order	✅	✅	❌	❌	Order sendiri saja
Riwayat Transaksi	❌	✅	❌	❌	Transaksi sendiri
Saldo & Deposit	✅	✅	❌	❌	Saldo sendiri
Katalog Produk	❌	✅	❌	❌	Semua produk toko
Promo & Voucher	❌	✅	❌	❌	Promo aktif toko
Review Produk	✅	✅	✅	✅	Review sendiri
Referral	❌	✅	❌	❌	Referral sendiri
Support Ticket	✅	✅	✅	❌	Tiket sendiri
Favorit Game	✅	✅	✅	✅	Favorit sendiri
Notifikasi	❌	✅	✅	✅	Notif sendiri
 
BAB 5 — MASTER MCP MATRIX
Peta lengkap akses semua role ke setiap modul sistem
5.1 Matrix Akses Komprehensif
Modul / Fitur	Super Admin	Merchant	Reseller	Customer
Dashboard Platform	✅ Full	❌	❌	❌
Dashboard Toko	✅ All	✅ Toko Sendiri	❌	❌
Dashboard Personal	✅ All	✅	✅	✅
User Management	✅ Full CRUD	Reseller di toko	❌	❌
Merchant Management	✅ Full CRUD	Profil sendiri	❌	❌
Produk Katalog	✅ Full CRUD	Aktif/Harga	Lihat	Lihat
SKU & Harga	✅ Full CRUD	Set harga toko	Lihat harga	Lihat harga
Supplier	✅ Full CRUD	❌	❌	❌
Order Platform	✅ All	Order toko	Order sendiri	Order sendiri
Payment	✅ All	Payment toko	❌	Bayar sendiri
Deposit	✅ All	Deposit toko	Deposit sendiri	Deposit sendiri
Withdrawal	✅ All	WD toko	WD sendiri	❌
Saldo Platform	✅ All	Saldo toko	Saldo sendiri	Saldo sendiri
Komisi Rules	✅ Full CRUD	Set untuk reseller	Lihat komisi sendiri	❌
MLM / Downline	✅ Monitor all	Monitor reseller	Kelola downline	❌
Promo Global	✅ Full CRUD	❌	❌	Pakai promo
Promo Toko	✅ Full CRUD	✅ Full CRUD	❌	Pakai promo
Banner & Konten	✅ Global	✅ Toko sendiri	❌	Lihat
Subscription	✅ All	Lihat & bayar	❌	❌
Invoice	✅ All	Invoice sendiri	❌	❌
Support Ticket	✅ All	Ticket toko	Ticket sendiri	Ticket sendiri
Review Produk	✅ Moderate	✅ Moderate	❌	✅ CRUD sendiri
API Key	✅ All	✅ Toko sendiri	❌	❌
Webhook	✅ All	✅ Toko sendiri	❌	❌
Fraud Detection	✅ Full	❌	❌	❌
Audit Log	✅ All	Log toko	❌	❌
System Setting	✅ Full	Setting toko	❌	❌
Analytics	✅ Platform	✅ Toko	✅ Personal	❌
Notifikasi	✅ Kirim all	✅ Kirim ke toko	Terima	Terima
Impersonate	✅ Semua role	❌	❌	❌
 
BAB 6 — ANALISIS BISNIS & ALUR UANG
Revenue model, alur transaksi, dan proyeksi bisnis DagangPlay
6.1 Alur Uang Platform
1
Supplier (Digiflazz)	2
DagangPlay (Beli Grosir)	3
Merchant (Markup)	4
Reseller (Markup)	5
Customer (Bayar)

Contoh Alur Harga Nyata (86 Diamond ML):
Pihak	Harga	Margin	Keterangan
Supplier (Digiflazz)	Rp 18.000	-	Harga beli DagangPlay dari supplier
DagangPlay	Rp 19.000	Rp 1.000 (5.5%)	Harga base platform + margin DagangPlay
Merchant	Rp 19.500	Rp 500 (2.6%)	Merchant markup untuk customer & reseller
Reseller	Rp 19.200	Rp 200 (1%)	Harga khusus reseller dari merchant
Customer	Rp 19.500	-	Harga yang dibayar customer akhir
Keuntungan Total	-	Rp 1.500	Dibagi: DagangPlay + Merchant + Komisi Reseller

6.2 Sumber Revenue DagangPlay
Sumber Revenue	Model	Estimasi/Bulan (6 bulan)
Margin transaksi toko DagangPlay	Rp 500-2.000 per transaksi	Rp 25 Juta
Subscription merchant FREE→STARTER	Rp 99.000/merchant/bulan	Rp 4,9 Juta (50 merchant)
Subscription merchant PRO	Rp 249.000/merchant/bulan	Rp 2,5 Juta (10 merchant)
Biaya withdrawal reseller	0.5% per withdrawal	Rp 2 Juta
Biaya payment gateway (pass)	Rp 2.000-5.000 per transaksi	Rp 10 Juta
TOTAL ESTIMASI		Rp 44,4 Juta/bulan

6.3 Analisis Risiko & Mitigasi
Risiko	Level	Mitigasi
Supplier down / maintenance	HIGH	Multi-supplier + failover otomatis + backup manual
Transaksi fraud massal	HIGH	Fraud detection AI + IP blacklist + limit transaksi
Saldo supplier habis	MEDIUM	Alert threshold + top up otomatis + monitoring 24/7
Merchant kabur dengan saldo reseller	MEDIUM	Escrow saldo + audit trail + verifikasi KTP
Payment gateway bermasalah	MEDIUM	Multi gateway (Midtrans + Xendit) + manual fallback
Server down / overload	MEDIUM	Auto-scaling + load balancer + monitoring uptime
Data breach / kebocoran data	HIGH	Enkripsi data + audit reguler + penetration testing
Persaingan harga dengan platform lain	LOW	Diferensiasi fitur SaaS + layanan reseller terbaik

6.4 Roadmap Pengembangan
Fase	Periode	Target	Fitur Utama
MVP	Bulan 1-3	50 merchant, 500 reseller	Core transaksi, auth, dashboard basic
Growth	Bulan 4-6	200 merchant, 5.000 reseller	MLM, analytics, webhook, API
Scale	Bulan 7-12	1.000 merchant, 50.000 reseller	Mobile app, microservice, AI fraud
Enterprise	Tahun 2+	5.000 merchant, 500.000 reseller	White-label mobile, B2B API, IPO prep
 
BAB 7 — RINGKASAN FINAL
Kesimpulan analisis sistem DagangPlay 100% komplit
7.1 Statistik Sistem
Metrik Sistem	Jumlah
Total Tabel Database	64 Tabel
Total Model Prisma	64 Model
Total Role User	4 Role (Super Admin, Merchant, Reseller, Customer)
Total Modul Sistem	45+ Modul
Total Fitur	~325 Fitur
Total Endpoint API (estimasi)	150+ Endpoint REST
Backend Framework	NestJS + TypeScript
Frontend Framework	Next.js 14+ (App Router)
Database	PostgreSQL + Prisma ORM
Cache & Queue	Redis + BullMQ
Payment Gateway	Midtrans + Xendit
Supplier Voucher	Digiflazz (utama) + backup
Notifikasi	WhatsApp API + Email + Push Notification
Deployment	Vercel (FE) + Railway/VPS (BE)
Skala Target Awal	Startup → Series A Ready

7.2 Perbandingan Akses Final
Kemampuan	Super Admin	Merchant	Reseller	Customer
Lihat data semua user	✅	❌	❌	❌
Kelola merchant lain	✅	❌	❌	❌
Set harga produk	✅ Global	✅ Toko	❌	❌
Proses transaksi	✅	✅	✅	✅
Punya downline	N/A	✅ Reseller	✅ Sub-reseller	❌
Terima komisi	N/A	✅ Margin	✅ Komisi+MLM	❌
Custom domain	✅	✅	❌	❌
API access	✅	Plan PRO+	❌	❌
Impersonate user	✅	❌	❌	❌
Override data	✅	❌	❌	❌
Bayar subscription	N/A	✅	❌	❌
Jumlah modul akses	45+ Modul	13 Modul	10 Modul	8 Modul
Jumlah fitur akses	~325 Fitur	~90 Fitur	~60 Fitur	~45 Fitur

DagangPlay — Built to Scale, Designed to Win
64 Tabel  •  4 Role  •  45 Modul  •  ~325 Fitur  •  Series A Ready
© 2025 DagangPlay. Dokumen ini bersifat rahasia untuk penggunaan internal tim DagangPlay.
