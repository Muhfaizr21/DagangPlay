"use client";
import React from "react";
import { 
    Laptop, Zap, ShieldCheck, BarChart3, Globe, Users, 
    Check, ArrowRight, Play, Star, ChevronRight, Activity,
    Shield, Cpu, Rocket, ShoppingCart, Gamepad2, Sparkles, FireExtinguisher
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   DESIGN SYSTEM: LUXURY HYBRID SAAS + STORE
   - Direct sales integrated into premium SaaS layout
   ─────�const CompanyProfile = ({ scrolled, catalog }: Props) => {

    const stats = [
        { label: "Volume Transaksi", value: "2.4M+", icon: Activity },
        { label: "Jaringan Mitra", value: "500+", icon: Users },
        { label: "Stabilitas Sistem", value: "99.99%", icon: Shield },
    ];

    // Get featured games from catalog
    const featuredGames = catalog?.slice(0, 8) || [];

    return (
        <div className="min-h-screen bg-[#0A1628] text-white font-inter selection:bg-[#E8B84B] selection:text-[#0A1628] overflow-x-hidden antialiased">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');
                .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
                .mesh-bg {
                    background: 
                        radial-gradient(circle at 10% 10%, rgba(232, 184, 75, 0.04) 0%, transparent 50%),
                        radial-gradient(circle at 90% 90%, rgba(56, 217, 245, 0.04) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(10, 22, 40, 1) 0%, transparent 100%);
                }
                .grid-pattern {
                    background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .text-gold {
                    background: linear-gradient(135deg, #E8B84B 0%, #F5D280 50%, #E8B84B 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gold-glow { box-shadow: 0 0 30px rgba(232, 184, 75, 0.15); }
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                }
            `}</style>

            {/* Navbar - Compact Height & Professional Tracking */}
            <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-700 ${scrolled ? 'h-16 bg-[#0A1628]/95 border-b border-white/5 shadow-2xl shadow-black/50' : 'h-20 bg-transparent'}`}>
                <div className="container mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#E8B84B] to-[#B88A2D] rounded-lg flex items-center justify-center shadow-lg shadow-[#E8B84B]/20 transition-transform group-hover:scale-110">
                             <Cpu className="w-5 h-5 text-[#0A1628]" />
                        </div>
                        <span className="text-lg font-heading font-extrabold tracking-tighter uppercase italic">DAGANG<span className="text-gold">PLAY</span></span>
                    </div>

                    <nav className="hidden lg:flex items-center gap-10">
                        {['Store', 'Keunggulan', 'Otomasi'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-[.3em] text-white/30 hover:text-white transition-all no-underline relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-[#E8B84B] hover:after:w-full after:transition-all">
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        <a href="/admin/login" className="hidden md:block text-[10px] font-bold uppercase tracking-[.25em] text-white/40 hover:text-white no-underline">Merchant Port</a>
                        <a href="/reseller" className="bg-[#E8B84B] hover:bg-[#F5D280] text-[#0A1628] px-7 py-2.5 rounded font-extrabold text-[10px] uppercase tracking-widest shadow-xl gold-glow transition-all hover:-translate-y-0.5 no-underline">
                            Dominasi Sekarang
                        </a>
                    </div>
                </div>
            </header>

            <main className="relative">
                {/* Hero Section - Optimized Vertical Spacing */}
                <section className="relative pt-44 pb-32 overflow-hidden mesh-bg">
                    <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
                    <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#E8B84B]/5 border border-[#E8B84B]/20 px-4 py-1.5 rounded-full mb-10 animate-fade-in">
                            <Sparkles className="w-3.5 h-3.5 text-[#E8B84B]" />
                            <span className="text-[9px] font-black uppercase tracking-[.5em] text-[#E8B84B]">Pusat Kendali Distribusi Terbesar</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.05] tracking-[-0.03em] mb-8 uppercase italic">
                            DOMINASI INDUSTRI <br />
                            <span className="text-gold">TOP UP DAN GAME</span> <br />
                            DENGAN TEKNOLOGI ELITE.
                        </h1>

                        <p className="text-white/40 text-base md:text-lg max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
                            Kendalikan ratusan produk digital dengan satu sistem cerdas. Bangun otoritas brand Anda, otomasi setiap transaksi, dan lipatgandakan profit tanpa hambatan teknis.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#store" className="bg-[#E8B84B] text-[#0A1628] px-12 py-5 rounded font-black text-[11px] uppercase tracking-[.25em] hover:bg-[#F5D280] transition-all shadow-2xl gold-glow no-underline flex items-center gap-3 justify-center">
                                <ShoppingCart size={16} /> Akses Store Eksklusif
                            </a>
                            <a href="/reseller" className="bg-white/5 border border-white/5 text-white px-12 py-5 rounded font-black text-[11px] uppercase tracking-[.25em] hover:bg-white/10 transition-all no-underline flex items-center gap-3 justify-center">
                                <Rocket size={16} /> Bangun Empire Bisnis
                            </a>
                        </div>
                    </div>
                </section>

                {/* Stats Section - Better Alignment */}
                <div className="container mx-auto px-6 lg:px-12 -mt-12 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((s, i) => (
                            <div key={i} className="glass-card p-8 rounded-xl border border-white/5 flex items-center gap-6 transition-transform hover:-translate-y-1">
                                <div className="p-4 bg-white/5 rounded-xl text-[#E8B84B]">
                                    <s.icon size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-heading font-extrabold tracking-tighter text-white">{s.value}</div>
                                    <div className="text-[10px] uppercase tracking-[.3em] text-white/20 font-bold mt-0.5">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Store Showcase - Refined Spacing & Typography */}
                <section id="store" className="py-32 bg-[#060A0F] relative">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-white/5 pb-10 gap-6">
                            <div className="space-y-2">
                                <div className="text-[#E8B84B] text-[10px] font-black uppercase tracking-[.5em]">Inventory Global</div>
                                <h2 className="text-3xl md:text-4xl font-heading font-extrabold uppercase italic tracking-tighter leading-none">
                                    LAYANAN <span className="text-white/20">PREMIUM PILIHAN</span>
                                </h2>
                            </div>
                            <a href="/?view=store" className="text-[10px] font-black uppercase tracking-[.3em] text-white/30 hover:text-[#E8B84B] transition-all flex items-center gap-3 no-underline group">
                                Jelajahi Semua Produk <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredGames.map((game: any, i: number) => {
                                const fallbackImg = `https://img.df.sg/game/${game.slug}.png`;
                                return (
                                    <div key={i} className="group relative game-card cursor-pointer" onClick={() => window.location.href = `/produk/${game.slug}`}>
                                        <div className="aspect-[3/4] rounded px-0 overflow-hidden glass-card border-white/5 relative">
                                            <img 
                                                src={game.image || fallbackImg} 
                                                alt={game.name} 
                                                className="game-img w-full h-full object-cover transition-all duration-1000 opacity-60 group-hover:opacity-100 group-hover:scale-105" 
                                                onError={(e: any) => {
                                                    e.target.src = 'https://via.placeholder.com/300x400?text=' + game.name;
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#060A0F] via-transparent to-transparent opacity-90" />
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="text-[9px] font-bold uppercase tracking-[.2em] text-[#E8B84B] mb-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">Verified Listing</div>
                                                <div className="text-lg font-heading font-extrabold leading-tight group-hover:text-gold transition-colors uppercase italic tracking-tight">{game.name}</div>
                                                <div className="flex items-center gap-3 mt-5 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-700">
                                                    <div className="w-8 h-8 rounded bg-[#E8B84B] flex items-center justify-center text-[#0A1628]">
                                                        <ShoppingCart size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E8B84B]">Order Instan</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Automation Section - Authoritative Marketing */}
                <section id="keunggulan" className="py-32 bg-[#0A1628]">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex flex-col lg:flex-row gap-16 items-start mb-24">
                            <div className="flex-1 space-y-5">
                                <div className="text-[#E8B84B] text-[10px] font-black uppercase tracking-[.6em]">Teknologi Tanpa Batas</div>
                                <h2 className="text-4xl md:text-5xl font-heading font-extrabold leading-[1.1] uppercase italic tracking-tighter">
                                    MESIN OTOMASI <br /> <span className="text-white/20">DISTRIBUSI TERCEPAT.</span>
                                </h2>
                                <p className="lg:max-w-xl text-white/30 text-base leading-relaxed font-medium italic">
                                    Kami melenyapkan hambatan teknis dalam bisnis distribusi game. Dari sinkronisasi stok otomatis hingga pemrosesan transaksi secepat kilat, sistem kami bergerak untuk profit Anda.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: BarChart3, title: "Profit Intelligence", desc: "Monitor margin keuntungan secara presisi dengan sistem pelaporan analitik yang menyajikan data profit netto real-time." },
                                { icon: Globe, title: "Otoritas Brand Mandiri", desc: "Singkirkan ketergantungan. Bangun brand Anda sendiri dengan dukungan domain kustom dan enkripsi data level perbankan." },
                                { icon: ShieldCheck, title: "Proteksi Anti-Interupsi", desc: "Infrastruktur tahan banting dengan mitigasi DDoS enterprise, menjamin operasional bisnis berjalan 24/7 tanpa henti." },
                                { icon: Zap, title: "Akselerasi Transaksi", desc: "Latensi minimal dengan integrasi direct-provider. Pastikan pelanggan Anda mendapatkan produk dalam hitungan detik." },
                                { icon: Users, title: "Ekosistem Mitra", desc: "Kendalikan jaringan reseller Anda dengan manajemen hierarki harga yang cerdas, efisien, dan sepenuhnya dapat dikontrol." },
                                { icon: Rocket, title: "Skalabilitas Global", desc: "Sistem yang dirancang untuk tumbuh. Siap membukukan ribuan transaksi per detik tanpa sekalipun mengorbankan kecepatan." },
                            ].map((f, i) => (
                                <div key={i} className="p-10 rounded-xl glass-card border border-white/5 hover:border-[#E8B84B]/20 transition-all duration-500 group">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[#E8B84B] mb-8 group-hover:scale-110 transition-transform">
                                        <f.icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-heading font-extrabold uppercase mb-4 tracking-tight italic text-white/90">{f.title}</h3>
                                    <p className="text-white/30 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Ultimate CTA - High Pressure Marketing */}
                <section className="py-44 bg-[#0A1628] relative text-center overflow-hidden border-t border-white/5">
                    <div className="absolute inset-0 mesh-bg opacity-40" />
                    <div className="container mx-auto px-6 lg:px-12 relative z-10">
                        <div className="text-[#E8B84B] text-[11px] font-black uppercase tracking-[.6em] mb-8">Exclusive Partnership</div>
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.05] tracking-tighter mb-12 italic uppercase">
                            SAATNYA <span className="text-gold">AMBIL KENDALI</span> <br />
                            MASA DEPAN BISNIS ANDA.
                        </h2>
                        <a href="/reseller" className="inline-block bg-[#E8B84B] text-[#0A1628] px-16 py-8 rounded font-black text-[12px] uppercase tracking-[.4em] gold-glow hover:scale-105 active:scale-95 transition-all no-underline shadow-2xl">
                            Aktivasi Dashboard Sekarang
                        </a>
                        <div className="mt-12 flex justify-center items-center gap-6 opacity-40">
                            {['Terintegrasi', 'Terpercaya', 'Tercepat'].map(t => (
                                <div key={t} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-[#E8B84B]" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
8 text-[10px] text-white/30 font-bold uppercase tracking-widest tracking-widest">Akses eksklusif • Sistem Terintegrasi • Support 24/7</p>
                    </div>
                </section>
            </main>

            <footer className="py-10 bg-[#060A0F] border-t border-white/5">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#E8B84B]/10 rounded-lg flex items-center justify-center border border-[#E8B84B]/20">
                            <Cpu size={16} className="text-[#E8B84B]" />
                        </div>
                        <span className="text-xs font-heading font-bold uppercase tracking-tighter">DAGANG<span className="text-gold">PLAY</span></span>
                    </div>
                    <div className="flex flex-col md:items-end gap-1.5">
                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-[.4em]">
                            &copy; {new Date().getFullYear()} PT DAGANGPLAY DIGITAL TEKNOLOGI
                        </div>
                        <div className="text-[8px] font-medium text-white/10 uppercase tracking-[.2em]">
                            Solusi Infrastruktur & Distribusi Game Terpercaya
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CompanyProfile;
