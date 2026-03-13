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
   ───────────────────────────────────────────────────── */

interface Props {
    scrolled: boolean;
    catalog?: any[];
}

const CompanyProfile = ({ scrolled, catalog }: Props) => {

    const stats = [
        { label: "Transaksi Sukses", value: "2.4M+", icon: Activity },
        { label: "Partner Aktif", value: "500+", icon: Users },
        { label: "Uptime Sistem", value: "99.99%", icon: Shield },
    ];

    // Get featured games from catalog
    const featuredGames = catalog?.slice(0, 8) || [];

    return (
        <div className="min-h-screen bg-[#0A1628] text-white font-inter selection:bg-[#E8B84B] selection:text-[#0A1628] overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');
                .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
                .mesh-bg {
                    background: 
                        radial-gradient(circle at 0% 0%, rgba(232, 184, 75, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 100% 100%, rgba(56, 217, 245, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(10, 22, 40, 1) 0%, transparent 100%);
                }
                .grid-pattern {
                    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 32px 32px;
                }
                .text-gold {
                    background: linear-gradient(135deg, #E8B84B 0%, #F5D280 50%, #E8B84B 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gold-glow { box-shadow: 0 0 15px rgba(232, 184, 75, 0.2); }
                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .featured-card { background: #FFFFFF; color: #0A1628; }
                .game-card:hover .game-img { transform: scale(1.05); }
            `}</style>

            {/* Navbar */}
            <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${scrolled ? 'h-16 bg-[#0A1628]/90 backdrop-blur-2xl border-b border-white/5' : 'h-20 bg-transparent'}`}>
                <div className="container mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#E8B84B] to-[#B88A2D] rounded-lg flex items-center justify-center shadow-lg shadow-[#E8B84B]/20">
                             <Cpu className="w-5 h-5 text-[#0A1628]" />
                        </div>
                        <span className="text-lg font-heading font-extrabold tracking-tight uppercase italic">DAGANG<span className="text-gold">PLAY</span></span>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8">
                        {['Store', 'Keunggulan', 'Teknologi'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-[.25em] text-white/40 hover:text-white transition-colors no-underline">
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-5">
                        <a href="/admin/login" className="hidden md:block text-[10px] font-bold uppercase tracking-[.2em] text-white/40 hover:text-white no-underline">Dashboard</a>
                        <a href="/reseller" className="bg-[#E8B84B] hover:bg-[#F5D280] text-[#0A1628] px-6 py-2.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest shadow-xl gold-glow transition-all hover:-translate-y-0.5 no-underline">
                            Mulai Sekarang
                        </a>
                    </div>
                </div>
            </header>

            <main className="relative">
                {/* Hero Section */}
                <section className="relative pt-52 pb-80 overflow-hidden mesh-bg">
                    <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#E8B84B]/10 border border-[#E8B84B]/20 px-4 py-2 rounded-full mb-12">
                            <Sparkles className="w-4 h-4 text-[#E8B84B]" />
                            <span className="text-[10px] font-bold uppercase tracking-[.4em] text-[#E8B84B]">Elite Business Ecosystem</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.05] tracking-tight mb-10 uppercase">
                            SOLUSI <span className="text-gold">DISTRIBUSI</span> & <br />
                            BISNIS GAME MODERN.
                        </h1>

                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
                            Nikmati harga top up game kompetitif untuk penggunaan pribadi, atau bangun platform bisnis mandiri dengan infrastruktur teknologi kelas dunia.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-12 justify-center">
                            <a href="#store" className="bg-[#E8B84B] text-[#0A1628] px-12 py-5 rounded-xl text-[12px] font-black uppercase tracking-[.25em] hover:bg-[#F5D280] transition-all shadow-2xl gold-glow no-underline flex items-center gap-3 justify-center scale-110">
                                <ShoppingCart className="w-4 h-4" /> Akses Official Store
                            </a>
                            <a href="/reseller" className="bg-white/5 border border-white/10 text-white px-12 py-5 rounded-xl text-[12px] font-black uppercase tracking-[.25em] hover:bg-white/10 transition-all no-underline flex items-center gap-3 justify-center scale-110">
                                <Rocket className="w-4 h-4" /> Pelajari Kemitraan
                            </a>
                        </div>
                    </div>
                </section>

                {/* Statistics Overlay */}
                <div className="container mx-auto px-6 -mt-32 relative z-20 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((s, i) => (
                            <div key={i} className="glass-card p-8 rounded-2xl flex items-center gap-5">
                                <div className="p-4 bg-[#E8B84B]/10 rounded-xl text-[#E8B84B]">
                                    <s.icon size={22} />
                                </div>
                                <div>
                                    <div className="text-2xl font-heading font-extrabold">{s.value}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Direct Store Showcase Section */}
                <section id="store" className="py-32 bg-[#060A0F] relative">
                    <div className="container mx-auto px-6">
                        <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-8">
                            <div className="space-y-2">
                                <div className="text-[#E8B84B] text-[9px] font-bold uppercase tracking-[.4em]">Ready Stock</div>
                                <h2 className="text-2xl md:text-3xl font-heading font-bold uppercase italic">Layanan <span className="text-white/30">Terpopuler</span></h2>
                            </div>
                            <a href="/?view=store" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-[#E8B84B] transition-colors flex items-center gap-2 no-underline">
                                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredGames.map((game: any, i: number) => {
                                const fallbackImg = `https://img.df.sg/game/${game.slug}.png`;
                                return (
                                    <div key={i} className="group relative game-card cursor-pointer" onClick={() => window.location.href = `/produk/${game.slug}`}>
                                        <div className="aspect-[3/4] rounded-xl overflow-hidden glass-card border-white/5 relative">
                                            <img 
                                                src={game.image || fallbackImg} 
                                                alt={game.name} 
                                                className="game-img w-full h-full object-cover transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                                                onError={(e: any) => {
                                                    e.target.src = 'https://via.placeholder.com/300x400?text=' + game.name;
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#060A0F] via-transparent to-transparent opacity-80" />
                                            <div className="absolute bottom-5 left-5 right-5">
                                                <div className="text-[9px] font-bold uppercase tracking-[.2em] text-[#E8B84B] mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">Instant Delivery</div>
                                                <div className="text-base font-heading font-extrabold leading-tight group-hover:text-gold transition-colors italic uppercase">{game.name}</div>
                                                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                    <div className="w-7 h-7 rounded-lg bg-[#E8B84B] flex items-center justify-center text-[#0A1628]">
                                                        <ShoppingCart className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-wider">Beli Sekarang</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Core Capabilities (Technology Section) */}
                <section id="keunggulan" className="py-32 bg-[#0A1628]">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row gap-16 items-start mb-24 border-l border-[#E8B84B] pl-10">
                            <div className="flex-1">
                                <div className="text-[#E8B84B] text-[9px] font-bold uppercase tracking-[.4em] mb-4">Partner Infrastructure</div>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold leading-tight uppercase italic">
                                    TEKNOLOGI BISNIS <br /> <span className="text-white/30">TANPA BATAS.</span>
                                </h2>
                            </div>
                            <div className="lg:max-w-md text-white/40 text-[13px] leading-relaxed italic font-medium">
                                Kami menghadirkan sistem terintegrasi untuk mengelola distribusi voucher game secara profesional, 
                                memastikan efisiensi operasional dan skalabilitas keuntungan bagi setiap mitra kami.
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: BarChart3, title: "Dashboard Keuangan", desc: "Sistem pelacakan performa bisnis real-time dengan data analitik akurat untuk memantau profitabilitas harian." },
                                { icon: Globe, title: "Platform White-Label", desc: "Bangun otoritas brand Anda sendiri dengan dukungan domain kustom dan sertifikasi keamanan SSL tingkat lanjut." },
                                { icon: ShieldCheck, title: "Proteksi Kelas Dunia", desc: "Infrastruktur terlindungi dari ancaman DDoS dengan enkripsi data berlapis untuk keamanan transaksi maksimal." },
                                { icon: Zap, title: "Otomasi Transaksi", desc: "Integrasi sistem API dengan latensi rendah, memastikan pengiriman produk ke pelanggan dalam hitungan detik." },
                                { icon: Users, title: "Sistem Kemitraan", desc: "Kelola jaringan distribusi Anda dengan fitur leveling harga yang fleksibel dan transparan untuk reseller." },
                                { icon: Rocket, title: "Infrastruktur Global", desc: "Didukung oleh server cloud berperformansi tinggi yang siap menangani volume transaksi skala besar kapan saja." },
                            ].map((f, i) => (
                                <div key={i} className="p-10 rounded-xl glass-card border-white/5 hover:border-[#E8B84B]/20 transition-all group">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-[#E8B84B] mb-8 group-hover:scale-110 transition-transform">
                                        <f.icon size={22} />
                                    </div>
                                    <h3 className="text-lg font-heading font-extrabold uppercase mb-4 tracking-tight italic">{f.title}</h3>
                                    <p className="text-white/40 text-[13px] leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-44 bg-[#0A1628] relative text-center overflow-hidden border-t border-white/5">
                    <div className="absolute inset-0 mesh-bg opacity-30" />
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-[#E8B84B] text-[10px] font-bold uppercase tracking-[.5em] mb-6">Limited Partnership</div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-[1.1] tracking-tighter mb-10 italic uppercase">
                            MULAI <span className="text-gold">KERAJAAN BISNIS</span> <br />
                            GAME ANDA SEKARANG.
                        </h2>
                        <a href="/reseller" className="inline-block bg-[#E8B84B] text-[#0A1628] px-12 py-5 rounded-md text-[11px] font-extrabold uppercase tracking-[.3em] gold-glow hover:scale-105 transition-all no-underline">
                            Bergabung Sebagai Mitra
                        </a>
                        <p className="mt-8 text-[10px] text-white/30 font-bold uppercase tracking-widest">Akses eksklusif • Sistem Terintegrasi • Support 24/7</p>
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
