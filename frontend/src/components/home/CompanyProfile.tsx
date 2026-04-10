"use client";
import React, { useState, useEffect } from "react";
import {
    Zap, ShieldCheck, BarChart3, Globe, Users,
    ArrowRight, ChevronRight, Activity,
    Shield, Cpu, Rocket, ShoppingCart, Sparkles, Crosshair, Gamepad
} from "lucide-react";

interface Props {
    scrolled: boolean;
    catalog?: any[];
    merchants?: any[];
}

const CompanyProfile = ({ scrolled, catalog, merchants }: Props) => {
    const [dashboardUrl, setDashboardUrl] = useState("/admin/login");

    useEffect(() => {
        try {
            const userData = localStorage.getItem('admin_user');
            const token = localStorage.getItem('admin_token');
            if (userData && token) {
                const parsed = JSON.parse(userData);
                if (parsed.role === 'MERCHANT') setDashboardUrl('/merchant');
                else if (parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN_STAFF') setDashboardUrl('/admin');
            }
        } catch { }
    }, []);

    const stats = [
        { label: "Transaksi Berhasil", value: "2.4M+", icon: Activity },
        { label: "Partner Terhubung", value: "500+", icon: Users },
        { label: "Server Uptime", value: "99.9%", icon: Shield },
    ];

    const featuredGames = catalog?.slice(0, 8) || [];

    return (
        <div className="min-h-screen bg-dp-bg text-white font-sans selection:bg-dp-primary/30 relative overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-dp-primary/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-dp-secondary/15 rounded-full blur-[150px] pointer-events-none" />

            {/* NAVBAR */}
            <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 border-b ${scrolled ? 'bg-dp-surface/90 backdrop-blur-xl border-white/10 shadow-xl' : 'bg-transparent border-transparent'}`}>
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3 no-underline group relative">
                        <div className="absolute inset-0 bg-dp-primary/20 blur-md rounded-lg group-hover:bg-dp-primary/40 transition-colors" />
                        <div className="relative w-8 h-8 bg-dp-surface border border-white/20 rounded-lg flex items-center justify-center">
                            <Crosshair className="w-5 h-5 text-dp-primary" strokeWidth={2.5} />
                        </div>
                        <span className="font-display font-bold text-sm tracking-widest text-white uppercase relative">
                            DAGANG<span className="text-dp-primary">PLAY</span>
                        </span>
                    </a>

                    <nav className="hidden md:flex items-center gap-10">
                        {['Store', 'Keunggulan', 'Teknologi'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-dp-muted hover:text-white transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-dp-primary transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-5">
                        <a href={dashboardUrl} className="hidden sm:block text-xs font-bold uppercase tracking-widest text-dp-muted hover:text-white">Dashboard</a>
                        <a href="/reseller" className="bg-dp-primary/10 border border-dp-primary text-dp-primary hover:bg-dp-primary hover:text-black hover:shadow-glow-primary text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-lg transition-all">
                            Join Now
                        </a>
                    </div>
                </div>
            </header>

            <main>
                {/* HERO */}
                <section className="relative pt-44 lg:pt-56 pb-28 flex flex-col items-center text-center px-6 z-10">
                    <div className="border border-dp-secondary/30 bg-dp-secondary/10 px-5 py-1.5 rounded-full flex items-center gap-2 mb-8 animate-fade-in shadow-glow-secondary">
                        <Sparkles className="w-4 h-4 text-dp-secondary" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Elite Top-Up Ecosystem</span>
                    </div>

                    <h1 className="font-display font-black text-5xl md:text-7xl xl:text-8xl tracking-tight leading-[0.95] mb-8 max-w-5xl animate-slide-up">
                        <span className="text-white block mb-2">INFRASTRUKTUR</span>
                        <span className="text-gradient-gaming block italic pr-2">BISNIS GAME.</span>
                    </h1>

                    <p className="font-sans text-sm md:text-[15px] font-medium text-dp-muted max-w-2xl mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
                        Dapatkan pengalaman top-up instan dengan margin terbaik. Api gaming latensi rendah dan perlindungan sistem tingkat militer untuk operasional tanpa hambatan.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <a href="#store" className="w-full sm:w-auto bg-dp-primary text-black hover:bg-[#00F0FF] text-[13px] font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-glow-primary">
                            <Gamepad className="w-5 h-5" />
                            Official Store
                        </a>
                        <a href="/reseller" className="w-full sm:w-auto glass-panel hover:border-white/30 text-white text-[13px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
                            <Rocket className="w-5 h-5 text-dp-muted" />
                            Pelajari Kemitraan
                        </a>
                    </div>
                </section>

                {/* STATS */}
                <section className="max-w-[1200px] mx-auto px-6 relative z-10 mb-32 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((s, i) => (
                            <div key={i} className="glass-panel-glow rounded-2xl p-6 flex items-center gap-5">
                                <div className="w-14 h-14 rounded-xl bg-dp-primary/10 flex items-center justify-center border border-dp-primary/20">
                                    <s.icon className="w-6 h-6 text-dp-primary" />
                                </div>
                                <div className="text-left">
                                    <div className="font-display font-black text-3xl text-white tracking-tight">{s.value}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-dp-muted font-bold mt-1">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* STORE PREVIEW */}
                <section id="store" className="py-24 relative z-10 bg-dp-surface/30 border-y border-white/[0.03]">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="flex justify-between items-end mb-12 relative">
                            <div>
                                <div className="text-dp-primary text-[10px] uppercase font-black tracking-widest mb-2">Instant Delivery</div>
                                <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-white uppercase italic">HOT Layanan.</h2>
                            </div>
                            <a href="/?view=store" className="hidden sm:flex text-xs font-bold uppercase tracking-widest text-white hover:text-dp-primary items-center gap-2 transition-colors">
                                View Full Catalog <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                            {featuredGames.map((game: any, i: number) => {
                                const fallbackImg = `https://img.df.sg/game/${game.slug}.png`;
                                return (
                                    <div key={i} className="group relative cursor-pointer rounded-2xl overflow-hidden glass-panel hover:border-dp-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-primary" onClick={() => window.location.href = `/produk/${game.slug}`}>
                                        <div className="aspect-[4/5] bg-black/50 overflow-hidden relative">
                                            <img
                                                src={game.image || fallbackImg}
                                                alt={game.name}
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                                onError={(e: any) => { e.target.src = 'https://via.placeholder.com/400x500?text=' + game.name; }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-dp-bg via-dp-bg/20 to-transparent" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <div className="inline-block bg-dp-primary/20 border border-dp-primary text-dp-primary px-2 py-0.5 rounded text-[8px] uppercase font-black tracking-widest mb-2">GAME</div>
                                            <div className="font-display text-lg font-black text-white leading-tight">{game.name}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* MERCHANTS */}
                <section id="store-list" className="py-32 relative z-10">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="mb-14 text-center">
                            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-white uppercase italic mb-4">Partner Network.</h2>
                            <p className="text-sm font-medium text-dp-muted max-w-lg mx-auto">Kami mengelola puluhan platform top-up terkemuka dengan sistem anti-latency.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {(merchants && merchants.length > 0) ? merchants.map((m: any, i: number) => (
                                <a key={m.id} href={m.domain ? `https://${m.domain}` : `/?merchant=${m.slug}&view=store`} className="group flex flex-col p-6 rounded-2xl glass-panel-glow">
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                                            {m.logo ? <img src={m.logo} className="w-full h-full object-contain" alt={m.name} /> : <div className="text-xl font-bold font-display text-white">{m.name[0]}</div>}
                                        </div>
                                        <div>
                                            <div className="font-display font-black text-sm text-white uppercase">{m.name}</div>
                                            <div className="text-[10px] text-dp-primary font-bold uppercase tracking-widest mt-1">{m.domain || "Official API"}</div>
                                        </div>
                                    </div>
                                    <div className="mt-auto px-4 py-2 rounded-xl bg-white/5 group-hover:bg-dp-primary text-center text-[10px] font-black uppercase tracking-widest text-dp-muted group-hover:text-black transition-colors">
                                        Enter Store
                                    </div>
                                </a>
                            )) : (
                                [1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)
                            )}
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section id="keunggulan" className="py-32 relative z-10 bg-dp-surface/50 border-y border-white/[0.03]">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-dp-secondary/10 blur-[150px] pointer-events-none rounded-full" />
                    <div className="max-w-[1200px] mx-auto px-6 relative">
                        <div className="mb-16">
                            <div className="text-dp-secondary text-[10px] uppercase font-black tracking-widest mb-2">System Specs</div>
                            <h2 className="font-display font-black text-3xl md:text-5xl tracking-tight text-white uppercase italic mb-4">Teknologi Elite.</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: Zap, title: "0ms Latency API", desc: "Routing transaksi instan tanpa jeda server." },
                                { icon: ShieldCheck, title: "Anti-Loss Engine", desc: "Sistem pengaman escrow yang memblokir order rugi." },
                                { icon: BarChart3, title: "Live Analytics", desc: "Pantau arus kas dalam hitungan detik per detik." },
                            ].map((f, i) => (
                                <div key={i} className="glass-panel p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dp-primary to-dp-secondary flex items-center justify-center mb-6 shadow-glow-secondary">
                                        <f.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-display font-black text-xl text-white uppercase italic mb-2">{f.title}</h3>
                                    <p className="text-sm font-medium text-dp-muted leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-44 relative z-10 flex flex-col items-center text-center px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dp-primary/5 to-transparent pointer-events-none" />
                    
                    <h2 className="font-display font-black text-4xl md:text-7xl tracking-tighter text-white mb-6 uppercase italic relative">
                        Mulai Invasi <br /> <span className="text-gradient-gaming">Pasar Game.</span>
                    </h2>
                    <p className="text-[15px] font-medium text-dp-muted max-w-md mx-auto mb-10 relative">Siapkan persenjataan bisnis Anda. Bangun kerajaan top-up hari ini juga.</p>
                    <a href="/reseller" className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-dp-primary to-dp-secondary rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse-glow" />
                        <div className="relative bg-black px-10 py-5 rounded-xl border border-white/10 flex items-center justify-center gap-3">
                            <span className="text-[13px] font-black uppercase text-white tracking-widest group-hover:text-dp-primary transition-colors">Join Reseller</span>
                            <ArrowRight className="w-5 h-5 text-white group-hover:text-dp-primary transition-colors" />
                        </div>
                    </a>
                </section>
            </main>

            <footer className="py-8 border-t border-white/5 bg-[#000]">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Crosshair className="w-5 h-5 text-dp-primary" />
                        <span className="font-display font-black text-[11px] tracking-widest text-dp-muted uppercase">
                            DAGANGPLAY INC.
                        </span>
                    </div>
                    <div className="text-[9px] font-bold text-dp-muted uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} Elite Infrastructure
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CompanyProfile;