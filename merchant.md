BAB 2 — MERCHANT DASHBOARD
Pemilik toko voucher dengan branding & domain sendiri

2.1 Dashboard Utama
•	Revenue toko hari ini, bulan ini, total keseluruhan
•	Total transaksi: sukses, gagal, pending hari ini
•	Total reseller aktif di toko
•	Total customer terdaftar di toko
•	Saldo toko real-time
•	Grafik penjualan harian 30 hari terakhir
•	Grafik penjualan per produk
•	Top 10 produk terlaris di toko bulan ini
•	Top 10 reseller terlaris bulan ini
•	Perbandingan revenue bulan ini vs bulan lalu
•	Alert: transaksi gagal tinggi, saldo menipis, subscription mau expired
•	Notifikasi terbaru: transaksi baru, deposit masuk, tiket baru
•	Status subscription: plan aktif & tanggal expired

2.2 Manajemen Produk Toko
•	List semua produk tersedia dari DagangPlay
•	Aktif / nonaktif produk di toko (tidak tampil ke customer)
•	Set harga jual custom per SKU produk
•	Lihat margin keuntungan otomatis per produk
•	Atur urutan tampilan produk di toko
•	Set produk sebagai featured / highlight di halaman utama
•	Filter produk: kategori, status, harga
•	Bulk update harga: naikkan/turunkan harga semua produk sekaligus
•	Preview tampilan produk di toko

2.3 Manajemen Reseller
•	List semua reseller toko dengan filter: status, level, join date
•	Detail reseller: profil, saldo, total transaksi, komisi
•	Approve / reject pendaftaran reseller baru
•	Suspend / ban reseller
•	Aktifkan kembali reseller
•	Set harga jual khusus per reseller (lebih murah dari harga default)
•	Set komisi custom per reseller
•	Tambah / kurangi saldo reseller manual (dengan alasan)
•	Kirim pesan / notifikasi ke reseller
•	Lihat pohon downline reseller
•	Export data reseller ke Excel
•	Statistik reseller: aktif, inactive, baru bulan ini

2.4 Manajemen Transaksi
•	List semua transaksi toko dengan filter lengkap
•	Filter: status, produk, reseller, customer, tanggal, nominal
•	Detail transaksi: produk, pembeli, reseller, log status
•	Retry transaksi gagal
•	Proses refund transaksi ke saldo user
•	Export laporan transaksi Excel / PDF
•	Bulk export untuk periode tertentu
•	Monitor transaksi pending terlalu lama
•	Statistik success rate transaksi toko

2.5 Manajemen Keuangan Toko (Two-Ledger System)
•	Dashboard Saldo Terpisah (Visualisasi Ganda):
    - Escrow / Pending Balance: Dana masuk dari Customer, namun status Settlement di pihak Payment Gateway (Misal Tripay) masih belum cair (biasanya H+1 / H+2).
    - Available Balance / Saldo Tersedia: Dana riil bersih yang siap sedia ditarik / dicairkan (Withdrawal) ke bank merchant.
•	Estimasi Pencairan Dana (Settlement Schedule): Tampilan list / kalender yang memprediksi kapan dana 'Pending/Escrow' hari ini akan di-rekap berubah menjadi 'Available'.
•	Riwayat Mutasi Saldo Terperinci (Ledger Movement): deposit, penjualan, komisi reseller, potongan biaya layanan (MDR Gateway), potongan admin platform, penarikan (withdrawal).
•	Pengajuan deposit saldo (Add funds): transfer bank, QRIS, e-wallet
•	Konfigurasi Penarikan Otomatis (Auto-Payout System): Sistem autopilot tarik dana ke Rekening Bank merchant secara periodik (Mingguan/Bulanan) jika telah melewati limit minimal.
•	Upload bukti transfer deposit
•	Riwayat semua deposit: status, tanggal, jumlah
•	Pengajuan withdrawal ke rekening bank
•	Riwayat semua withdrawal
•	Laporan pendapatan harian / bulanan
•	Breakdown pendapatan: dari transaksi langsung vs komisi reseller
•	Export laporan keuangan Excel / PDF

2.6 Manajemen Komisi Reseller
•	Set aturan komisi default untuk semua reseller
•	Set komisi per kategori produk
•	Set komisi per produk spesifik
•	Preview komisi yang akan didapat reseller per transaksi
•	Monitor total komisi pending belum dibayar
•	Settle komisi ke saldo reseller secara manual
•	Settle komisi bulk semua reseller sekaligus
•	Laporan komisi: total dibayar, total pending per reseller
•	Riwayat settle komisi

