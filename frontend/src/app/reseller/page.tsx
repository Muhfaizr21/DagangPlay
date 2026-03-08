"use client";
import { useEffect, useState, useRef } from "react";

// ── Hooks ─────────────────────────────────────────────────────────
function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return { ref, v };
}

// ── Data ──────────────────────────────────────────────────────────
const FAQ_ITEMS = [
    { q: "Apakah pendaftaran reseller benar-benar gratis?", a: "Ya, 100% gratis! Kamu bisa langsung daftar dan mulai berjualan tanpa biaya apapun dengan paket Starter kami." },
    { q: "Berapa modal minimum untuk mulai berjualan?", a: "Dengan paket Starter, kamu cukup deposit saldo minimal Rp 10.000 untuk mulai bertransaksi. Tidak ada biaya pendaftaran." },
    { q: "Bagaimana cara withdraw keuntungan ke rekening?", a: "Keuntungan bisa dicairkan ke rekening bank atau dompet digital (GoPay, OVO, Dana) kapan saja, minimum withdraw Rp 50.000." },
    { q: "Apakah bisa jualan lewat WhatsApp atau media sosial?", a: "Tentu! Kamu bisa bagikan link toko personalmu ke pelanggan, atau download order manual melalui dashboard reseller." },
    { q: "Apakah ada pelatihan atau panduan untuk reseller baru?", a: "Kami menyediakan video tutorial lengkap, grup komunitas WhatsApp reseller, dan support team yang siap membantu 24/7." },
];

const PRODUCTS_GRID = [
    { name: "Mobile Legends", abbr: "ML", accent: "#4FC3F7" },
    { name: "Free Fire", abbr: "FF", accent: "#FF7043" },
    { name: "PUBG Mobile", abbr: "PB", accent: "#FFA726" },
    { name: "Genshin Impact", abbr: "GI", accent: "#CE93D8" },
    { name: "Valorant", abbr: "VA", accent: "#FF6B6B" },
    { name: "Roblox", abbr: "RO", accent: "#FF5722" },
    { name: "Steam Wallet", abbr: "ST", accent: "#66B2FF" },
    { name: "Google Play", abbr: "GP", accent: "#00E5A0" },
    { name: "Netflix", abbr: "NF", accent: "#E53935" },
    { name: "Spotify", abbr: "SP", accent: "#1DB954" },
    { name: "Indosat", abbr: "IM3", accent: "#FF6F00" },
    { name: "Telkomsel", abbr: "TEL", accent: "#EF5350" },
    { name: "XL Axiata", abbr: "XL", accent: "#1565C0" },
    { name: "Dana", abbr: "DAN", accent: "#38D9F5" },
    { name: "OVO", abbr: "OVO", accent: "#7B1FA2" },
];

const TESTI = [
    { init: "RS", name: "Rizky Saputra", city: "Surabaya", paket: "Silver", income: "Rp 4.200.000", bulan: "Bulan ke-3", quote: "Awalnya coba-coba aja, eh ternyata beneran cuan! Sekarang udah jadi penghasilan utama buat bayar kos dan makan.", stars: 5 },
    { init: "DM", name: "Dewi Maharani", city: "Bandung", paket: "Gold", income: "Rp 7.500.000", bulan: "Bulan ke-6", quote: "Upgrade ke Gold setelah 2 bulan dan langsung naik drastis. Custom harga dan API sangat membantu bisnis saya berkembang.", stars: 5 },
    { init: "AP", name: "Andi Pratama", city: "Makassar", paket: "Starter", income: "Rp 2.800.000", bulan: "Bulan ke-1", quote: "Mulai dari nol, modal 50 ribu, sekarang sudah balik modal seminggu. Proses super cepat dan customer happy!", stars: 5 },
];

