"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    Zap,
    Coins,
    TrendingUp,
    ChevronRight,
    CheckCircle2,
    MonitorPlay,
    Layout,
    Search,
    ArrowRight,
    ChevronDown,
    Star,
    XCircle,
    Check,
    Gamepad2
} from 'lucide-react';
import PriceCatalog from '@/components/PriceCatalog';


// --- MOCK DATA FOR PLANS ---
// Nanti ini bisa diambil dari API settingan Super Admin
const RESELLER_PLANS = [
    {
        id: 'PRO',
        name: 'Pro',
        price: 150000,
        features: ['Keuntungan hingga 15%', 'Support Prioritas', 'Website Subdomain'],
        monthlyProfitEst: 1500000
    },
    {
        id: 'LEGEND',
        name: 'Legend',
        price: 350000,
        features: ['Keuntungan hingga 25%', 'Support VIP 24/7', 'Website Domain Sendiri', 'Akses API Dasar'],
        monthlyProfitEst: 4500000
    },
    {
        id: 'SUPREME',
        name: 'Supreme',
        price: 750000,
        features: ['Harga Modal Termurah', 'Support Dedicated Manager', 'Website Domain Sendiri', 'Akses API Full', 'Custom Aplikasi Android'],
        monthlyProfitEst: 12000000
    }
];