2.7 Manajemen Promo Toko
•	CRUD promo code toko sendiri
•	Tipe promo: diskon flat, diskon %, cashback
•	Set target: semua user, customer saja, reseller saja
•	Set target produk: semua, kategori tertentu, SKU tertentu
•	Set kuota & periode aktif promo
•	Monitor penggunaan promo real-time
•	Aktif / nonaktif promo
•	Laporan total diskon yang sudah diberikan

2.8 Manajemen Konten & Tampilan Toko
•	Upload logo, favicon, dan banner utama toko
•	Kustomisasi warna tema toko (primary, secondary, accent)
•	CRUD banner halaman utama (hero, sidebar, popup)
•	Set periode tayang banner
•	CRUD announcement / pengumuman toko
•	CRUD popup promo toko
•	Atur teks welcome & deskripsi toko
•	Preview tampilan toko sebelum publish
•	Atur menu navigasi toko

2.9 Pengaturan Toko
•	Edit profil toko: nama, tagline, deskripsi, kontak
•	Hubungkan custom domain ke toko (contoh: topupdewa.com)
•	Verifikasi domain dengan DNS record
•	Aktif / nonaktif payment channel per toko
•	Set biaya tambahan per payment method
•	Konfigurasi notifikasi WhatsApp otomatis ke customer
•	Konfigurasi email otomatis: konfirmasi order, sukses, gagal
•	Set pesan custom untuk berbagai status transaksi
•	Generate & kelola API key untuk integrasi eksternal
•	Konfigurasi webhook (URL endpoint + events yang dipilih)
•	Test webhook dengan payload dummy
•	Riwayat pengiriman webhook & statusnya

2.10 Manajemen Tim Toko
•	Tambah staff / admin toko baru
•	Set role staff: Admin (akses penuh) / Staff (akses terbatas)
•	Set permission granular per staff (modul apa saja yang bisa diakses)
•	Edit data & permission staff
•	Nonaktifkan / hapus staff
•	Riwayat aktivitas setiap staff (audit log)

2.11 Support Ticket Toko
•	List semua tiket dari customer & reseller toko
•	Filter: status, kategori, prioritas, tanggal
•	Balas tiket dengan attachment
•	Assign tiket ke staff tertentu
•	Ubah prioritas tiket
•	Resolve / tutup tiket
•	Statistik tiket: rata-rata waktu respons & selesai
•	Template balasan cepat (quick reply)

2.12 Laporan & Analytics
•	Laporan penjualan: harian, mingguan, bulanan, tahunan
•	Laporan per produk / kategori
•	Laporan per reseller
•	Laporan per customer
•	Grafik tren penjualan interaktif
•	Perbandingan periode: bulan ini vs bulan lalu
•	Laporan komisi yang sudah dibayar
•	Laporan deposit & withdrawal
•	Export semua laporan: Excel, PDF, CSV

2.13 Subscription & Billing
•	Info plan aktif: nama plan, fitur tersedia, batas kuota
•	Tanggal expired subscription
•	Tombol perpanjang / upgrade plan
•	Perbandingan fitur antar plan
•	Riwayat semua invoice berlangganan
•	Download invoice PDF
•	Status pembayaran invoice: paid, unpaid, overdue
•	Konfirmasi pembayaran manual (upload bukti)

2.14 Integrasi Domain & Keamanan (Whitelabel / SaaS)
•	Domain Setup Checker & Helper: Panduan live-sync menghubungkan custom domain dan checklist indikator sukses A Record & CNAME (misal: topupdewa.com).
•	Status Pemrosesan SSL (Gembok Hijau): Indikator realtime status permintaan sertifikat SSL dan tanggal kedaluwarsa HTTPS.
•	Force HTTPS Routing Config: Toggle 1-klik untuk memaksa semua akses http dialihkan ke https secara presisi.

2.15 Pusat API, Developer & Integrasi Webhook
•	Generate & Revoke API Credentials (Public & Private Key): Manajemen identitas pengembang toko.
•	API Secret Signature Generator: Kunci rahasia HMAC SHA-256 bagi merchant yang mau memvalidasi header request dari sistem (Anti Hacking/Spoofing URL).
•	Konfigurasi Endpoint Webhook URL: Seting alamat tujuan (callback) kemana sistem internal akan mengirim informasi transaksi lunas.
•	Webhook Delivery Event Logs: Tabel live log history pengiriman pesan Webhook DagangPlay -> URL toko. Isinya: Timestamp, URL Target, Request Body JSON, Response Body HTTP Code (200, 404, 500, Timeout).
•	1-Click Resend Webhook: Tombol "Retry Payload" spesifik di tiap log error bilamana server merchant mati/gangguan, bisa ditrigger uang ketika server Merchant normal lagi.
•	Monitor Latency Respons Webhook Toko: Indikator merah/hijau kecepatan server/hosting merchant saat dihantam trigger webhooks.