// ── FAQ Accordion Item ─────────────────────────────────────────────
function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border rounded-xl overflow-hidden transition-all duration-300"
            style={{ borderColor: open ? "rgba(56,217,245,0.4)" : "rgba(56,217,245,0.12)", background: "rgba(10,23,53,0.55)" }}>
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer bg-transparent border-none"
                aria-expanded={open}>
                <span className="font-body text-white font-semibold text-sm md:text-base pr-4">{idx + 1}. {q}</span>
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300"
                    style={{ borderColor: "#C9A84C", color: "#C9A84C", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="2" /></svg>
                </span>
            </button>
            <div style={{ maxHeight: open ? "200px" : "0", overflow: "hidden", transition: "max-height 0.35s ease" }}>
                <p className="font-body text-slate-400 text-sm leading-relaxed px-6 pb-5">{a}</p>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ResellerPage() {
    const [scrolled, setScrolled] = useState(false);
    const [form, setForm] = useState({ nama: "", wa: "", email: "", paket: "", sumber: "" });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const sec1 = useReveal(), sec2 = useReveal(), sec3 = useReveal(), sec4 = useReveal();
    const sec5 = useReveal(), sec6 = useReveal(), sec7 = useReveal(), sec8 = useReveal();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="text-white overflow-x-hidden" style={{ background: "#020818" }}>

            {/* ── Sticky CTA ──────────────────────────────────────────── */}
            <a href="#daftar" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full font-body font-bold text-sm cursor-pointer"
                style={{ background: "#C9A84C", color: "#020818", boxShadow: "0 0 20px rgba(201,168,76,0.6), 0 0 40px rgba(201,168,76,0.3)", animation: "pulse-gold 2s ease-in-out infinite" }}>
                ✦ Daftar Gratis
            </a>

            {/* ── Navbar ──────────────────────────────────────────────── */}
            <header className="fixed inset-x-0 top-0 z-40 transition-all duration-500"
                style={{ background: scrolled ? "rgba(2,8,24,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none" }}>
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 no-underline">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="6" width="20" height="12" rx="4" /><path d="M6 12h4M8 10v4" />
                            <circle cx="16" cy="11" r="1" fill="#C9A84C" stroke="none" /><circle cx="18" cy="13" r="1" fill="#C9A84C" stroke="none" />
                        </svg>
                        <span style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.25rem", letterSpacing: "0.1em" }}>DAGANGPLAY</span>
                        <span className="hidden sm:block text-xs font-body px-2 py-0.5 rounded-full border" style={{ color: "#C9A84C", borderColor: "#C9A84C55", background: "rgba(201,168,76,0.08)" }}>Program Reseller</span>
                    </a>
                    <a href="#daftar" className="font-body font-bold text-sm px-5 py-2.5 rounded-full cursor-pointer"
                        style={{ background: "linear-gradient(90deg,#C9A84C,#E8C96A 40%,#C9A84C 60%,#b8922a)", backgroundSize: "200%", color: "#020818", boxShadow: "0 0 16px rgba(201,168,76,0.4)" }}>
                        Daftar Sekarang
                    </a>
                </div>

                {/* Social Proof Bar */}
                <div className="border-t" style={{ borderColor: "rgba(56,217,245,0.1)", background: "rgba(2,8,24,0.6)", backdropFilter: "blur(10px)" }}>
                    <div className="container mx-auto px-6 py-1.5 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="font-body text-xs text-slate-400">
                            <span style={{ color: "#00E5A0" }} className="font-bold">127 orang</span> mendaftar hari ini · Total <span style={{ color: "#C9A84C" }} className="font-bold">10.847 Reseller Aktif</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* ── HERO ────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
                {/* Glow Orbs */}
                <div className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none opacity-[0.12]"
                    style={{ background: "radial-gradient(circle,#C9A84C,transparent 70%)", filter: "blur(100px)" }} />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-[0.1]"
                    style={{ background: "radial-gradient(circle,#38D9F5,transparent 70%)", filter: "blur(100px)" }} />
                <div className="absolute inset-0 opacity-[0.022] pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border font-body text-xs"
                            style={{ borderColor: "#C9A84C55", background: "rgba(201,168,76,0.08)", color: "#C9A84C" }}>
                            ✦ 10.000+ Reseller Aktif Sejak 2023
                        </div>
                        <h1 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(2.8rem,6vw,4.5rem)", lineHeight: "0.95", marginBottom: "0.5rem" }}>
                            <span className="block text-white">Bisnis Voucher Games</span>
                        </h1>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(2rem,4.5vw,3.5rem)", lineHeight: "0.95", marginBottom: "1.5rem", background: "linear-gradient(135deg,#C9A84C,#E8C96A 50%,#38D9F5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            Modal Kecil, Untung Besar
                        </h2>
                        <p className="font-body text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                            Tanpa stok, tanpa ribet. Daftar gratis, langsung jualan, komisi langsung masuk saldo.
                        </p>
                        <a href="#daftar" className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-body font-bold text-base mb-4 cursor-pointer"
                            style={{ background: "#00E5A0", color: "#020818", boxShadow: "0 0 30px rgba(0,229,160,0.5)", animation: "glow-pulse 2s ease-in-out infinite" }}>
                            🚀 Mulai Jadi Reseller — GRATIS
                        </a>
                        <p className="font-body text-slate-500 text-xs">Sudah dipercaya <span style={{ color: "#C9A84C" }} className="font-bold">10.000+ reseller</span> di seluruh Indonesia</p>
                    </div>

                    {/* Right – Dashboard Mockup */}
                    <div className="relative hidden md:flex justify-center items-center" style={{ animation: "float 5s ease-in-out infinite" }}>
                        <div className="rounded-2xl p-6 w-80" style={{ background: "rgba(10,23,53,0.8)", border: "1px solid rgba(201,168,76,0.3)", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(201,168,76,0.15)" }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#00E5A0" }} />
                                <span className="font-body text-xs text-slate-400">Dashboard Reseller</span>
                                <span className="ml-auto font-body text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,229,160,0.1)", color: "#00E5A0" }}>LIVE</span>
                            </div>
                            <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                                <p className="font-body text-xs text-slate-500 mb-1">Pendapatan Bulan Ini</p>
                                <p style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "#C9A84C" }}>Rp 4.200.000</p>
                                <p className="font-body text-xs" style={{ color: "#00E5A0" }}>▲ +23% dari bulan lalu</p>
                            </div>
                            {[["Total Transaksi", "847", "#38D9F5"], ["Saldo Aktif", "Rp 320.000", "#C9A84C"], ["Produk Terjual", "ML, FF, PUBG…", "#00E5A0"]].map(([label, val, c]) => (
                                <div key={label} className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                    <span className="font-body text-xs text-slate-500">{label}</span>
                                    <span className="font-body text-sm font-bold" style={{ color: c as string }}>{val}</span>
                                </div>
                            ))}
                            <div className="mt-4 p-2.5 rounded-lg text-center" style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)" }}>
                                <p className="font-body text-xs" style={{ color: "#00E5A0" }}>🟢 Transaksi terakhir: 2 menit lalu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── KEUNTUNGAN ──────────────────────────────────────────── */}
            <section className="py-20" style={{ background: "linear-gradient(180deg,#060e25,#0a1735)" }}>
                <div className="container mx-auto px-6">
                    <div ref={sec1.ref} className={`transition-all duration-700 ${sec1.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#38D9F5" }}>Keunggulan</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "3rem" }}>
                            Kenapa Jadi Reseller <span style={{ color: "#C9A84C" }}>DagangPlay?</span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: "💰", value: "Hingga 30%", label: "Margin Keuntungan", c: "#C9A84C" },
                                { icon: "🚀", value: "Mulai Rp 0", label: "Modal Awal", c: "#38D9F5" },
                                { icon: "⚡", value: "< 3 Detik", label: "Proses Transaksi", c: "#00E5A0" },
                                { icon: "🎯", value: "100+ Game", label: "Produk Tersedia", c: "#C9A84C" },
                            ].map((item) => (
                                <div key={item.label} className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                                    style={{ background: "rgba(10,23,53,0.7)", border: `1px solid ${item.c}33`, backdropFilter: "blur(16px)" }}>
                                    <div className="text-4xl mb-3">{item.icon}</div>
                                    <p style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.5rem", color: item.c, marginBottom: "0.25rem" }}>{item.value}</p>
                                    <p className="font-body text-xs text-slate-500 uppercase tracking-wider">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PAKET RESELLER ──────────────────────────────────────── */}
            <section className="py-20" style={{ background: "#050f24" }}>
                <div className="container mx-auto px-6">
                    <div ref={sec2.ref} className={`transition-all duration-700 ${sec2.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#38D9F5" }}>Harga</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "3rem" }}>
                            Pilih <span style={{ color: "#C9A84C" }}>Paket Terbaikmu</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                            {/* Starter */}
                            <div className="rounded-2xl p-7 flex flex-col" style={{ background: "rgba(10,23,53,0.6)", border: "1px solid rgba(56,217,245,0.2)" }}>
                                <div className="mb-6">
                                    <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: "#38D9F5" }}>Starter</p>
                                    <p style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "2rem" }}>Gratis</p>
                                    <p className="font-body text-xs text-slate-500">Selamanya</p>
                                </div>
                                {["Margin 5–10%", "Akses semua produk", "Support via ticket", "Dashboard reseller"].map(f => (
                                    <div key={f} className="flex items-center gap-2 mb-3">
                                        <span style={{ color: "#38D9F5" }}>✓</span>
                                        <span className="font-body text-sm text-slate-400">{f}</span>
                                    </div>
                                ))}
                                <a href="#daftar" className="mt-auto block text-center py-3 rounded-full font-body font-bold text-sm cursor-pointer" style={{ border: "1px solid rgba(56,217,245,0.4)", color: "#38D9F5" }}>Pilih Paket Ini</a>
                            </div>

                            {/* Silver – Popular */}
                            <div className="rounded-2xl p-7 flex flex-col relative" style={{ background: "rgba(10,23,53,0.85)", border: "1px solid #C9A84C", boxShadow: "0 0 40px rgba(201,168,76,0.2)", transform: "scale(1.03)" }}>
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-body text-xs font-bold" style={{ background: "#C9A84C", color: "#020818" }}>⭐ PALING POPULER</div>
                                <div className="mb-6">
                                    <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: "#C9A84C" }}>Silver</p>
                                    <p style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "2rem", color: "#C9A84C" }}>Rp 99.000</p>
                                    <p className="font-body text-xs text-slate-500">per bulan</p>
                                </div>
                                {["Margin 10–20%", "Priority support WhatsApp", "Laporan transaksi harian", "Early access produk baru", "Grup reseller eksklusif"].map(f => (
                                    <div key={f} className="flex items-center gap-2 mb-3">
                                        <span style={{ color: "#C9A84C" }}>✓</span>
                                        <span className="font-body text-sm text-slate-300">{f}</span>
                                    </div>
                                ))}
                                <a href="#daftar" className="mt-auto block text-center py-3 rounded-full font-body font-bold text-sm cursor-pointer" style={{ background: "linear-gradient(90deg,#C9A84C,#E8C96A)", color: "#020818" }}>Pilih Paket Ini</a>
                            </div>

                            {/* Gold */}
                            <div className="rounded-2xl p-7 flex flex-col" style={{ background: "rgba(10,23,53,0.6)", border: "1px solid rgba(201,168,76,0.5)" }}>
                                <div className="mb-6">
                                    <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: "#C9A84C" }}>Gold 👑</p>
                                    <p style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "2rem" }}>Rp 249.000</p>
                                    <p className="font-body text-xs text-slate-500">per bulan</p>
                                </div>
                                {["Margin 20–30%", "Dedicated account manager", "Custom harga jual", "API integration tersedia", "Laporan & analitik lanjutan"].map(f => (
                                    <div key={f} className="flex items-center gap-2 mb-3">
                                        <span style={{ color: "#C9A84C" }}>✓</span>
                                        <span className="font-body text-sm text-slate-400">{f}</span>
                                    </div>
                                ))}
                                <a href="#daftar" className="mt-auto block text-center py-3 rounded-full font-body font-bold text-sm cursor-pointer" style={{ background: "linear-gradient(135deg,#C9A84C,#38D9F5)", color: "#020818" }}>Pilih Paket Ini</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CARA DAFTAR ─────────────────────────────────────────── */}
            <section className="py-20 overflow-hidden" style={{ background: "linear-gradient(180deg,#050f24,#020818)" }}>
                <div className="container mx-auto px-6">
                    <div ref={sec3.ref} className={`transition-all duration-700 ${sec3.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#38D9F5" }}>Mudah & Cepat</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "4rem" }}>
                            Mulai dalam <span style={{ color: "#C9A84C" }}>4 Langkah Mudah</span>
                        </h2>
                        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: "linear-gradient(90deg,transparent,#38D9F5,#C9A84C,transparent)" }} />
                            {[
                                { num: "01", title: "Daftar Akun", desc: "Isi form pendaftaran, verifikasi email kamu", c: "#C9A84C" },
                                { num: "02", title: "Pilih Paket", desc: "Tentukan paket sesuai kebutuhan dan budget", c: "#38D9F5" },
                                { num: "03", title: "Deposit Saldo", desc: "Top up saldo awal minimal Rp 10.000", c: "#00E5A0" },
                                { num: "04", title: "Langsung Jualan", desc: "Bagikan link toko atau jualan manual via dashboard", c: "#C9A84C" },
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center text-center relative">
                                    <span style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "6rem", color: s.c, opacity: 0.06, position: "absolute", top: "-2rem", zIndex: 0, userSelect: "none" }}>{s.num}</span>
                                    <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2"
                                        style={{ background: `${s.c}18`, borderColor: `${s.c}55`, color: s.c }}>
                                        <span style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.4rem" }}>{i + 1}</span>
                                    </div>
                                    <h3 className="font-body font-bold text-white text-base mb-2">{s.title}</h3>
                                    <p className="font-body text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRODUK GRID ─────────────────────────────────────────── */}
            <section className="py-20" style={{ background: "#0a1735", borderTop: "1px solid rgba(56,217,245,0.1)", borderBottom: "1px solid rgba(56,217,245,0.1)" }}>
                <div className="container mx-auto px-6">
                    <div ref={sec4.ref} className={`transition-all duration-700 ${sec4.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#38D9F5" }}>Katalog Produk</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "3rem" }}>
                            100+ Produk Siap <span style={{ color: "#C9A84C" }}>Kamu Jual</span>
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {PRODUCTS_GRID.map((p) => (
                                <div key={p.name} className="rounded-xl p-3 text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
                                    style={{ background: "rgba(10,23,53,0.6)", border: `1px solid ${p.accent}33` }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 font-bold text-xs"
                                        style={{ background: `${p.accent}22`, color: p.accent }}>{p.abbr}</div>
                                    <p className="font-body text-[10px] text-slate-400 leading-tight">{p.name}</p>
                                </div>
                            ))}
                            <div className="rounded-xl p-3 text-center flex items-center justify-center"
                                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)" }}>
                                <p className="font-body text-xs font-bold" style={{ color: "#C9A84C" }}>+ 85 Produk Lainnya</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── KALKULATOR CUAN ─────────────────────────────────────── */}
            <section className="py-20" style={{ background: "linear-gradient(180deg,#020818,#060e25)" }}>
                <div className="container mx-auto px-6 max-w-3xl">
                    <div ref={sec5.ref} className={`transition-all duration-700 ${sec5.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#38D9F5" }}>Potensi Penghasilan</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "3rem" }}>
                            Hitung <span style={{ color: "#C9A84C" }}>Potensi Cuanmu</span>
                        </h2>
                        <div className="rounded-2xl p-8" style={{ background: "rgba(10,23,53,0.7)", border: "1px solid rgba(201,168,76,0.3)", boxShadow: "0 0 60px rgba(201,168,76,0.1)" }}>
                            {[
                                ["50 transaksi/hari", "×", "Rp 2.000 profit", "=", "Rp 100.000/hari"],
                                ["30 hari", "×", "Rp 100.000/hari", "=", "Rp 3.000.000/bulan"],
                                ["12 bulan", "×", "Rp 3.000.000/bulan", "=", "Rp 36.000.000/tahun 🎉"],
                            ].map(([a, op, b, eq, result], i) => (
                                <div key={i} className="flex flex-wrap items-center justify-between gap-2 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                    <span className="font-body text-slate-400 text-sm">{a}</span>
                                    <span className="font-body font-bold" style={{ color: "#38D9F5" }}>{op}</span>
                                    <span className="font-body text-slate-400 text-sm">{b}</span>
                                    <span className="font-body font-bold" style={{ color: "#38D9F5" }}>{eq}</span>
                                    <span style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "#C9A84C" }}>{result}</span>
                                </div>
                            ))}
                            <p className="font-body text-slate-500 text-sm mt-6 text-center italic">
                                Dan ini baru dari 1 produk. Bayangkan kalau kamu jual semua kategori!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONI ───────────────────────────────────────────── */}
            <section className="py-20" style={{ background: "#0a1735" }}>
                <div className="container mx-auto px-6">
                    <div ref={sec6.ref} className={`transition-all duration-700 ${sec6.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#38D9F5" }}>Testimoni</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "3rem" }}>
                            Kata Mereka yang <span style={{ color: "#C9A84C" }}>Sudah Bergabung</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {TESTI.map((t, i) => (
                                <div key={i} className="rounded-2xl p-6 flex flex-col" style={{ background: "rgba(10,23,53,0.55)", border: "1px solid rgba(56,217,245,0.12)", backdropFilter: "blur(16px)" }}>
                                    <div className="flex gap-1 mb-3">{Array.from({ length: t.stars }).map((_, j) => <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>
                                    <p className="font-body text-slate-300 text-sm italic flex-1 mb-4">&ldquo;{t.quote}&rdquo;</p>
                                    <div className="p-3 rounded-xl mb-4 text-center" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                                        <p className="font-body text-xs text-slate-500 mb-1">{t.bulan}</p>
                                        <p style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#C9A84C" }}>{t.income}<span className="font-body text-sm">/bln</span></p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#C9A84C,#38D9F5)", color: "#020818" }}>{t.init}</div>
                                            <div>
                                                <p className="font-body text-white text-sm font-semibold">{t.name}</p>
                                                <p className="font-body text-slate-500 text-xs">{t.city} · Paket {t.paket}</p>
                                            </div>
                                        </div>
                                        <span className="font-body text-[10px] px-2.5 py-1 rounded-full" style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)", color: "#00E5A0" }}>✓ Verified</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ─────────────────────────────────────────────────── */}
            <section className="py-20" style={{ background: "linear-gradient(180deg,#060e25,#020818)" }}>
                <div className="container mx-auto px-6 max-w-3xl">
                    <div ref={sec7.ref} className={`transition-all duration-700 ${sec7.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#38D9F5" }}>FAQ</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "3rem" }}>
                            Pertanyaan yang <span style={{ color: "#C9A84C" }}>Sering Ditanya</span>
                        </h2>
                        <div className="flex flex-col gap-3">
                            {FAQ_ITEMS.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} idx={i} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FORM DAFTAR ─────────────────────────────────────────── */}
            <section id="daftar" className="py-20" style={{ background: "#020818", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="container mx-auto px-6 max-w-xl">
                    <div ref={sec8.ref} className={`transition-all duration-700 ${sec8.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                        <p className="font-body text-center text-xs uppercase tracking-[.2em] mb-3" style={{ color: "#C9A84C" }}>Mulai Sekarang</p>
                        <h2 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", textAlign: "center", marginBottom: "0.5rem" }}>
                            Daftar Sekarang — <span style={{ color: "#00E5A0" }}>Gratis!</span>
                        </h2>
                        <p className="font-body text-slate-500 text-sm text-center mb-8">Isi form di bawah, tim kami akan hubungi kamu dalam 1×24 jam</p>

                        {submitted ? (
                            <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.3)" }}>
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "#00E5A0", marginBottom: "0.5rem" }}>Pendaftaran Berhasil!</h3>
                                <p className="font-body text-slate-400 text-sm">Tim kami akan menghubungimu via WhatsApp dalam 1×24 jam. Selamat bergabung!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="rounded-2xl p-7 flex flex-col gap-4"
                                style={{ background: "rgba(10,23,53,0.7)", border: "1px solid rgba(201,168,76,0.3)", backdropFilter: "blur(20px)" }}>
                                {[
                                    { id: "nama", label: "Nama Lengkap", placeholder: "Contoh: Budi Santoso", type: "text" },
                                    { id: "wa", label: "Nomor WhatsApp", placeholder: "08xxxxxxxxxx", type: "tel" },
                                    { id: "email", label: "Email", placeholder: "email@kamu.com", type: "email" },
                                ].map((f) => (
                                    <div key={f.id}>
                                        <label className="font-body text-xs text-slate-400 block mb-1.5">{f.label}</label>
                                        <input type={f.type} required placeholder={f.placeholder}
                                            value={form[f.id as keyof typeof form]}
                                            onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl font-body text-sm text-white outline-none transition-all"
                                            style={{ background: "rgba(2,8,24,0.8)", border: "1px solid rgba(56,217,245,0.15)", color: "white" }}
                                        />
                                    </div>
                                ))}
                                {[
                                    { id: "paket", label: "Pilih Paket", options: ["Starter (Gratis)", "Silver - Rp 99.000/bln", "Gold - Rp 249.000/bln"] },
                                    { id: "sumber", label: "Dari mana tahu DagangPlay?", options: ["Instagram", "TikTok", "WhatsApp / Teman", "Google Search", "YouTube", "Lainnya"] },
                                ].map((f) => (
                                    <div key={f.id}>
                                        <label className="font-body text-xs text-slate-400 block mb-1.5">{f.label}</label>
                                        <select required value={form[f.id as keyof typeof form]}
                                            onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl font-body text-sm outline-none"
                                            style={{ background: "rgba(2,8,24,0.8)", border: "1px solid rgba(56,217,245,0.15)", color: form[f.id as keyof typeof form] ? "white" : "#64748b" }}>
                                            <option value="" disabled>-- Pilih --</option>
                                            {f.options.map(o => <option key={o} value={o} style={{ background: "#0a1735" }}>{o}</option>)}
                                        </select>
                                    </div>
                                ))}
                                <button type="submit" className="w-full py-4 rounded-xl font-body font-bold text-base mt-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                    style={{ background: "linear-gradient(90deg,#C9A84C,#E8C96A 40%,#38D9F5)", color: "#020818", backgroundSize: "200%", boxShadow: "0 0 30px rgba(201,168,76,0.4)" }}>
                                    DAFTAR SEKARANG — GRATIS 🚀
                                </button>
                                <p className="font-body text-center text-xs text-slate-600">🔒 Data kamu aman, tidak akan disalahgunakan</p>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <footer className="py-10" style={{ background: "#020818", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="6" width="20" height="12" rx="4" /><path d="M6 12h4M8 10v4" />
                            <circle cx="16" cy="11" r="1" fill="#C9A84C" stroke="none" />
                        </svg>
                        <span style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.1em" }}>DAGANGPLAY</span>
                    </div>
                    <p className="font-body text-slate-600 text-xs mb-4">Platform Reseller Voucher Games Terpercaya Indonesia</p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        {["Syarat & Ketentuan", "Kebijakan Privasi", "Hubungi Kami"].map(l => (
                            <a key={l} href="#" className="font-body text-xs text-slate-600 hover:text-cyan-400 transition-colors">{l}</a>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        {[["Instagram", "IG"], ["WhatsApp", "WA"], ["Telegram", "TG"]].map(([label, abbr]) => (
                            <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-full flex items-center justify-center border font-body text-xs transition-all duration-200 hover:bg-cyan-400/10"
                                style={{ borderColor: "rgba(56,217,245,0.3)", color: "#38D9F5" }}>{abbr}</a>
                        ))}
                    </div>
                    <p className="font-body text-xs text-slate-700">Copyright {new Date().getFullYear()} © DagangPlay. All rights reserved.</p>
                </div>
            </footer>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0,229,160,0.5); }
          50% { box-shadow: 0 0 50px rgba(0,229,160,0.8), 0 0 80px rgba(0,229,160,0.3); }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.6); }
          50% { box-shadow: 0 0 40px rgba(201,168,76,0.9), 0 0 60px rgba(201,168,76,0.4); }
        }
      `}</style>
        </div>
    );
}
