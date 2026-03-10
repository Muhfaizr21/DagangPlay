"use client";
import React, { useState } from 'react';
import {
    Search, ShoppingCart, User, Gamepad, Zap, ChevronRight,
    MessageSquare, ShieldCheck, Wallet, LayoutGrid, List,
    Phone, Instagram, Facebook, Twitter, Mail
} from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';
import BannerSlider from "@/components/BannerSlider";
import AnnouncementBar from "@/components/AnnouncementBar";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function MerchantStorefront({ config }: { config: any }) {
    const [search, setSearch] = useState("");
    const [selectedCat, setSelectedCat] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: contentData } = useSWR(`${baseUrl}/public/products/content`, fetcher);
    const { data: categories } = useSWR(`${baseUrl}/public/products/categories`, fetcher);
    const { data: catalog } = useSWR(`${baseUrl}/public/products/full-catalog`, fetcher);

    const banners = contentData?.banners || [];
    const announcements = contentData?.announcements || [];

    const allProducts = catalog?.flatMap((cat: any) =>
        cat.products.map((p: any) => ({
            ...p,
            categoryName: cat.name,
            catSlug: cat.slug
        }))
    ) || [];

    const filteredProducts = allProducts.filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.categoryName?.toLowerCase().includes(search.toLowerCase());
        const matchesCat = !selectedCat || p.categoryName === selectedCat;
        return matchesSearch && matchesCat;
    });

    // Forced light theme for merchants to differentiate from official platform
    const isLight = true;

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden`}>
            {/* Elegant Top Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
                    {/* Brand Branding */}
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 p-0.5 flex items-center justify-center shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95">
                            {config?.logo ? (
                                <img src={config.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <Gamepad className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-black text-xl tracking-tight leading-none uppercase italic text-slate-900">
                                {config?.name || (config?.slug === 'dagangplay' ? "DagangPlay Official" : "Merchant Store")}
                            </h1>
                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em] mt-1.5 ">
                                Premium Gaming Hub
                            </p>
                        </div>
                    </div>

                    {/* Desktop Search Center */}
                    <div className="hidden lg:flex flex-1 max-w-xl relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari game favoritmu..."
                            className="w-full pl-14 pr-6 py-3.5 rounded-full border border-slate-100 bg-slate-50 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/50 transition-all text-sm font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                            Cek Pesanan
                        </button>
                        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                        <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all">
                            Partner Area
                        </button>
                    </div>
                </div>
            </header>

            {/* Announcement Section */}
            {announcements.length > 0 && (
                <div className="bg-slate-50 py-2">
                    <AnnouncementBar announcements={announcements} theme="light" />
                </div>
            )}

            {/* Premium Storefront Hero */}
            <main className="container mx-auto px-6 py-10 lg:py-16">
                <div className="relative mb-20">
                    <div className="rounded-[3.5rem] overflow-hidden shadow-2xl shadow-indigo-100 border-8 border-white bg-white">
                        <BannerSlider banners={banners} theme="light" />
                    </div>
                    {/* Floating Info Stats */}
                    <div className="hidden lg:flex absolute -bottom-8 right-12 bg-white rounded-3xl p-6 shadow-2xl shadow-indigo-100 border border-slate-50 gap-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Zap size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proses</p>
                                <p className="text-xs font-bold text-slate-900 leading-none mt-1">Instant 1 Detik</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><ShieldCheck size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legalitas</p>
                                <p className="text-xs font-bold text-slate-900 leading-none mt-1">Resmi & Aman</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-1.5 bg-indigo-600 rounded-full"></span>
                            <span className="text-indigo-600 font-black text-[11px] uppercase tracking-[0.4em]">Official Catalog</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase text-slate-900">
                            PILIH <span className="text-indigo-600">LAYANAN</span> GAME
                        </h2>
                    </div>

                    {/* Mobile Search Input (Visible only on mobile) */}
                    <div className="md:hidden relative w-full">
                        <input
                            type="text"
                            placeholder="Cari game..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 border-none outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Categories Filter Pills */}
                <div className="flex items-center gap-3 overflow-x-auto pb-10 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCat(null)}
                        className={`px-8 py-4 rounded-full text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest border-2 ${!selectedCat
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'}`}
                    >
                        Tampilkan Semua
                    </button>
                    {categories?.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCat(cat.name)}
                            className={`px-8 py-4 rounded-full text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest border-2 ${selectedCat === cat.name
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid - Premium Cards */}
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10"
                    : "space-y-4 max-w-4xl mx-auto"
                }>
                    {filteredProducts.map((p: any) => (
                        <a
                            href={`/produk/${p.catSlug}${config?.slug ? `?merchant=${config.slug}` : ''}`}
                            key={p.id}
                            className={`group relative rounded-[2.5rem] bg-white transition-all duration-500 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 ${viewMode === 'grid'
                                ? 'flex flex-col'
                                : 'flex items-center gap-6 p-4 rounded-3xl'
                                }`}
                        >
                            <div className={`overflow-hidden relative rounded-[2.2rem] ${viewMode === 'grid' ? 'm-3 aspect-[1/1]' : 'w-24 h-24'} shadow-lg`}>
                                {p.image ? (
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Gamepad className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">Klik untuk Top Up ➔</span>
                                </div>
                            </div>

                            <div className={viewMode === 'grid' ? "px-5 pb-6 pt-1 text-center" : "flex-1"}>
                                <span className="text-indigo-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 block">
                                    {p.categoryName}
                                </span>
                                <h3 className={`font-black tracking-tight leading-tight ${viewMode === 'grid' ? 'text-sm' : 'text-xl'} group-hover:text-indigo-600 transition-colors uppercase italic`}>
                                    {p.name}
                                </h3>
                                {viewMode === 'list' && <p className="text-slate-500 text-sm mt-2 font-medium">Layanan Top-Up instan aktif 24 jam nonstop.</p>}
                            </div>
                        </a>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-white shadow-indigo-100 shadow-xl rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tight mb-2 uppercase">Game Tidak Ditemukan</h3>
                        <p className="text-slate-500 font-medium">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
                    </div>
                )}
            </main>

            {/* Why Choose Us - Modern Strip */}
            <section className="bg-slate-50 py-24 border-y border-slate-100">
                <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-12">
                    {[
                        { icon: Zap, title: "INSTAN", desc: "Proses 1-3 detik" },
                        { icon: MessageSquare, title: "24/7 CS", desc: "Support Online" },
                        { icon: ShieldCheck, title: "AMAN", desc: "100% Produk Legal" },
                        { icon: Wallet, title: "LENGKAP", desc: "Beragam Pembayaran" },
                    ].map((feat, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="w-16 h-16 bg-white shadow-xl shadow-indigo-100/50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                                <feat.icon className="w-8 h-8" />
                            </div>
                            <h4 className="font-black text-sm mb-1 uppercase tracking-widest">{feat.title}</h4>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                    <Gamepad className="w-6 h-6" />
                                </div>
                                <span className="font-black text-2xl tracking-tighter uppercase italic">{config?.name || "Merchant Store"}</span>
                            </div>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md">
                                {config?.tagline || "Solusi top-up game tercepat dan termurah pilihan gamers indonesia. Proses otomatis 24 jam nonstop."}
                            </p>
                            <div className="flex items-center gap-4">
                                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all cursor-pointer bg-white">
                                    <Twitter className="w-4 h-4" />
                                </button>
                                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all cursor-pointer bg-white">
                                    <Instagram className="w-4 h-4" />
                                </button>
                                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all cursor-pointer bg-white">
                                    <Facebook className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6">Informasi</h4>
                            <ul className="space-y-4 list-none p-0">
                                <li><a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 no-underline">Cek Transaksi</a></li>
                                <li><a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 no-underline">Daftar Reseller</a></li>
                                <li><a href="#" className="text-sm font-bold text-slate-500 hover:text-indigo-600 no-underline">Tentang Kami</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6">Hubungi Kami</h4>
                            <ul className="space-y-4 list-none p-0">
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-500"><Mail className="w-4 h-4" /> {config?.contactEmail || "cs@dagangplay.com"}</li>
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-500"><Phone className="w-4 h-4" /> {config?.contactPhone || "+62 812-3456-789"}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            © {new Date().getFullYear()} {config?.name || "DagangPlay"}. Powering Gaming Commerce.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-[10px] text-slate-400 font-bold uppercase tracking-widest no-underline hover:text-indigo-600">Privacy Policy</a>
                            <a href="#" className="text-[10px] text-slate-400 font-bold uppercase tracking-widest no-underline hover:text-indigo-600">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a
                href={`https://wa.me/${config?.contactWhatsapp || "628123456789"}`}
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200 hover:scale-110 transition-transform z-[60]"
            >
                <Phone className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                </span>
            </a>

            <style jsx global>{`
                @font-face {
                    font-family: 'Inter';
                    src: url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                }
                body {
                    font-family: 'Inter', sans-serif;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
