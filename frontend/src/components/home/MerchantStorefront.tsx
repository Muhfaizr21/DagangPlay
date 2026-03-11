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
        <div className="min-h-screen bg-[#05070A] text-[#E0E0E0] font-body selection:bg-[#00F5FF] selection:text-[#05070A] relative overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0056FF] rounded-full blur-[150px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#00F5FF] rounded-full blur-[150px] opacity-10 pointer-events-none" />

            {/* Minimalist Top Nav */}
            <header className="sticky top-0 z-50 bg-[#05070A]/60 backdrop-blur-xl border-b border-[#00F5FF]/20 shadow-[0_4px_30px_rgba(0,86,255,0.1)]">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-[#0056FF]/20 border border-[#00F5FF]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,245,255,0.6)] transition-all duration-300">
                            {config?.logo ? (
                                <img src={config.logo} alt="Logo" className="w-6 h-6 object-contain" />
                            ) : (
                                <Laptop className="w-5 h-5 text-[#00F5FF]" />
                            )}
                        </div>
                        <h1 className="font-black text-xl tracking-wider text-[#E0E0E0] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#E0E0E0] to-[#00F5FF]">
                            {config.name}
                        </h1>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-10">
                        <a href="#" className="text-xs font-bold tracking-[.15em] text-[#E0E0E0]/70 hover:text-[#00F5FF] hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] transition-all uppercase">Daftar Harga</a>
                        <a href="#" className="text-xs font-bold tracking-[.15em] text-[#E0E0E0]/70 hover:text-[#00F5FF] hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] transition-all uppercase">Cek Pesanan</a>
                        <a href="#" className="text-xs font-bold tracking-[.15em] text-[#E0E0E0]/70 hover:text-[#00F5FF] hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] transition-all uppercase">Bantuan</a>
                    </nav>

                    <div className="flex items-center gap-6">
                        <button className="text-[#00F5FF]/60 hover:text-[#00F5FF] hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] transition-all"><Search size={22} /></button>
                        <button className="relative overflow-hidden group bg-[#0056FF]/20 border border-[#00F5FF] text-[#00F5FF] px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(0,245,255,0.2)] hover:shadow-[0_0_20px_rgba(0,245,255,0.5)]">
                            <span className="relative z-10">Login</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0056FF] to-[#00F5FF] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <div className="container mx-auto px-6 py-10">
                    <div className="mb-14 rounded-3xl overflow-hidden border border-[#00F5FF]/20 shadow-[0_0_30px_rgba(0,86,255,0.15)] relative">
                        {/* Assuming PremiumSlider handles its own styling, but we wrap it in a glassmorphism container */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#05070A]/80 via-transparent to-[#05070A]/80 z-10 pointer-events-none" />
                        <PremiumSlider banners={contentData?.banners || []} theme="dark" />
                    </div>

                    {/* Quick Category Navigation */}
                    <div className="grid grid-cols-4 md:flex items-center justify-center gap-4 md:gap-6 mb-16">
                        {[
                            { icon: Gamepad, label: 'Game', active: true },
                            { icon: Wallet, label: 'E-Wallet' },
                            { icon: Phone, label: 'Pulsa' },
                            { icon: Smartphone, label: 'Aplikasi' },
                        ].map((cat, i) => (
                            <button key={i} className={`group flex flex-col items-center gap-3 p-5 md:px-10 md:py-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${cat.active ? 'bg-[#0056FF]/20 border-[#00F5FF] text-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.3)]' : 'bg-[#05070A]/50 border-white/10 text-slate-500 hover:bg-[#0056FF]/10 hover:border-[#00F5FF]/50 hover:text-[#E0E0E0] hover:shadow-[0_0_15px_rgba(0,245,255,0.1)]'}`}>
                                <cat.icon size={26} className={`${cat.active ? 'animate-pulse drop-shadow-[0_0_10px_rgba(0,245,255,0.8)]' : 'group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]'} transition-all`} />
                                <span className="text-[10px] font-black uppercase tracking-[.2em]">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search Section */}
                    <div className="max-w-4xl mx-auto mb-20 text-center">
                        <h2 className="text-3xl font-black text-[#E0E0E0] tracking-wider uppercase mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                            Jelajahi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0056FF] to-[#00F5FF] drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]">Katalog</span> Epic
                        </h2>
                        <div className="relative group mx-4 md:mx-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#0056FF] to-[#00F5FF] rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
                            <div className="relative flex items-center bg-[#05070A]/80 border border-[#00F5FF]/30 backdrop-blur-xl rounded-2xl px-6 py-4 transition-all duration-300">
                                <Search className="w-6 h-6 text-[#00F5FF]/60 group-focus-within:text-[#00F5FF] transition-colors group-focus-within:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
                                <input
                                    type="text"
                                    placeholder="CARI GAME ATAU VOUCHER..."
                                    className="w-full bg-transparent pl-4 text-sm uppercase font-bold tracking-[.15em] outline-none text-[#E0E0E0] placeholder:text-[#E0E0E0]/30"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredProducts.map((p: any) => (
                            <a
                                href={`/produk/${p.slug}${config?.slug ? `?merchant=${config.slug}` : ''}`}
                                key={p.id}
                                className="group relative bg-[#05070A]/60 border border-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden hover:border-[#00F5FF]/50 transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,86,255,0.3)] hover:-translate-y-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0056FF]/5 to-[#05070A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="aspect-[4/5] relative overflow-hidden">
                                    <img
                                        src={p.image}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                        alt={p.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />

                                    {/* Glassmorphism Badge */}
                                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF] animate-pulse" />
                                            <span className="text-[8px] font-black text-[#E0E0E0] uppercase tracking-widest">ON</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 text-center">
                                        <div className="inline-block px-3 py-1 bg-[#0056FF]/30 border border-[#00F5FF]/30 backdrop-blur-md rounded-lg mb-2">
                                            <p className="text-[8px] font-black text-[#00F5FF] uppercase tracking-widest">Populer</p>
                                        </div>
                                        <h4 className="font-black text-sm text-[#E0E0E0] group-hover:text-[#00F5FF] transition-colors uppercase leading-tight drop-shadow-md truncate px-2">{p.name}</h4>
                                        <div className="mt-2 w-8 h-0.5 bg-gradient-to-r from-[#0056FF] to-[#00F5FF] mx-auto rounded-full group-hover:w-16 transition-all duration-500" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-24 text-center border border-[#00F5FF]/20 bg-[#0056FF]/5 rounded-[3rem] backdrop-blur-sm">
                            <Gamepad className="w-16 h-16 mx-auto mb-6 text-[#00F5FF]/40 drop-shadow-[0_0_15px_rgba(0,245,255,0.3)]" />
                            <p className="text-[#00F5FF] font-black uppercase tracking-[.3em] text-lg">Intel Tidak Menemukan Target</p>
                        </div>
                    )}
                </div>

                {/* Cyber Features Section */}
                <section className="relative py-28 mt-20 border-t border-[#00F5FF]/10 bg-gradient-to-b from-[#0056FF]/5 to-transparent overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-[0.2]" />
                    <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
                        {[
                            { icon: Zap, title: "Kecepatan Cahaya", desc: "Sistem Otomatis AI" },
                            { icon: ShieldCheck, title: "Keamanan Max", desc: "Enkripsi Berlapis" },
                            { icon: Clock, title: "Uptime 99.9%", desc: "Server Tempur 24/7" },
                            { icon: MessageSquare, title: "Dukungan Taktis", desc: "Agen Siaga Penuh" },
                        ].map((item, i) => (
                            <div key={i} className="group flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-2xl bg-[#05070A]/80 border border-[#00F5FF]/30 backdrop-blur-xl flex items-center justify-center text-[#00F5FF] mb-6 shadow-[0_0_20px_rgba(0,86,255,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all duration-500">
                                    <item.icon className="w-8 h-8 group-hover:drop-shadow-[0_0_10px_rgba(0,245,255,1)]" />
                                </div>
                                <h5 className="font-black text-[#E0E0E0] text-sm uppercase tracking-widest mb-2 group-hover:text-[#00F5FF] transition-colors">{item.title}</h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[.2em]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Futuristic Footer */}
            <footer className="relative py-20 border-t border-[#00F5FF]/20 bg-[#05070A]/90 backdrop-blur-xl z-10">
                <div className="container mx-auto px-6 text-center">
                    <div className="mb-12">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0056FF] to-[#00F5FF] p-[1px] mb-6 shadow-[0_0_30px_rgba(0,245,255,0.3)]">
                            <div className="w-full h-full bg-[#05070A] rounded-2xl flex items-center justify-center">
                                {config?.logo ? (
                                    <img src={config.logo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]" />
                                ) : (
                                    <Laptop className="w-8 h-8 text-[#00F5FF] drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
                                )}
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E0E0E0] to-[#00F5FF] uppercase tracking-[.2em] mb-4 drop-shadow-lg">
                            {config.name}
                        </h2>
                        <p className="text-sm text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                            Akses dimensi baru dalam transaksi gaming. Pengalaman top-up premium, instan, dan 100% dijamin aman oleh protokol tingkat tinggi.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 mb-16">
                        {['Beranda', 'Katalog', 'Status Pesanan', 'Pusat Bantuan', 'Term of Service'].map((link, i) => (
                            <a key={i} href="#" className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-[#00F5FF] hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] transition-all">
                                {link}
                            </a>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                        <p className="text-[10px] font-black text-[#E0E0E0]/30 uppercase tracking-[.3em]">
                            © {new Date().getFullYear()} {config.name} SYSTEM. ALL PROTOCOLS ACTIVE.
                        </p>
                        <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
                            <span className="text-[9px] font-black text-[#00F5FF]/60 tracking-[.4em] uppercase shadow-sm">Powered by DagangPlay Engine</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MerchantStorefront;