const SAMPLE_PRODUCTS = [
    { name: 'Mobile Legends 86 Diamonds', normal: 19500, pro: 18800, legend: 18500, supreme: 18100, img: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png' },
    { name: 'Free Fire 70 Diamonds', normal: 10000, pro: 9500, legend: 9300, supreme: 9000, img: 'https://cdn.unipin.com/images/icon_product_channels/1598282333-icon-ff.png' },
    { name: 'PUBG M 60 UC', normal: 14000, pro: 13500, legend: 13200, supreme: 12800, img: 'https://cdn.unipin.com/images/icon_product_channels/1593414902-icon-pubgm.png' },
];

export default function ResellerLandingPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('PRO');
    const [hargaModal, setHargaModal] = useState(37500);
    const [hargaJual, setHargaJual] = useState(40000);
    const [jumlahPenjualan, setJumlahPenjualan] = useState(20);
    const [sampleProducts, setSampleProducts] = useState<any[]>([]);

    const [billingCycle, setBillingCycle] = useState<'yearly' | 'quarterly'>('yearly');

    const MLBB_148_PRICES: any = {
        pro: 39709,
        legend: 38773,
        supreme: 38023,
        normal: 40646
    };

    // Auto update hargaModal when plan changes (Fixed to MLBB 148)
    useEffect(() => {
        const modal = MLBB_148_PRICES[selectedPlan.toLowerCase()] || MLBB_148_PRICES.pro;
        setHargaModal(modal);
        // Set harga jual default untung dikit biar kalkulator ga kosong
        setHargaJual(Math.ceil(modal * 1.08 / 500) * 500); // Bulatin ke 500 terdekat
    }, [selectedPlan]);


    const [plansConfig, setPlansConfig] = useState<any>({
        PRO: { price: 74917, maxProducts: 50, customDomain: true, multiUser: false, whiteLabel: false, customFeatures: [] },
        LEGEND: { price: 82250, maxProducts: 500, customDomain: true, multiUser: true, whiteLabel: false, customFeatures: [] },
        SUPREME: { price: 99917, maxProducts: 99999, customDomain: true, multiUser: true, whiteLabel: true, customFeatures: [] }
    });

    const getPriceDetails = (yearlyFinalPrice: number) => {
        if (!yearlyFinalPrice) yearlyFinalPrice = 0;

        // Harga yang diinput di Super Admin sekarang dianggap sebagai HARGA TAHUNAN FINAL
        const originalPrice = yearlyFinalPrice * 2.5; // Tampilkan mock harga asli yang dicoret (lebih mahal)

        if (billingCycle === 'yearly') {
            return {
                original: originalPrice,
                discounted: yearlyFinalPrice,
                label: '/ tahun',
                monthlyEquivalent: yearlyFinalPrice / 12
            };
        } else {
            // Jika 3 bulan, anggap harganya 30% dari harga tahunan final
            const quarterlyPrice = Math.round(yearlyFinalPrice * 0.3);
            return {
                original: originalPrice * 0.3,
                discounted: quarterlyPrice,
                label: '/ 3 bulan',
                monthlyEquivalent: quarterlyPrice / 3
            };
        }
    };

    // Fetch plan config dynamically
    useEffect(() => {
        setIsMounted(true);
        // Coba fetch plan config dari API, jika gagal akan pakai default di atas
        // Tambahkan query parameter timestamp untuk mematikan cache Next.js / Browser
        fetch(`http://localhost:3001/public/subscriptions/plans/features?t=${new Date().getTime()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.PRO) {
                    setPlansConfig(data);
                }
            })
            .catch(() => console.log('Using default plan configuration fallback.'));

        // Fetch sample products
        fetch('http://localhost:3001/public/products/reseller-prices')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setSampleProducts(data);
                    // Set initial harga modal ke produk pertama
                    const first = data[0];
                    const initialModal = first.pro || first.normal || 0;
                    setHargaModal(initialModal);
                    setHargaJual(Math.ceil(initialModal * 1.1 / 100) * 100);
                } else {
                    // Fallback
                    setSampleProducts([
                        { name: 'Mobile Legends 86 Diamonds', normal: 19500, pro: 18800, legend: 18500, supreme: 18100, img: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png' },
                        { name: 'Free Fire 70 Diamonds', normal: 10000, pro: 9500, legend: 9300, supreme: 9000, img: 'https://cdn.unipin.com/images/icon_product_channels/1598282333-icon-ff.png' },
                        { name: 'PUBG M 60 UC', normal: 14000, pro: 13500, legend: 13200, supreme: 12800, img: 'https://cdn.unipin.com/images/icon_product_channels/1593414902-icon-pubgm.png' },
                    ]);
                }
            })
            .catch(() => {
                setSampleProducts([
                    { name: 'Mobile Legends 86 Diamonds', normal: 19500, pro: 18800, legend: 18500, supreme: 18100, img: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png' },
                    { name: 'Free Fire 70 Diamonds', normal: 10000, pro: 9500, legend: 9300, supreme: 9000, img: 'https://cdn.unipin.com/images/icon_product_channels/1598282333-icon-ff.png' },
                    { name: 'PUBG M 60 UC', normal: 14000, pro: 13500, legend: 13200, supreme: 12800, img: 'https://cdn.unipin.com/images/icon_product_channels/1593414902-icon-pubgm.png' },
                ]);
            });
    }, []);


    // Hitung Estimasi Keuntungan
    const profitPerTrx = hargaJual - hargaModal;
    const profitPerBulan = profitPerTrx * jumlahPenjualan * 30; // asumsi 30 hari

    // Safety check utk Hydration Error locale-formatting
    const formattedProfit = isMounted
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(profitPerBulan)
        : `Rp ${profitPerBulan.toString()}`;


    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 py-4 px-6 md:px-12 bg-slate-900 border-b border-white/10 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                        DP
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">
                        DagangPlay
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <a href="#features" className="hover:text-white transition-colors">Testimoni</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Harga Modal</a>
                    <a href="#demo" className="hover:text-white transition-colors">Demo</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/admin/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden md:block">
                        Masuk
                    </Link>
                    <Link href="/reseller/register" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all">
                        Daftar Reseller
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 md:px-12 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
                            Buat <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Web Top Up Otomatis</span> Tidur Pun Cuan Masuk!
                        </h1>
                        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto md:mx-0">
                            Biarkan sistem kami yang bekerja, kamu yang terima profitnya. Tanpa deposit saldo, gak ribet.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                            <a href="#pricing" className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-slate-700 text-white text-lg font-bold hover:bg-slate-800 transition-all text-center">
                                Cek Harga Modal
                            </a>
                            <Link href="/reseller/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-lg font-bold shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all text-center flex items-center justify-center gap-2">
                                Mulai Sekarang <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="mt-12 flex flex-col sm:flex-row items-center gap-12 justify-center md:justify-start border-t border-slate-800 pt-8">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Total Omzet Reseller</p>
                                <p className="text-3xl font-black text-white">Rp<span className="text-4xl">1.928.023.291</span></p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Total Nilai Transaksi</p>
                                <p className="text-3xl font-black text-white">Rp<span className="text-4xl">40 Miliar</span></p>
                            </div>
                        </div>

                        {/* Wall of Fame */}
                        <div className="mt-12 hidden md:block">
                            <p className="text-slate-400 text-sm mb-4">Wall of Fame: Reseller Paling Cuan Bulan Ini 🎖</p>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {[
                                    { name: "Fantasi Gamer", profit: "Rp27.815.726", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fantasi" },
                                    { name: "Arb Store", profit: "Rp24.534.679", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arb" },
                                    { name: "Rolly Store", profit: "Rp18.128.915", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rolly" },
                                    { name: "PHS Top Up", profit: "Rp19.478.850", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=PHS" },
                                ].map((reseller, idx) => (
                                    <div key={idx} className="flex-shrink-0 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-3 rounded-2xl flex items-center gap-3 w-64">
                                        <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden border-2 border-indigo-500">
                                            <img src={reseller.img} alt={reseller.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm truncate">{reseller.name}</p>
                                            <p className="text-emerald-400 font-bold">{reseller.profit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mockup Image Area */}
                    <div className="flex-1 w-full relative perspective-1000 hidden md:block">
                        <div className="relative w-full aspect-video bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden transform -rotate-y-12 rotate-x-6">
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-900 flex flex-col items-center justify-center p-8">
                                <div className="w-full h-8 bg-slate-950 rounded-t-xl border-b border-slate-800 flex items-center px-4 gap-2 absolute top-0 left-0">
                                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                </div>
                                <div className="mt-8 grid grid-cols-4 gap-4 w-full">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="aspect-square bg-slate-700 rounded-xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile mock */}
                        <div className="absolute -bottom-10 -right-10 w-48 h-96 bg-slate-950 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl overflow-hidden transform rotate-12 z-20">
                            <div className="w-full h-full bg-slate-900 p-4">
                                <div className="w-full h-24 bg-indigo-900/50 rounded-xl mb-4"></div>
                                <div className="w-full h-12 bg-slate-800 rounded-lg mb-2"></div>
                                <div className="w-full h-12 bg-slate-800 rounded-lg mb-2"></div>
                                <div className="w-full h-12 bg-slate-800 rounded-lg mb-2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Sistem Otomatis) */}
            <section id="features" className="py-24 bg-white px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Sistem Otomatis yang Kerja Keras Untukmu</h2>
                        <p className="text-lg text-slate-500">Fokus jualan saja. Urusan teknis, server, dan stok produk biar kami yang urus.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-100 transition-colors">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                <Coins className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Tanpa Modal Deposit</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Mulai bisnis tanpa perlu setoran awal. Kamu bisa langsung jualan produk digital tanpa risiko kehilangan modal sepeserpun.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-100 transition-colors">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Bebas Atur Keuntungan</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Tentukan sendiri margin keuntungan yang kamu mau. Mau profit 20%, 50%, atau bahkan 100%? Semua terserah kamu!
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-100 transition-colors">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Terima Beres (All-in-One)</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Website, Domain, Server, hingga Payment Gateway sudah terpasang. Kamu tinggal fokus promosi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demos */}
            <section id="demo" className="py-24 bg-slate-50 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2">WEBSITE DEMO</p>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Jangan Beli Kucing Dalam Karung.<br />Coba Kecanggihan Sistem Kami Sekarang!</h2>
                    <p className="text-lg text-slate-500 mb-16">Rasakan sensasi jadi Owner. Login ke dashboard, atur harga sesuka hati, dan lihat betapa mudahnya mengelola ribuan produk dalam 1 klik.</p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group">
                            <div className="w-full aspect-video bg-indigo-50 rounded-xl mb-6 overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-900/10 backdrop-blur-sm">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl text-indigo-600">
                                        <MonitorPlay className="w-8 h-8 ml-1" />
                                    </div>
                                </div>
                                {/* Placeholder image untuk demo panel */}
                                <div className="absolute inset-0 bg-slate-100 p-4">
                                    <div className="w-full h-8 bg-slate-200 rounded-md mb-4 flex items-center px-4">
                                        <div className="w-20 h-4 bg-slate-300 rounded"></div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-1/4 h-32 bg-slate-200 rounded-lg"></div>
                                        <div className="w-3/4 flex flex-col gap-2">
                                            <div className="w-full h-10 bg-slate-200 rounded-lg"></div>
                                            <div className="w-full h-10 bg-slate-200 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Demo Panel Reseller</h3>
                            <p className="text-slate-500 mb-6">Jelajahi semua fitur menjadi Reseller</p>
                            <Link href="/admin/login" className="inline-flex px-6 py-2.5 rounded-full border-2 border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors items-center gap-2">
                                Login Sebagai Admin <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 group">
                            <div className="w-full aspect-video bg-cyan-50 rounded-xl mb-6 overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-900/10 backdrop-blur-sm">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl text-cyan-600">
                                        <Layout className="w-8 h-8" />
                                    </div>
                                </div>
                                {/* Placeholder image untuk demo web */}
                                <div className="absolute inset-0 bg-slate-900 p-4 flex flex-col pt-8 items-center">
                                    <div className="w-full max-w-sm h-32 bg-slate-800 rounded-xl mb-4 border border-slate-700"></div>
                                    <div className="w-full max-w-sm grid grid-cols-3 gap-2">
                                        <div className="aspect-square bg-slate-800 rounded-lg border border-slate-700"></div>
                                        <div className="aspect-square bg-slate-800 rounded-lg border border-slate-700"></div>
                                        <div className="aspect-square bg-slate-800 rounded-lg border border-slate-700"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Demo Tema Website</h3>
                            <p className="text-slate-500 mb-6">Mulai coba langsung website toko</p>
                            <a href="#" className="inline-flex px-6 py-2.5 rounded-full border-2 border-cyan-600 text-cyan-600 font-bold hover:bg-cyan-50 transition-colors items-center gap-2">
                                Demo Website <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Profit Calculator */}
            <section className="py-24 bg-white px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2">KALKULATOR PROFIT</p>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Coba Hitung Profit Bulanan Kamu!</h2>
                        <p className="text-lg text-slate-500">Harga terbaik yang siap mendukung bisnis top up anda.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Inputs */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <h4 className="font-bold text-slate-700 mb-4">Rencana ingin ambil paket reseller apa?</h4>
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {RESELLER_PLANS.map(plan => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${selectedPlan === plan.id
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm'
                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {plan.name}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Harga Modal Tier {selectedPlan}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-xs">Rp</span>
                                            <input
                                                type="text"
                                                readOnly
                                                value={hargaModal.toLocaleString('id-ID')}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Harga Jual Kamu</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-xs">Rp</span>
                                            <input
                                                type="number"
                                                value={hargaJual}
                                                onChange={(e) => setHargaJual(Number(e.target.value))}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                        <span>Target Penjualan Perhari</span>
                                        <span className="text-indigo-600 font-black px-3 py-1 bg-indigo-50 rounded-lg">{jumlahPenjualan} Order</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1" max="500"
                                        value={jumlahPenjualan}
                                        onChange={(e) => setJumlahPenjualan(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                                        <span>Santai (1)</span>
                                        <span>Maksimal (500)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Result */}
                        <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-8 shadow-inner relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/50 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

                            <div className="relative z-10 text-center mb-8">
                                <h3 className="text-lg font-bold text-slate-700 mb-2">Keuntungan Per Bulan</h3>
                                <div className="text-5xl lg:text-6xl font-black text-indigo-600 tracking-tight">
                                    {formattedProfit}
                                </div>
                                <p className="text-sm text-slate-500 mt-4">Profit kotor estimasi. Belum dikurangi biaya operasional.</p>
                            </div>

                            <div className="flex gap-4 justify-center mb-8">
                                <span className="bg-white text-indigo-600 px-4 py-2 rounded-full text-xs font-bold border border-indigo-100 shadow-sm shadow-indigo-100/50">Dapat Website Siap Pakai</span>
                                <span className="bg-white text-indigo-600 px-4 py-2 rounded-full text-xs font-bold border border-indigo-100 shadow-sm shadow-indigo-100/50">Tanpa Deposit</span>
                            </div>

                            <Link href="/reseller/register" className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-lg text-center shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform">
                                Daftar Sekarang
                            </Link>

                        </div>
                    </div>
                </div>
            </section>

            {/* Subscription Plans Section */}
            <section id="subscription" className="py-32 bg-slate-900 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-12 flex justify-center">
                        <div className="bg-slate-800/80 backdrop-blur-md p-1.5 rounded-full inline-flex font-bold text-sm border border-slate-700 shadow-xl relative z-20">
                            <button
                                onClick={() => setBillingCycle('quarterly')}
                                className={`px-6 py-3 rounded-full transition-all duration-300 relative ${billingCycle === 'quarterly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Paket 3 Bulan
                                {billingCycle !== 'quarterly' && <span className="absolute -top-3 -right-2 text-[10px] bg-slate-700 text-indigo-400 px-2 py-0.5 rounded-full border border-slate-600 shadow-sm">-20%</span>}
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-3 rounded-full transition-all duration-300 relative ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Paket 1 Tahun
                                <span className={`absolute -top-3 -right-2 text-[10px] px-2 py-0.5 rounded-full border shadow-sm transition-colors ${billingCycle === 'yearly' ? 'bg-amber-400 text-amber-900 border-amber-500' : 'bg-amber-400/20 text-amber-500 border-amber-500/50'}`}>-60%</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-center mb-20">
                        <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-6 py-2 rounded-full text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6 ring-2 ring-white/20">🔥 BEBAS BIAYA DOMAIN SELAMANYA!</span>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Pilih Senjata<br /><span className="text-indigo-400">Bisnismu Sekarang</span></h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">Kami transparan dengan harga modal. Semua sistem siap pakai 100%.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">

                        {/* Pro Plan */}
                        <div className="bg-slate-800/40 backdrop-blur-sm rounded-[2rem] border border-slate-700 hover:border-emerald-500/50 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 group relative mt-8 lg:mt-0">
                            <div className="h-1.5 w-full bg-slate-700 group-hover:bg-emerald-500 transition-colors"></div>
                            <div className="p-8 flex-1 flex flex-col relative z-10">
                                <h3 className="text-2xl font-black text-white mb-2">Pro</h3>
                                <p className="text-sm text-slate-400 mb-8 border-b border-slate-700 pb-8">{plansConfig.PRO.description || "Mulai bisnis dengan mudah!"}</p>

                                <div className="mb-8">
                                    <p className="text-slate-500 line-through text-sm font-semibold mb-1">Rp {getPriceDetails(plansConfig.PRO.price).original.toLocaleString('id-ID')}</p>
                                    <div className="flex items-baseline gap-1.5 mb-2">
                                        <span className="text-4xl lg:text-5xl font-black text-white">Rp {Math.round(getPriceDetails(plansConfig.PRO.price).discounted).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-emerald-400 font-medium">{getPriceDetails(plansConfig.PRO.price).label} <span className="text-slate-500 text-xs ml-2">(Setara Rp {Math.round(getPriceDetails(plansConfig.PRO.price).monthlyEquivalent).toLocaleString('id-ID')} / bln)</span></p>
                                </div>

                                <Link href="/reseller/register" className="flex justify-center w-full py-4 rounded-xl bg-slate-800 text-emerald-400 font-bold border border-slate-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all mb-10 text-lg">Daftar Sekarang</Link>

                                <div className="space-y-5 text-sm text-slate-300 font-medium">
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> <span>Akses Maksimal <b className="text-white">{plansConfig.PRO.maxProducts.toLocaleString('id-ID')}</b> Produk</span></p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.PRO.customDomain
                                            ? <><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> <span>Akses Pakai <b className="text-white">Custom Domain</b></span></>
                                            : <><XCircle className="w-5 h-5 text-slate-600 mt-0.5" /> <span className="text-slate-500">Hanya Subdomain</span></>}
                                    </p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.PRO.multiUser
                                            ? <><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> <span>Fitur Multi User (Akun Staff)</span></>
                                            : <><XCircle className="w-5 h-5 text-slate-600 mt-0.5" /> <span className="text-slate-500">Maksimal 1 Akun Admin</span></>}
                                    </p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.PRO.whiteLabel
                                            ? <><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> <span>Full White Label</span></>
                                            : <><XCircle className="w-5 h-5 text-slate-600 mt-0.5" /> <span className="text-slate-500">Tanpa White Label</span></>}
                                    </p>
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> <span>Harga Modal Kategori Pro</span></p>
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> <span>Sistem Auto-Transfer (Tanpa Deposit)</span></p>

                                    {plansConfig.PRO.customFeatures && plansConfig.PRO.customFeatures.map((feat: string, i: number) => (
                                        feat && <p key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> {feat}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Supreme Plan (Highlighted Center) */}
                        <div className="bg-gradient-to-b from-indigo-900 to-slate-900 rounded-[2rem] border-2 border-indigo-500 relative flex flex-col overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)] transform lg:-translate-y-8 z-20">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400"></div>
                            <div className="bg-indigo-600 text-white text-center py-2.5 font-bold text-sm tracking-wider uppercase shadow-md flex items-center justify-center gap-2">
                                <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> Paling Banjir Cuan
                            </div>
                            <div className="p-8 flex-1 flex flex-col relative z-10">
                                <h3 className="text-3xl font-black text-white mb-2">Supreme</h3>
                                <p className="text-sm text-indigo-200 mb-8 border-b border-indigo-800 pb-8">{plansConfig.SUPREME.description || "Fitur terlengkap, untung maksimal!"}</p>

                                <div className="mb-8">
                                    <p className="text-indigo-400/50 line-through text-lg font-semibold mb-1">Rp {getPriceDetails(plansConfig.SUPREME.price).original.toLocaleString('id-ID')}</p>
                                    <div className="flex items-baseline gap-1.5 mb-2">
                                        <span className="text-5xl lg:text-6xl font-black text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200">Rp {Math.round(getPriceDetails(plansConfig.SUPREME.price).discounted).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-indigo-300 font-medium">{getPriceDetails(plansConfig.SUPREME.price).label} <span className="opacity-75 text-xs ml-2">(Setara Rp {Math.round(getPriceDetails(plansConfig.SUPREME.price).monthlyEquivalent).toLocaleString('id-ID')} / bln)</span></p>
                                </div>

                                <Link href="/reseller/register" className="flex justify-center w-full py-4.5 rounded-xl bg-indigo-500 text-white font-black hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02] mb-10 text-xl items-center gap-2">
                                    Daftar Sekarang <Zap className="w-5 h-5" />
                                </Link>

                                <div className="space-y-5 text-sm text-indigo-50 font-medium">
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" /> <span>Akses Maksimal <b className="text-white bg-indigo-500/30 px-2 py-0.5 rounded">{plansConfig.SUPREME.maxProducts.toLocaleString('id-ID')}</b> Produk</span></p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.SUPREME.customDomain
                                            ? <><Check className="w-5 h-5 text-indigo-400 mt-0.5" /> <span>Bebas Pakai <b className="text-white">Custom Domain</b></span></>
                                            : <><XCircle className="w-5 h-5 text-indigo-800 mt-0.5" /> <span className="text-indigo-300">Hanya Subdomain</span></>}
                                    </p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.SUPREME.multiUser
                                            ? <><Check className="w-5 h-5 text-indigo-400 mt-0.5" /> <span>Fitur Multi User (Tambah Akun Staff)</span></>
                                            : <><XCircle className="w-5 h-5 text-indigo-800 mt-0.5" /> <span className="text-indigo-300">Maksimal 1 Akun Admin</span></>}
                                    </p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.SUPREME.whiteLabel
                                            ? <><Check className="w-5 h-5 text-indigo-400 mt-0.5" /> <span className="text-white font-bold">Full White Label Brand Anda</span></>
                                            : <><XCircle className="w-5 h-5 text-indigo-800 mt-0.5" /> <span className="text-indigo-300">Tanpa White Label</span></>}
                                    </p>
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" /> <span className="text-white font-bold underline decoration-indigo-400 underline-offset-4">Harga Modal Paling Murah (VIP)</span></p>
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" /> <span>Sistem Auto-Transfer (Tanpa Deposit)</span></p>

                                    {plansConfig.SUPREME.customFeatures && plansConfig.SUPREME.customFeatures.map((feat: string, i: number) => (
                                        feat && <p key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" /> {feat}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Legend Plan */}
                        <div className="bg-slate-800/40 backdrop-blur-sm rounded-[2rem] border border-slate-700 hover:border-fuchsia-500/50 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-fuchsia-500/10 group relative mt-8 lg:mt-0">
                            <div className="h-1.5 w-full bg-slate-700 group-hover:bg-fuchsia-500 transition-colors"></div>
                            <div className="p-8 flex-1 flex flex-col relative z-10">
                                <h3 className="text-2xl font-black text-white mb-2">Legend</h3>
                                <p className="text-sm text-slate-400 mb-8 border-b border-slate-700 pb-8">{plansConfig.LEGEND.description || "Naik level, untung berlipat!"}</p>

                                <div className="mb-8">
                                    <p className="text-slate-500 line-through text-sm font-semibold mb-1">Rp {getPriceDetails(plansConfig.LEGEND.price).original.toLocaleString('id-ID')}</p>
                                    <div className="flex items-baseline gap-1.5 mb-2">
                                        <span className="text-4xl lg:text-5xl font-black text-white">Rp {Math.round(getPriceDetails(plansConfig.LEGEND.price).discounted).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-fuchsia-400 font-medium">{getPriceDetails(plansConfig.LEGEND.price).label} <span className="text-slate-500 text-xs ml-2">(Setara Rp {Math.round(getPriceDetails(plansConfig.LEGEND.price).monthlyEquivalent).toLocaleString('id-ID')} / bln)</span></p>
                                </div>

                                <Link href="/reseller/register" className="flex justify-center w-full py-4 rounded-xl bg-slate-800 text-fuchsia-400 font-bold border border-slate-600 hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 transition-all mb-10 text-lg">Daftar Sekarang</Link>

                                <div className="space-y-5 text-sm text-slate-300 font-medium">
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-fuchsia-500 flex-shrink-0 mt-0.5" /> <span>Akses Maksimal <b className="text-white">{plansConfig.LEGEND.maxProducts.toLocaleString('id-ID')}</b> Produk</span></p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.LEGEND.customDomain
                                            ? <><Check className="w-5 h-5 text-fuchsia-500 mt-0.5" /> <span>Akses Pakai <b className="text-white">Custom Domain</b></span></>
                                            : <><XCircle className="w-5 h-5 text-slate-600 mt-0.5" /> <span className="text-slate-500">Hanya Subdomain</span></>}
                                    </p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.LEGEND.multiUser
                                            ? <><Check className="w-5 h-5 text-fuchsia-500 mt-0.5" /> <span>Fitur Multi User (Akun Staff)</span></>
                                            : <><XCircle className="w-5 h-5 text-slate-600 mt-0.5" /> <span className="text-slate-500">Maksimal 1 Akun Admin</span></>}
                                    </p>
                                    <p className="flex items-start gap-3">
                                        {plansConfig.LEGEND.whiteLabel
                                            ? <><Check className="w-5 h-5 text-fuchsia-500 mt-0.5" /> <span>Full White Label</span></>
                                            : <><XCircle className="w-5 h-5 text-slate-600 mt-0.5" /> <span className="text-slate-500">Tanpa White Label</span></>}
                                    </p>
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-fuchsia-500 flex-shrink-0 mt-0.5" /> <span>Harga Modal Kategori Legend</span></p>
                                    <p className="flex items-start gap-3"><Check className="w-5 h-5 text-fuchsia-500 flex-shrink-0 mt-0.5" /> <span>Sistem Auto-Transfer (Tanpa Deposit)</span></p>

                                    {plansConfig.LEGEND.customFeatures && plansConfig.LEGEND.customFeatures.map((feat: string, i: number) => (
                                        feat && <p key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-fuchsia-500 flex-shrink-0 mt-0.5" /> {feat}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Dynamic Catalog Section */}
            <div id="pricing" className="bg-slate-50 relative">
                <PriceCatalog />
            </div>

            {/* Amankan Domain Kamu */}
            <section className="py-24 bg-gradient-to-b from-indigo-50 to-white px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2">MULAI HASILKAN CUAN</p>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Amankan Domain Kamu</h2>
                    <p className="text-lg text-slate-500 mb-10">Cek ketersediaan domain impianmu. Jika tersedia, langsung klaim sebelum diambil orang lain.</p>

                    <div className="bg-white p-2 md:p-3 rounded-full border-2 border-indigo-200 shadow-xl shadow-indigo-100 max-w-2xl mx-auto flex flex-col md:flex-row focus-within:border-indigo-500 transition-colors">
                        <div className="flex-1 flex items-center px-4 mb-2 md:mb-0">
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Cek domain kamu di sini..."
                                className="w-full bg-transparent focus:outline-none text-slate-800 font-medium placeholder-slate-400"
                            />
                        </div>
                        <div className="w-full md:w-auto flex">
                            <div className="border-l border-slate-200 px-2 flex items-center bg-slate-50 my-1 ml-1 rounded">
                                <select className="bg-transparent focus:outline-none text-slate-600 font-medium cursor-pointer">
                                    <option>.com</option>
                                    <option>.id</option>
                                    <option>.my.id</option>
                                    <option>.store</option>
                                </select>
                            </div>
                            <button className="ml-2 flex-1 md:flex-none py-3 px-8 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" /> Cari
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-24 bg-white px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2">JANGAN SAMPAI SALAH PILIH</p>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Kenapa Harus Jadi Reseller DagangPlay?</h2>
                        <p className="text-lg text-slate-500">Coba bandingkan sendiri, mana yang lebih murah dan lebih mudah!</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 text-center font-bold text-sm">
                            <div className="p-4 md:p-6 text-left">Komponen Biaya</div>
                            <div className="p-4 md:p-6 bg-red-50 text-red-600 border-x border-slate-200">Bikin Web Sendiri</div>
                            <div className="p-4 md:p-6 bg-indigo-50 text-indigo-600">DagangPlay</div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {[
                                { item: "Gaji Developer per bulan", own: "Rp10.000.000 x 12", dp: "Termasuk" },
                                { item: "Biaya Hosting & Domain", own: "Rp1.000.000", dp: "Termasuk" },
                                { item: "Theme / Template", own: "Rp500.000", dp: "Termasuk" },
                                { item: "Integrasi Payment Gateway", own: "Rp1.000.000", dp: "Termasuk" },
                                { item: "Maintenance & Update", own: "Rp1.000.000", dp: "Termasuk" },
                                { item: "Biaya Teknis Tambahan", own: "Tidak Terduga", dp: "Termasuk" }
                            ].map((row, idx) => (
                                <div key={idx} className="grid grid-cols-3 text-sm md:text-base text-center items-center hover:bg-slate-50 transition-colors">
                                    <div className="p-4 md:px-6 text-left font-medium text-slate-700">{row.item}</div>
                                    <div className="p-4 text-slate-500 border-x border-slate-100 font-medium">
                                        {row.own}
                                    </div>
                                    <div className="p-4 text-slate-800 font-bold flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 hidden sm:block" /> {row.dp}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 bg-slate-900 text-white text-center font-bold text-sm md:text-base">
                            <div className="p-4 md:p-6 text-left">Total Biaya Tahun Pertama</div>
                            <div className="p-4 md:p-6 text-red-400 border-x border-slate-700">± Rp 123.500.000</div>
                            <div className="p-4 md:p-6 text-emerald-400">Rp 0 (Gratis) - Rp 750.000</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Academy / Learning */}
            <section className="py-24 bg-slate-900 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 relative z-10">
                        <p className="text-indigo-400 font-bold tracking-wider uppercase text-sm mb-2">DIAJARIN CARA JUALAN</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Gak Bisa Jualan? Tenang Aja<br />Kami Bimbing Sampai Pecah Telur!</h2>
                        <p className="text-lg text-slate-400">Kami tidak hanya memberikan sistem, tapi juga ilmu marketing agar jualan kamu makin laris manis.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                        {[
                            { title: "Master Branding", desc: "Rahasia bangun brand yang kuat" },
                            { title: "Master Sales", desc: "Strategi closing tanpa pusing" },
                            { title: "Master TikTok", desc: "Jualan laku lewat FYP TikTok" },
                            { title: "Master Instagram", desc: "Optimasi IG untuk topup game" },
                        ].map((modul, idx) => (
                            <div key={idx} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500 transition-all group overflow-hidden relative cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
                                    <MonitorPlay className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 relative z-10">{modul.title}</h3>
                                <p className="text-slate-400 text-sm relative z-10">{modul.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="py-24 bg-slate-50 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-2">APA KATA MEREKA?</p>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Reseller DagangPlay Buktikan Sendiri</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Budi Santoso", role: "Owner TopUp XYZ", text: "Gila sih DagangPlay, marginnya gede banget! Sebulan bisa dapet omset 50jt padahal gw cuma nyebar link di grup mabar." },
                            { name: "Siti Aminah", role: "Pelajar", text: "Awalnya iseng buat jajan, eh keterusan pas tau harganya murah. Prosesnya juga otomatis jadi gak ganggu waktu sekolah." },
                            { name: "Andi Wijaya", role: "Pemilik Warnet", text: "Integrasi sistemnya mantap. Warnet sepi tapi bisnis top up game jalan terus. Supportnya juga super responsif." }
                        ].map((testi, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <div className="flex gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                                </div>
                                <p className="text-slate-600 font-medium leading-relaxed mb-8 italic">"{testi.text}"</p>
                                <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <span className="text-indigo-600 font-bold text-lg">{testi.name[0]}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{testi.name}</p>
                                        <p className="text-sm text-slate-500">{testi.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-white px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Paling Sering Ditanyakan</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Apakah ini beneran gratis?", a: "Ya, kami menyediakan paket FREE (Reseller Normal) selamanya, tanpa biaya pendaftaran." },
                            { q: "Apa bedanya Free dengan Pro/Legend/Supreme?", a: "Paket berbayar akan memberikan kamu Harga Modal yang lebih murah dibanding plan di bawahnya, dan memberikan fitur prioritas." },
                            { q: "Apakah saldo harus deposit dulu?", a: "Tidak. Kamu tidak wajib deposit saldo. Setiap pesanan pelanggan bisa langsung diteruskan dan dibayar per transaksi via Payment Gateway." },
                            { q: "Gimana cara narik keuntungan (withdraw)?", a: "Margin keuntungan dari setiap transaksi akan masuk ke saldo DagangPlay kamu, dan bisa dicairkan (withdraw) ke rekening bank kamu kapan saja." },
                        ].map((faq, idx) => (
                            <details key={idx} className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
                                <summary className="flex items-center justify-between font-bold cursor-pointer p-6 text-slate-800">
                                    <span className="text-lg pr-4">{faq.q}</span>
                                    <span className="transition duration-300 group-open:rotate-180 flex-shrink-0">
                                        <ChevronDown className="w-6 h-6 text-slate-400" />
                                    </span>
                                </summary>
                                <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-200 mx-6 mt-2">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Footer block */}
            <section className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-slate-900 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-slate-900 to-cyan-900 opacity-90"></div>

                <div className="relative z-10 py-24 px-6 text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Siap Memiliki Kerajaan Bisnis Top-Up Mu Sendiri?</h2>
                    <Link href="/reseller/register" className="inline-flex px-10 md:px-12 py-4 md:py-5 rounded-full bg-white text-indigo-600 text-lg md:text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all outline outline-8 outline-white/20 items-center gap-3 group-hover:outline-white/40">
                        Ambil Kesempatan Sekarang <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            <footer className="py-8 border-t border-slate-100 bg-white">
                <div className="max-w-6xl mx-auto px-6 text-center md:flex md:justify-between md:items-center">
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-4 md:mb-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black shadow-lg">
                            DP
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-800">
                            DagangPlay Partner Network
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} DagangPlay Partner Network. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
