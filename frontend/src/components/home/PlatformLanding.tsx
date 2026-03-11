"use client";
import React from "react";
import { IGamepad, IMenu, IClose } from "@/components/Icons";
import { NAV, SOCIALS, FOOTCOLS } from "@/data/constants";
import { LuxuryAnnouncement, PaymentTicker, PremiumSlider } from "./HomeComponents";

const PlatformLanding = ({ config, contentData, filteredProducts, search, setSearch, categoriesError, catalog, announcements, scrolled, mOpen, setMOpen }: any) => {
    return (
        <div id="top" className="min-h-screen bg-[#030712] text-slate-200 font-body selection:bg-gold selection:text-black">

            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[180px] opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[200px] opacity-20" />
            </div>

            {/* Senior Navbar */}
            <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-700 ${scrolled ? 'h-16 bg-[#030712]/80 backdrop-blur-3xl border-b border-white/[0.04] shadow-2xl' : 'h-20 bg-transparent border-none'}`}>
                <div className="container mx-auto px-8 h-full flex items-center justify-between">
                    <a href="#top" className="flex items-center gap-4 group no-underline text-inherit transition-transform active:scale-95">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#030712] shadow-[0_8px_20px_rgba(255,255,255,0.1)] group-hover:shadow-white/40 transition-all duration-500 overflow-hidden">
                            <img src="/dagang.png?v=2" alt="Logo" className="w-7 h-7 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading tracking-[.3em] text-md md:text-lg uppercase leading-none mb-1 logo-text font-black">
                                {config?.name?.replace(/OFFICIAL STORE/gi, "").trim() || "DAGANGPLAY CORP"}
                            </span>
                            <span className="text-[7px] font-black tracking-[.6em] text-gold/60 uppercase italic">LOGO VERIFIED 2026</span>
                        </div>
                    </a>

                    <nav className="hidden lg:flex items-center gap-8 bg-white/[0.02] border border-white/[0.06] py-2 px-9 rounded-full backdrop-blur-3xl">
                        {NAV.map((l: string) => (
                            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
                                className="font-black text-[8px] uppercase tracking-[.4em] transition-all duration-500 text-white/30 hover:text-gold no-underline">
                                {l}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        <a href="#produk" className="btn-primary-luxe hidden md:inline-flex no-underline border-none px-7 py-3.5 text-[8px] bg-gold text-black shadow-[0_10px_30px_rgba(201,168,76,0.2)] hover:shadow-gold/40">BELI SEKARANG</a>
                        <button className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer hover:bg-white/10" onClick={() => setMOpen(!mOpen)}>
                            {mOpen ? <IClose /> : <IMenu />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Experience - High Impact Marketing */}
            <section className="relative pt-36 md:pt-40 pb-16 overflow-hidden z-20">
                <div className="container mx-auto px-8">
                    <div className="mb-10 lg:max-w-4xl mx-auto">
                        <LuxuryAnnouncement announcements={announcements} />
                    </div>

                    <div className="text-center space-y-7 max-w-5xl mx-auto">
                        <div className="badge-luxe inline-flex items-center gap-2.5 bg-white/5 border-white/10 py-1.5 px-4">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-100"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold"></span>
                            </span>
                            <span className="font-black italic text-gold text-[8px] tracking-[.4em]">TERPERCAYA 500RB+ GAMERS</span>
                        </div>
                        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter uppercase mb-4">
                            LAYANAN TOP UP <br />
                            <span className="logo-text italic opacity-90 inline-block mt-1 font-black leading-tight tracking-tight">DETIK PROSES.</span>
                        </h1>
                        <p className="font-body text-xs md:text-sm leading-relaxed max-w-xl mx-auto text-white/40 uppercase tracking-[.4em] font-black italic">
                            HARGA TERMURAH &bull; OTOMATIS 24 JAM &bull; LEGAL & RESMI
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 pt-6 justify-center">
                            <a href="#produk" className="btn-primary-luxe px-12 py-5 no-underline border-none text-[9px] bg-gold text-black shadow-[0_15px_40px_rgba(201,168,76,0.3)] hover:scale-110">MULAI TRANSAKSI</a>
                            <a href="#cara-beli" className="btn-outline-luxe px-10 py-5 no-underline bg-transparent group text-[9px] border-white/10 hover:border-gold hover:text-gold uppercase tracking-[.4em] font-black">
                                PANDUAN PEMBELIAN
                                <svg className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Banner Placement - Direct Marketing */}
            <div className="container mx-auto px-8 mb-24 z-20 relative">
                <div className="relative animate-float-luxe max-w-4xl mx-auto">
                    <PremiumSlider banners={contentData?.banners || []} />
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />
                </div>
            </div>

            {/* Payment Ticker - Trust Signal */}
            <PaymentTicker />

            {/* Tentang Kami Section */}
            <section id="tentang-kami" className="py-32 z-30 relative overflow-hidden">
                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <div className="badge-luxe text-gold border-gold/10 inline-flex">LEGASI KAMI</div>
                            <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tighter leading-tight">
                                ARSITEKTUR <br />
                                <span className="logo-text italic">DIGITAL ELITE.</span>
                            </h2>
                            <p className="text-white/30 text-xs md:text-sm uppercase tracking-[.3em] font-black leading-loose italic">
                                DagangPlay hadir sebagai standar baru dalam distribusi aset digital. Kami tidak hanya menjual layanan, kami membangun infrastruktur yang menjamin keamanan dan kecepatan transaksi tanpa kompromi.
                            </p>
                            <div className="grid grid-cols-2 gap-8 pt-6">
                                <div>
                                    <h4 className="font-heading text-2xl text-gold">24/7</h4>
                                    <p className="text-[7px] uppercase tracking-[.4em] font-black text-white/20 mt-2">Operasi Otomatis</p>
                                </div>
                                <div>
                                    <h4 className="font-heading text-2xl text-gold">100%</h4>
                                    <p className="text-[7px] uppercase tracking-[.4em] font-black text-white/20 mt-2">Lisensi Resmi</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bento-card p-8 aspect-square flex flex-col justify-end group hover:bg-gold/5 transition-colors">
                                <span className="text-2xl mb-4 group-hover:scale-110 transition-transform">🛡️</span>
                                <h5 className="font-heading text-md uppercase tracking-widest group-hover:text-gold">KEAMANAN</h5>
                                <p className="text-[7px] uppercase tracking-[.3em] font-black text-white/20 mt-2 italic">Proteksi data level korporasi.</p>
                            </div>
                            <div className="bento-card p-8 aspect-square flex flex-col justify-end translate-y-12 group hover:bg-gold/5 transition-colors">
                                <span className="text-2xl mb-4 group-hover:scale-110 transition-transform">💎</span>
                                <h5 className="font-heading text-md uppercase tracking-widest group-hover:text-gold">KUALITAS</h5>
                                <p className="text-[7px] uppercase tracking-[.3em] font-black text-white/20 mt-2 italic">Layanan premium tanpa batas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us - Marketing Proof */}
            <section className="py-24 z-30 relative bg-black/10">
                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "HARGA JUARA", desc: "Kompetitif dengan rate terbaik di pasar Indonesia.", icon: "💰" },
                            { title: "DETIK PROSES", desc: "Sistem API otomatis, item masuk dalam hitungan detik.", icon: "⚡" },
                            { title: "SUPORT 24/7", desc: "Admin spesialis siap membantu kendala Anda kapan saja.", icon: "🎧" },
                        ].map((f, i) => (
                            <div key={i} className="bento-card p-10 group hover:bg-white/[0.03] rounded-[2.5rem]">
                                <div className="text-3xl mb-5 transition-transform group-hover:scale-125 duration-500 opacity-60">{f.icon}</div>
                                <h3 className="font-heading text-xl mb-3 uppercase tracking-[.2em] group-hover:text-gold transition-colors">{f.title}</h3>
                                <p className="text-white/20 text-[9px] uppercase tracking-widest font-black leading-loose italic">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* High-Impact Catalog */}
            <section id="produk" className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-8 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <div className="badge-luxe bg-gold/5 text-gold border-gold/10 py-1 px-4">
                            <span className="font-black italic tracking-[.6em] text-[7px]">PRODUK TERPOPULER</span>
                        </div>
                        <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-none mb-4">
                            PILIH <span className="logo-text italic font-black">GAME KAMU.</span>
                        </h2>
                        <div className="max-w-xl mx-auto pt-4 group">
                            <div className="bento-card p-1.5 bg-white/[0.03] group-focus-within:border-gold/30 transition-all rounded-2xl">
                                <div className="relative">
                                    <span className="absolute left-7 top-1/2 -translate-y-1/2 text-white/5 group-focus-within:text-gold transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="CARI NAMA GAME..."
                                        className="w-full pl-16 pr-8 py-5 bg-transparent border-none text-md font-body outline-none text-white placeholder:text-white/5 uppercase tracking-[.2em] font-bold"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Catalog Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {categoriesError ? (
                            <div className="col-span-full bento-card p-24 text-center opacity-30">
                                <p className="text-2xl font-heading uppercase italic tracking-[.3em]">KESALAHAN SISTEM ⚠️</p>
                                <button onClick={() => window.location.reload()} className="btn-outline-luxe mt-8 px-12 text-[8px]">MUAT ULANG</button>
                            </div>
                        ) : !catalog ? (
                            Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="bento-card aspect-[16/10] animate-pulse bg-white/[0.03] rounded-3xl" />
                            ))
                        ) : filteredProducts.length === 0 ? (
                            <div className="col-span-full py-32 text-center opacity-10">
                                <h2 className="text-5xl font-heading uppercase tracking-[.4em] italic">NULL</h2>
                            </div>
                        ) : filteredProducts.map((p: any) => (
                            <a
                                href={`/produk/${p.slug}`}
                                key={p.id}
                                className="group relative bento-card aspect-[16/10] no-underline bg-[#030712] border-none shadow-[0_15px_40px_rgba(0,0,0,0.4)] active:scale-95 transition-all rounded-3xl overflow-hidden"
                            >
                                <img src={p.image || "/fallback.jpg"} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-30 group-hover:scale-105 transition-all duration-700" alt={p.name} />
                                <div className="absolute inset-x-0 bottom-0 p-5 z-10 transition-all duration-500 group-hover:translate-x-1.5">
                                    <span className="text-[7px] font-black text-white/40 uppercase tracking-[.4em] mb-2 group-hover:text-gold transition-colors block leading-none">{p.categoryName}</span>
                                    <h4 className="font-heading text-md text-white uppercase tracking-tight group-hover:text-white transition-colors leading-none truncate pr-4">{p.name}</h4>
                                </div>
                                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                    <div className="p-2 rounded-xl bg-gold/90 backdrop-blur-3xl text-black font-black text-[7px] tracking-widest uppercase shadow-xl">ORDER</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partnership Marketing */}
            <section id="reseller" className="py-40 relative overflow-hidden text-center bg-[#02050d]">
                <div className="absolute top-0 left-0 w-full h-px bg-white/[0.02]" />
                <div className="container mx-auto px-8 relative z-10">
                    <div className="badge-luxe border-gold/20 text-gold mb-8 text-[7px] py-1 px-4 tracking-[.8em]">SINERGI BISNIS</div>
                    <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-none mb-8 tracking-tighter uppercase font-black italic text-white/90">
                        BANGUN <span className="logo-text">EMPIRE</span> KAMU.
                    </h2>
                    <p className="text-white/20 text-sm uppercase tracking-[.4em] mb-12 max-w-2xl mx-auto font-black italic leading-loose">
                        Jadilah bagian dari jaringan distribusi elit. Harga reseller eksklusif dan sistem API terintegrasi menanti Anda.
                    </p>
                    <a href="/reseller" className="btn-primary-luxe px-20 py-8 rounded-2xl no-underline text-[9px] bg-gold text-black shadow-[0_15px_60px_rgba(201,168,76,0.2)] hover:shadow-gold/40 border-none font-black italic tracking-[.5em]">GABUNG KE MITRA</a>
                </div>
            </section>

            <footer id="kontak" className="py-24 border-t border-white/[0.04] bg-[#02050d]">
                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                        <div className="md:col-span-4 space-y-8">
                            <div className="flex items-center gap-4 mb-4">
                                <img src="/dagang.png" alt="Logo" className="w-8 h-8 object-contain" />
                                <span className="font-heading text-2xl font-black uppercase tracking-[.5em] logo-text">{config?.name || "DAGANGPLAY"}</span>
                            </div>
                            <p className="text-white/20 text-[11px] font-body leading-loose uppercase tracking-[.3em] font-black italic max-w-xs cursor-default">
                                "{config?.tagline || "Solusi manajemen aset gaming dan transaksi digital tingkat pro."}"
                            </p>
                            <div className="flex gap-6">
                                {SOCIALS.map((s: any, i: number) => (
                                    <a key={i} href={s.href} className="text-white/10 hover:text-gold transition-all no-underline scale-125">{s.icon}</a>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {FOOTCOLS.map((col: any, i: number) => (
                                <div key={i} className="space-y-8">
                                    <h4 className="font-black text-[8px] uppercase tracking-[.5em] text-gold/60">{col.title}</h4>
                                    <ul className="space-y-4 list-none p-0">
                                        {col.links.map((l: string) => <li key={l}><a href="#" className="no-underline text-white/10 hover:text-white transition-all text-[9px] uppercase tracking-widest font-black italic">{l}</a></li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[8px] font-black uppercase tracking-[.8em] text-white/5">
                        <span>© {new Date().getFullYear()} {config?.name} &bull; SISTEM OTOMASI ELITE</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PlatformLanding;
