"use client";
import React from "react";
import {
    Zap, ShieldCheck, BarChart3, Globe, Users,
    ArrowRight, ChevronRight, Activity,
    Shield, Cpu, Rocket, ShoppingCart, Sparkles
} from "lucide-react";

interface Props {
    scrolled: boolean;
    catalog?: any[];
    merchants?: any[];
}

const CompanyProfile = ({ scrolled, catalog, merchants }: Props) => {

    const stats = [
        { label: "Transaksi Sukses", value: "2.4M+", icon: Activity },
        { label: "Partner Aktif", value: "500+", icon: Users },
        { label: "Uptime Sistem", value: "99.99%", icon: Shield },
    ];

    const featuredGames = catalog?.slice(0, 8) || [];

    return (
        <div className="min-h-screen bg-[#080C10] text-white overflow-x-hidden" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

                :root {
                    --gold: #D4A843;
                    --gold-light: #F0C96A;
                    --gold-dim: rgba(212,168,67,0.12);
                    --surface: #0E1318;
                    --surface-2: #131920;
                    --border: rgba(255,255,255,0.06);
                    --text-muted: rgba(255,255,255,0.35);
                    --text-mid: rgba(255,255,255,0.6);
                }

                * { box-sizing: border-box; }
                .font-serif-dp { font-family: 'Cormorant Garamond', Georgia, serif; }
                .font-sans-dp  { font-family: 'Instrument Sans', sans-serif; }

                .text-gold-dp {
                    background: linear-gradient(135deg, #D4A843 0%, #F0C96A 50%, #C49030 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .noise-dp::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 0;
                }

                .hero-glow-dp {
                    background:
                        radial-gradient(ellipse 80% 60% at 60% 0%, rgba(212,168,67,0.07) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 40% at 100% 50%, rgba(212,168,67,0.04) 0%, transparent 55%);
                }

                .grid-lines-dp {
                    background-image:
                        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
                    background-size: 48px 48px;
                }

                .nav-glass-dp {
                    background: rgba(8,12,16,0.88);
                    backdrop-filter: blur(24px) saturate(180%);
                    -webkit-backdrop-filter: blur(24px) saturate(180%);
                }

                .btn-primary-dp {
                    background: var(--gold);
                    color: #080C10;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    font-size: 11px;
                    text-transform: uppercase;
                    transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-primary-dp:hover {
                    background: var(--gold-light);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(212,168,67,0.25);
                }

                .btn-ghost-dp {
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-mid);
                    font-weight: 500;
                    letter-spacing: 0.04em;
                    font-size: 11px;
                    text-transform: uppercase;
                    transition: border-color 0.25s, color 0.25s, background 0.25s;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-ghost-dp:hover {
                    border-color: rgba(212,168,67,0.4);
                    color: var(--gold-light);
                    background: var(--gold-dim);
                }

                .stat-card-dp {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                .stat-card-dp:hover {
                    border-color: rgba(212,168,67,0.2);
                    box-shadow: 0 0 32px rgba(212,168,67,0.06);
                }

                .game-tile-dp { cursor: pointer; }
                .game-tile-dp .img-wrap-dp { overflow: hidden; border-radius: 12px; }
                .game-tile-dp .cover-dp { transition: transform 0.6s cubic-bezier(.25,.46,.45,.94), opacity 0.4s; opacity: 0.7; }
                .game-tile-dp:hover .cover-dp { transform: scale(1.07); opacity: 1; }
                .game-tile-dp .info-overlay-dp {
                    background: linear-gradient(to top, rgba(8,12,16,0.98) 0%, rgba(8,12,16,0.5) 50%, transparent 100%);
                    transition: opacity 0.3s;
                }

                .feat-card-dp {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    transition: border-color 0.3s, background 0.3s;
                }
                .feat-card-dp:hover {
                    border-color: rgba(212,168,67,0.18);
                    background: var(--surface-2);
                }
                .feat-icon-dp {
                    background: var(--gold-dim);
                    border: 1px solid rgba(212,168,67,0.15);
                    color: var(--gold);
                    transition: background 0.3s;
                }
                .feat-card-dp:hover .feat-icon-dp { background: rgba(212,168,67,0.2); }

                .nav-a-dp {
                    position: relative;
                    text-decoration: none;
                    font-size: 11px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    font-weight: 500;
                    color: var(--text-muted);
                    transition: color 0.2s;
                }
                .nav-a-dp::after {
                    content: '';
                    position: absolute;
                    bottom: -3px;
                    left: 0; right: 0;
                    height: 1px;
                    background: var(--gold);
                    transform: scaleX(0);
                    transition: transform 0.3s ease;
                    transform-origin: left;
                }
                .nav-a-dp:hover { color: white; }
                .nav-a-dp:hover::after { transform: scaleX(1); }

                .cta-glow-dp {
                    background: radial-gradient(ellipse 70% 50% at 50% 100%, rgba(212,168,67,0.1) 0%, transparent 60%);
                }

                .tag-dp {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 9px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: var(--gold);
                    border: 1px solid rgba(212,168,67,0.2);
                    background: rgba(212,168,67,0.06);
                    padding: 5px 14px;
                    border-radius: 2px;
                    font-family: 'Instrument Sans', sans-serif;
                }
            `}</style>

            {/* NAVBAR */}
            <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-400 border-b ${scrolled ? 'nav-glass-dp border-white/[0.06]' : 'bg-transparent border-transparent'}`}>
                <div className="max-w-[1200px] mx-auto px-8 h-[60px] flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3 no-underline">
                        <div className="w-[34px] h-[34px] bg-[#D4A843] rounded-[6px] flex items-center justify-center">
                            <Cpu className="w-[17px] h-[17px] text-[#080C10]" strokeWidth={2.2} />
                        </div>
                        <span className="font-sans-dp font-bold text-[15px] tracking-tight text-white">
                            DAGANG<span className="text-gold-dp">PLAY</span>
                        </span>
                    </a>

                    <nav className="hidden lg:flex items-center gap-9">
                        {['Store', 'Keunggulan', 'Teknologi'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="nav-a-dp font-sans-dp">{item}</a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        <a href="/admin/login" className="hidden md:block nav-a-dp font-sans-dp text-[10px]">Dashboard</a>
                        <a href="/reseller" className="btn-primary-dp font-sans-dp px-5 py-[10px] rounded-[6px]">
                            Mulai Sekarang
                        </a>
                    </div>
                </div>
            </header>

            <main>
                {/* HERO */}
                <section className="relative pt-[160px] pb-[220px] overflow-hidden noise-dp hero-glow-dp grid-lines-dp">
                    <div className="absolute left-[80px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(212,168,67,0.15)] to-transparent pointer-events-none hidden xl:block" />
                    <div className="max-w-[1200px] mx-auto px-8 relative z-10">
                        <div className="max-w-[680px]">
                            <div className="tag-dp mb-9">
                                <Sparkles className="w-[10px] h-[10px]" strokeWidth={2} />
                                Elite Business Ecosystem
                            </div>

                            <h1 className="leading-[1.0] tracking-[-0.01em] mb-8">
                                <span className="font-sans-dp font-bold text-[56px] md:text-[68px] text-white block">SOLUSI</span>
                                <span className="font-serif-dp italic font-light text-[60px] md:text-[74px] block text-gold-dp" style={{ letterSpacing: '-0.01em' }}>Distribusi</span>
                                <span className="font-sans-dp font-bold text-[56px] md:text-[68px] text-white block">&amp; BISNIS GAME</span>
                                <span className="font-serif-dp italic font-light text-[60px] md:text-[74px] block text-white/[0.1]" style={{ letterSpacing: '-0.01em' }}>Modern.</span>
                            </h1>

                            <p className="font-sans-dp text-[15px] leading-[1.75] text-white/50 max-w-[480px] mb-11 font-light">
                                Nikmati harga top up game kompetitif untuk penggunaan pribadi, atau bangun platform bisnis mandiri dengan infrastruktur teknologi kelas dunia.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a href="#store" className="btn-primary-dp font-sans-dp px-7 py-[13px] rounded-[6px]">
                                    <ShoppingCart className="w-[13px] h-[13px]" strokeWidth={2} />
                                    Akses Official Store
                                </a>
                                <a href="/reseller" className="btn-ghost-dp font-sans-dp px-7 py-[13px] rounded-[6px]">
                                    <Rocket className="w-[13px] h-[13px]" strokeWidth={1.8} />
                                    Pelajari Kemitraan
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <div className="max-w-[1200px] mx-auto px-8 -mt-[100px] relative z-20 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.map((s, i) => (
                            <div key={i} className="stat-card-dp rounded-xl p-7 flex items-center gap-5">
                                <div className="feat-icon-dp w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <s.icon size={18} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <div className="font-sans-dp font-bold text-[26px] tracking-tight text-white">{s.value}</div>
                                    <div className="font-sans-dp text-[10px] uppercase tracking-[0.22em] text-white/30 font-medium mt-0.5">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STORE */}
                <section id="store" className="py-20" style={{ background: 'var(--surface)' }}>
                    <div className="max-w-[1200px] mx-auto px-8">
                        <div className="flex justify-between items-end mb-10 pb-6 border-b border-white/[0.06]">
                            <div>
                                <div className="tag-dp mb-3">Ready Stock</div>
                                <h2 className="font-sans-dp font-bold text-[22px] tracking-tight text-white mt-2">
                                    Layanan <span className="text-white/25">Terpopuler</span>
                                </h2>
                            </div>
                            <a href="/?view=store" className="flex items-center gap-1.5 font-sans-dp text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 hover:text-[#D4A843] transition-colors no-underline">
                                Lihat Semua <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                            </a>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {featuredGames.map((game: any, i: number) => {
                                const fallbackImg = `https://img.df.sg/game/${game.slug}.png`;
                                return (
                                    <div key={i} className="game-tile-dp" onClick={() => window.location.href = `/produk/${game.slug}`}>
                                        <div className="img-wrap-dp aspect-[3/4] relative bg-[#0E1318]">
                                            <img
                                                src={game.image || fallbackImg}
                                                alt={game.name}
                                                className="cover-dp w-full h-full object-cover rounded-[12px]"
                                                onError={(e: any) => {
                                                    e.target.src = 'https://via.placeholder.com/300x400?text=' + game.name;
                                                }}
                                            />
                                            <div className="info-overlay-dp absolute inset-0 rounded-[12px] flex flex-col justify-end p-4">
                                                <div className="font-sans-dp text-[8px] font-semibold uppercase tracking-[0.25em] text-[#D4A843] mb-1.5">Instant</div>
                                                <div className="font-sans-dp font-bold text-[13px] text-white leading-snug mb-3">{game.name}</div>
                                                <div className="inline-flex items-center gap-1.5 bg-[#D4A843] text-[#080C10] px-3 py-1.5 rounded-[4px] w-fit">
                                                    <ShoppingCart className="w-[10px] h-[10px]" strokeWidth={2.5} />
                                                    <span className="font-sans-dp text-[9px] font-bold uppercase tracking-wider">Beli</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* MERCHANTS (DAFTAR TOKO) */}
                <section id="store-list" className="py-24 bg-[#05070A] border-y border-white/[0.04]">
                    <div className="max-w-[1200px] mx-auto px-8">
                        <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-16">
                            <div>
                                <div className="tag-dp mb-6">Elite Merchant Directory</div>
                                <h2 className="leading-[1.1]">
                                    <span className="font-sans-dp font-bold text-[36px] md:text-[44px] text-white block tracking-tight">DAFTAR TOKO</span>
                                    <span className="font-serif-dp italic font-light text-[40px] md:text-[48px] text-white/10 block">Partner Kami.</span>
                                </h2>
                            </div>
                            <p className="font-sans-dp text-[14px] leading-[1.8] text-white/30 max-w-[400px] font-light">
                                Telusuri jaringan toko mitra kami yang telah terintegrasi dengan infrastruktur DagangPlay untuk layanan top up game aman dan terpercaya.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {(merchants && merchants.length > 0) ? merchants.map((m: any, i: number) => (
                                <a 
                                    key={m.id}
                                    href={m.domain ? `https://${m.domain}` : `/?merchant=${m.slug}&view=store`}
                                    className="group block p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-[#D4A843]/30 transition-all duration-500"
                                >
                                    <div className="aspect-video mb-5 overflow-hidden rounded-xl bg-black/40 relative">
                                        <img 
                                            src={m.bannerImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop'} 
                                            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" 
                                            alt={m.name}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center p-6">
                                            {m.logo ? (
                                                <img src={m.logo} className="h-10 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" alt={m.name} />
                                            ) : (
                                                <span className="font-sans-dp font-bold text-lg text-white/80">{m.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <h4 className="font-sans-dp font-bold text-[14px] text-white group-hover:text-[#D4A843] transition-colors mb-1">{m.name}</h4>
                                    <p className="font-sans-dp text-[10px] text-white/30 font-light truncate">{m.tagline || 'Official Store Partner'}</p>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-[#D4A843] uppercase tracking-widest">Visit Store</span>
                                        <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-[#D4A843] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </a>
                            )) : (
                                [1,2,3,4].map((i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] animate-pulse">
                                        <div className="aspect-video rounded-xl bg-white/5 mb-4" />
                                        <div className="h-4 w-24 bg-white/5 rounded mb-2" />
                                        <div className="h-3 w-32 bg-white/5 rounded" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section id="keunggulan" className="py-32 bg-[#080C10]">
                    <div className="max-w-[1200px] mx-auto px-8">
                        <div className="grid lg:grid-cols-2 gap-16 mb-16 pb-12 border-b border-white/[0.06]">
                            <div>
                                <div className="tag-dp mb-6">Partner Infrastructure</div>
                                <h2 className="leading-[1.1] mt-2">
                                    <span className="font-sans-dp font-bold text-[36px] md:text-[44px] text-white block tracking-tight">TEKNOLOGI BISNIS</span>
                                    <span className="font-serif-dp italic font-light text-[40px] md:text-[48px] text-white/15 block">Tanpa Batas.</span>
                                </h2>
                            </div>
                            <div className="flex items-end">
                                <p className="font-sans-dp text-[14px] leading-[1.8] text-white/40 font-light">
                                    Kami menghadirkan sistem terintegrasi untuk mengelola distribusi voucher game secara profesional,
                                    memastikan efisiensi operasional dan skalabilitas keuntungan bagi setiap mitra kami.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { icon: BarChart3, title: "Dashboard Keuangan", desc: "Sistem pelacakan performa bisnis real-time dengan data analitik akurat untuk memantau profitabilitas harian." },
                                { icon: Globe, title: "Platform White-Label", desc: "Bangun otoritas brand Anda sendiri dengan dukungan domain kustom dan sertifikasi keamanan SSL tingkat lanjut." },
                                { icon: ShieldCheck, title: "Proteksi Kelas Dunia", desc: "Infrastruktur terlindungi dari ancaman DDoS dengan enkripsi data berlapis untuk keamanan transaksi maksimal." },
                                { icon: Zap, title: "Otomasi Transaksi", desc: "Integrasi sistem API dengan latensi rendah, memastikan pengiriman produk ke pelanggan dalam hitungan detik." },
                                { icon: Users, title: "Sistem Kemitraan", desc: "Kelola jaringan distribusi Anda dengan fitur leveling harga yang fleksibel dan transparan untuk reseller." },
                                { icon: Rocket, title: "Infrastruktur Global", desc: "Didukung oleh server cloud berperformansi tinggi yang siap menangani volume transaksi skala besar kapan saja." },
                            ].map((f, i) => (
                                <div key={i} className="feat-card-dp rounded-xl p-8 group">
                                    <div className="feat-icon-dp w-11 h-11 rounded-lg flex items-center justify-center mb-7">
                                        <f.icon size={18} strokeWidth={1.8} />
                                    </div>
                                    <h3 className="font-sans-dp font-semibold text-[15px] text-white mb-3 tracking-tight">{f.title}</h3>
                                    <p className="font-sans-dp font-light text-[13px] leading-[1.75] text-white/35">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative py-44 overflow-hidden border-t border-white/[0.06]" style={{ background: 'var(--surface)' }}>
                    <div className="absolute inset-0 cta-glow-dp pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-transparent to-[rgba(212,168,67,0.3)]" />

                    <div className="max-w-[720px] mx-auto px-8 text-center relative z-10">
                        <div className="tag-dp mx-auto mb-8" style={{ width: 'fit-content' }}>Limited Partnership</div>

                        <h2 className="leading-[1.05] mb-10">
                            <span className="font-sans-dp font-bold text-[44px] md:text-[56px] text-white block tracking-tight">MULAI</span>
                            <span className="font-serif-dp italic font-light text-[50px] md:text-[62px] block text-gold-dp">Kerajaan Bisnis</span>
                            <span className="font-sans-dp font-bold text-[44px] md:text-[56px] text-white block tracking-tight">GAME ANDA</span>
                            <span className="font-serif-dp italic font-light text-[50px] md:text-[62px] text-white/[0.1] block">Sekarang.</span>
                        </h2>

                        <a href="/reseller" className="btn-primary-dp font-sans-dp px-10 py-[15px] rounded-[8px] text-[11px] inline-flex">
                            Bergabung Sebagai Mitra
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                        </a>

                        <div className="flex items-center gap-4 mt-12 justify-center">
                            <div className="h-px flex-1 max-w-[80px] bg-white/[0.06]" />
                            <span className="font-sans-dp text-[9px] font-semibold uppercase tracking-[0.35em] text-white/20">Akses Eksklusif · Sistem Terintegrasi · Support 24/7</span>
                            <div className="h-px flex-1 max-w-[80px] bg-white/[0.06]" />
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="py-8 bg-[#050709] border-t border-white/[0.06]">
                <div className="max-w-[1200px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[5px] flex items-center justify-center border border-[#D4A843]/15 bg-[#D4A843]/10">
                            <Cpu size={13} className="text-[#D4A843]" strokeWidth={2} />
                        </div>
                        <span className="font-sans-dp font-bold text-[13px] tracking-tight text-white/60">
                            DAGANG<span className="text-gold-dp">PLAY</span>
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="font-sans-dp text-[9px] font-medium text-white/20 uppercase tracking-[0.3em]">
                            &copy; {new Date().getFullYear()} PT DAGANGPLAY DIGITAL TEKNOLOGI
                        </div>
                        <div className="font-sans-dp text-[8px] font-light text-white/10 uppercase tracking-[0.2em] mt-1">
                            Solusi Infrastruktur & Distribusi Game Terpercaya
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CompanyProfile;