"use client";
import React from "react";
import { PremiumSlider } from "./HomeComponents";
import { Search, ShoppingBag, ShieldCheck, Zap, Laptop, Clock, MessageSquare, ChevronRight, Gamepad, Wallet, Phone, Smartphone } from "lucide-react";

interface MerchantStorefrontProps {
    config: any;
    contentData: any;
    filteredProducts: any;
    search: string;
    setSearch: (val: string) => void;
}

const MerchantStorefront = ({ config, contentData, filteredProducts, search, setSearch }: MerchantStorefrontProps) => {
    return (
        <div className="min-h-screen bg-[#070b14] text-slate-300 font-body selection:bg-gold selection:text-black">
            {/* Minimalist Top Nav */}
            <header className="sticky top-0 z-50 bg-[#0b1221]/90 backdrop-blur-md border-b border-white/[0.05]">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                            {config?.logo ? (
                                <img src={config.logo} alt="Logo" className="w-5 h-5 object-contain" />
                            ) : (
                                <Laptop className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <h1 className="font-bold text-base tracking-tight text-white leading-none uppercase">
                            {config.name}
                        </h1>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-[10px] font-bold tracking-[.2em] text-slate-400 hover:text-white transition-colors uppercase">Daftar Harga</a>
                        <a href="#" className="text-[10px] font-bold tracking-[.2em] text-slate-400 hover:text-gold transition-colors uppercase">Cek Pesanan</a>
                        <a href="#" className="text-[10px] font-bold tracking-[.2em] text-slate-400 hover:text-white transition-colors uppercase">Bantuan</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="text-white/40 hover:text-white transition-colors"><Search size={18} /></button>
                        <button className="bg-gold text-black px-5 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase hover:bg-yellow-500 transition-all">
                            Login
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Slider */}
                <div className="container mx-auto px-6 py-8">
                    <div className="mb-10">
                        <PremiumSlider banners={contentData?.banners || []} theme="dark" />
                    </div>

                    {/* Quick Category Navigation */}
                    <div className="grid grid-cols-4 md:flex items-center justify-center gap-2 md:gap-4 mb-12">
                        {[
                            { icon: Gamepad, label: 'Game', active: true },
                            { icon: Wallet, label: 'E-Wallet' },
                            { icon: Phone, label: 'Pulsa' },
                            { icon: Smartphone, label: 'Aplikasi' },
                        ].map((cat, i) => (
                            <button key={i} className={`flex flex-col items-center gap-2 p-4 md:px-8 md:py-4 rounded-2xl border transition-all ${cat.active ? 'bg-gold/5 border-gold/30 text-gold' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10'}`}>
                                <cat.icon size={22} className={cat.active ? 'animate-pulse' : ''} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search Section */}
                    <div className="max-w-3xl mx-auto mb-16 text-center">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6">
                            Cari <span className="text-gold">Produk</span> Favorit
                        </h2>
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="KETIK DISINI UNTUK MENCARI..."
                                className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-6 py-5 rounded-2xl text-[11px] uppercase font-bold tracking-[.2em] outline-none focus:border-gold/30 focus:bg-white/[0.05] focus:ring-4 focus:ring-gold/5 transition-all text-white placeholder:text-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {filteredProducts.map((p: any) => (
                            <a
                                href={`/produk/${p.slug}${config?.slug ? `?merchant=${config.slug}` : ''}`}
                                key={p.id}
                                className="group bg-[#0b1221] border border-white/[0.05] rounded-3xl overflow-hidden hover:border-gold/20 hover:-translate-y-1.5 transition-all duration-300 shadow-xl"
                            >
                                <div className="aspect-square relative overflow-hidden">
                                    <img
                                        src={p.image}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                        alt={p.name}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                                    {/* Sold Badge */}
                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                        <p className="text-[7px] font-bold text-gold uppercase tracking-wider">Terjual 1rb+</p>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-green-500" />
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">PROSES INSTAN</span>
                                    </div>
                                    <h4 className="font-bold text-[13px] text-white group-hover:text-gold transition-colors uppercase leading-tight line-clamp-1">{p.name}</h4>
                                    <div className="pt-2 border-t border-white/5">
                                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-[.2em]">{p.categoryName}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[2.5rem]">
                            <p className="text-slate-500 font-bold uppercase tracking-[.3em]">Produk tidak ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <section className="bg-white/[0.02] border-y border-white/[0.03] py-20 mt-20">
                    <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { icon: Zap, title: "Proses Instan", desc: "Otomatis 24 Jam" },
                            { icon: ShieldCheck, title: "100% Legal", desc: "Produk Resmi" },
                            { icon: Clock, title: "Available 24/7", desc: "Layanan Nonstop" },
                            { icon: MessageSquare, title: "Response Cepat", desc: "CS Berpengalaman" },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold mb-6 shadow-xl">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h5 className="font-bold text-white text-sm uppercase tracking-wide mb-1">{item.title}</h5>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="py-20 bg-black/40">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="max-w-md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold">
                                    <Laptop className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-xl tracking-tight text-white uppercase italic">{config.name}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Platform penyedia layanan top-up game terpercaya dengan proses yang serba otomatis dan layanan CS yang sigap membantu.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-12">
                            <div>
                                <h6 className="text-[10px] font-black text-white uppercase tracking-[.4em] mb-6">Navigasi</h6>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase">Beranda</a></li>
                                    <li><a href="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase">Cek Pesanan</a></li>
                                    <li><a href="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase">Syarat & Ketentuan</a></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="text-[10px] font-black text-white uppercase tracking-[.4em] mb-6">Bantuan</h6>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase">Hubungi Kami</a></li>
                                    <li><a href="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase">WhatsApp</a></li>
                                    <li><a href="#" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase">Instagram</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[.4em]">
                            © {new Date().getFullYear()} {config.name}. Powering Gaming Commerce.
                        </p>
                        <div className="flex gap-8">
                            <span className="text-[8px] font-black text-white/10 tracking-widest uppercase italic">Experience by DagangPlay</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MerchantStorefront;

