"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { PremiumSlider } from "./HomeComponents";
import { 
  Search, ShoppingBag, ShieldCheck, Zap, Laptop, Clock, 
  MessageSquare, ChevronRight, Gamepad, Wallet, Phone, 
  Smartphone, Star, ArrowRight, TrendingUp, Sparkles,
  Trophy, Heart, Filter, Monitor, Menu, X, Bell, Lock
} from "lucide-react";

interface MerchantStorefrontProps {
    config: any;
    contentData: any;
    filteredProducts: any;
    search: string;
    setSearch: (val: string) => void;
}

const MerchantStorefront = ({ config, contentData, filteredProducts, search, setSearch }: MerchantStorefrontProps) => {
    const [scrolled, setScrolled] = useState(false);
    const [trackModal, setTrackModal] = useState(false);
    const [searchPhone, setSearchPhone] = useState('');
    const [trackingResults, setTrackingResults] = useState<any[]>([]);
    const [isTracking, setIsTracking] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchPhone) return;
        setIsTracking(true);
        try {
            const res = await axios.get(`${baseUrl}/public/orders/search?phone=${searchPhone}`);
            setTrackingResults(res.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Pesanan tidak ditemukan');
        } finally {
            setIsTracking(false);
        }
    };
    const [selectedCategory, setSelectedCategory] = useState("SEMUA");
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isPreview = !config?.id;

    // Filter categories dynamically (simulation if not provided)
    const categoryList = useMemo(() => {
        const cats = ["SEMUA", "GAME", "E-WALLET", "PULSA", "APLIKASI"];
        return cats;
    }, []);

    return (
        <div className="min-h-screen bg-[#001D2D] text-white font-outfit selection:bg-[#F77F00] selection:text-white relative overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                body {
                    font-family: 'Outfit', sans-serif;
                    background-color: #001D2D;
                }

                .bg-mesh-ultra {
                    background: 
                        radial-gradient(circle at 0% 0%, rgba(214, 40, 40, 0.08) 0%, transparent 40%),
                        radial-gradient(circle at 100% 0%, rgba(247, 127, 0, 0.05) 0%, transparent 40%),
                        radial-gradient(circle at 50% 100%, rgba(0, 48, 73, 1) 0%, transparent 50%),
                        #001D2D;
                }

                .bento-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bento-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(247, 127, 0, 0.2);
                    transform: translateY(-4px);
                }

                .premium-gradient-text {
                    background: linear-gradient(to right, #FCBF49, #F77F00, #D62828);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Background Base */}
            <div className="fixed inset-0 bg-mesh-ultra pointer-events-none" />
            
            {/* Preview Banner - Slim & Modern */}
            {isPreview && (
                <div className="relative z-[200] h-8 bg-gradient-to-r from-[#D62828] via-[#F77F00] to-[#FCBF49] flex items-center justify-center gap-3 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 animate-pulse" />
                    <span className="text-[9px] font-black text-[#001D2D] uppercase tracking-[0.5em] relative z-10 italic flex items-center gap-2">
                        <Lock size={10} /> PREVIEW MODE ACTIVE — VIEW ONLY
                    </span>
                </div>
            )}

            {/* Top Navigation - Ultra Sleek */}
            <header className={`fixed inset-x-0 z-[100] transition-all duration-500 ${isPreview ? 'top-8' : 'top-0'} ${scrolled ? 'py-4 bg-[#001D2D]/90 backdrop-blur-xl border-b border-white/5' : 'py-8 bg-transparent'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#F77F00] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative w-full h-full bg-[#003049] border border-white/10 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-2xl">
                                {config?.logo ? (
                                    <img src={config.logo} alt="Logo" className="w-7 h-7 object-contain" />
                                ) : (
                                    <Gamepad className="w-6 h-6 text-[#FCBF49]" />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
                                <span className="text-white">{config?.name?.split(' ')[0] || 'DEMO'}</span>
                                <span className="premium-gradient-text ml-1.5">{config?.name?.split(' ').slice(1).join(' ') || 'STORE'}</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F77F00] animate-pulse"></span>
                                <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em]">Operational 24/7</span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="hidden lg:flex items-center gap-12">
                        <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F77F00] transition-all relative group no-underline">
                            KATALOG
                            <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-[#F77F00]"></span>
                        </a>
                        <button onClick={() => setTrackModal(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all relative group bg-transparent border-none cursor-pointer">
                            PESANAN
                            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-[#F77F00] transition-all group-hover:w-full"></span>
                        </button>
                        <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all relative group no-underline">
                            HARGA
                            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-[#F77F00] transition-all group-hover:w-full"></span>
                        </a>
                        <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all relative group no-underline">
                            BANTUAN
                            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-[#F77F00] transition-all group-hover:w-full"></span>
                        </a>
                    </nav>

                    {/* Quick Access */}
                    <div className="flex items-center gap-5">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer">
                            <Search size={16} className="text-[#F77F00]" />
                            <span className="text-[10px] font-bold text-white/40 group-hover:text-white tracking-widest uppercase">Search...</span>
                        </div>
                        <button className="flex items-center gap-2 bg-white text-[#001D2D] px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#F77F00] hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl">
                            <ShieldCheck size={14} /> LOGIN
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-44 pb-20">
                <div className="container mx-auto px-6">
                    
                    {/* Top Row: Hero & Side Stats */}
                    <div className="grid lg:grid-cols-4 gap-8 mb-16">
                        {/* Main Slider */}
                        <div className="lg:col-span-3">
                            <div className="rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5 p-2 bg-white/5">
                                <PremiumSlider banners={contentData?.banners || []} theme="dark" />
                            </div>
                        </div>
                        
                        {/* Side Feature Bento */}
                        <div className="lg:col-span-1 grid grid-rows-2 gap-6">
                            <div className="bento-card p-8 rounded-[2.5rem] flex flex-col justify-center gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-[#D62828]/10 border border-[#D62828]/20 flex items-center justify-center text-[#D62828] mb-2 group-hover:scale-110 transition-transform">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic leading-tight">Instant Delivery</h3>
                                <p className="text-xs text-white/40 font-medium leading-relaxed italic">System otomatis memproses pesanan Anda dalam hitungan detik setelah pembayaran.</p>
                            </div>
                            <div className="bento-card p-8 rounded-[2.5rem] bg-gradient-to-br from-[#003049] to-[#001D2D] border-[#FCBF49]/10 group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FCBF49]/10 border border-[#FCBF49]/20 flex items-center justify-center text-[#FCBF49]">
                                        <Trophy size={24} />
                                    </div>
                                    <span className="text-[10px] font-black text-[#F77F00] uppercase tracking-widest">Active</span>
                                </div>
                                <h3 className="text-xl font-black uppercase italic leading-tight mb-2">Best Pricing</h3>
                                <p className="text-xs text-white/40 font-medium leading-relaxed italic">Kami memberikan harga kompetitif dengan margin agen langsung dari provider.</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search Bar - Professional Layout */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-4">
                        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide w-full md:w-auto pb-4 md:pb-0">
                            {categoryList.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all border whitespace-nowrap ${selectedCategory === cat ? 'bg-[#F77F00] border-[#F77F00] text-white shadow-lg shadow-[#F77F00]/20' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        
                        <div className="w-full md:w-96 relative group">
                            <div className="absolute inset-0 bg-[#F77F00] blur-2xl opacity-10 group-focus-within:opacity-25 transition-opacity"></div>
                            <div className="relative flex items-center bg-[#003049]/40 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-4">
                                <Search size={20} className="text-[#FCBF49]" />
                                <input
                                    type="text"
                                    placeholder="CARI GAME..."
                                    className="w-full bg-transparent pl-4 text-xs font-black uppercase tracking-widest outline-none text-white placeholder:text-white/10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trending Section Overlay */}
                    <div className="mb-12 flex items-center gap-4 px-4">
                        <div className="w-1.5 h-6 bg-[#D62828] rounded-full"></div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">Katalog <span className="premium-gradient-text">Terpopuler</span></h2>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </div>

                    {/* Product Grid - Refined Spacing */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {filteredProducts.map((p: any) => (
                            <a
                                href={`/produk/${p.slug}${config?.slug ? `?merchant=${config.slug}` : ''}`}
                                key={p.id}
                                className="group block"
                            >
                                <div className="relative aspect-[3.5/5] rounded-[2.5rem] overflow-hidden bento-card border-white/10 group-hover:border-[#F77F00]/30 shadow-xl">
                                    {/* Product Image */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={p.image}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                            alt={p.name}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#001D2D] via-[#001D2D]/20 to-transparent"></div>
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="w-8 h-1 bg-[#F77F00] rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <h4 className="font-black text-sm uppercase leading-tight italic truncate mb-2 group-hover:text-[#FCBF49] transition-colors">{p.name}</h4>
                                        <span className="text-[8px] font-extrabold text-white/30 uppercase tracking-[0.2em]">{p.categoryName || 'Active'}</span>
                                        
                                        {/* Hover Button */}
                                        <div className="mt-6 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden w-full">
                                            <div className="bg-white text-[#001D2D] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                Top Up <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Premium Badge */}
                                    <div className="absolute top-4 right-4 h-6 px-3 bg-[#001D2D]/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D62828] mr-2 shadow-[0_0_8px_#D62828]"></div>
                                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">PRO</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center bento-card rounded-[3rem] border-dashed border-white/10">
                            <Gamepad size={48} className="text-white/10 mb-6" />
                            <h3 className="text-xl font-black uppercase italic text-white/30">Target tidak ditemukan</h3>
                            <button onClick={() => setSearch("")} className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#F77F00] hover:underline underline-offset-4 transition-all">Reset Pencarian</button>
                        </div>
                    )}
                </div>
            </main>

            {/* Quality Section - Professional Layout */}
            <section className="relative py-32 bg-[#001D2D] border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12">
                        {[
                            { icon: ShieldCheck, title: "Layanan Aman", desc: "Produk 100% Legal & Terjamin Keamanannya" },
                            { icon: MessageSquare, title: "Live Support", desc: "Tim siaga membantu kendala Anda 24 Jam" },
                            { icon: Wallet, title: "Metode Lengkap", desc: "QRIS, E-Wallet, Retail, & Bank Transfer" },
                            { icon: Clock, title: "Anti Delay", desc: "Server High-Performance untuk transaski kilat" },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F77F00] mb-4 shadow-xl">
                                    <item.icon size={28} />
                                </div>
                                <h4 className="text-base font-black uppercase italic">{item.title}</h4>
                                <p className="text-[11px] text-white/30 font-medium leading-relaxed uppercase tracking-widest">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer - Professional Slab */}
            <footer className="relative bg-[#00121C] pt-24 pb-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D62828] rounded-full blur-[200px] opacity-[0.03]"></div>
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-5 gap-20 mb-20">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#F77F00] rounded-xl flex items-center justify-center rotate-3 shadow-lg">
                                    <Gamepad size={20} className="text-[#001D2D]" />
                                </div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                                    {config?.name || 'DEMO STORE'}
                                </h2>
                            </div>
                            <p className="text-sm text-white/30 font-medium leading-relaxed italic max-w-sm">
                                Platform top-up game dan voucher digital dengan standar profesional. Kami menjamin setiap transaksi aman, cepat, dan legal untuk kenyamanan gaming Anda.
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                {[MessageSquare, Heart, ShieldCheck].map((Icon, i) => (
                                    <div key={i} className="w-11 h-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/20 hover:text-[#F77F00] hover:border-[#F77F00]/40 transition-all cursor-pointer">
                                        <Icon size={18} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-12">
                            {[
                                { title: "Navigasi", links: ["Katalog Game", "Daftar Harga", "Cek Pesanan", "Bantuan"] },
                                { title: "Dukungan", links: ["Syarat & Ketentuan", "Kebijakan Privasi", "FAQ", "Kontak Kami"] },
                                { title: "Partner", links: ["DagangPlay SaaS", "Digiflazz", "Tripay Gateway"] }
                            ].map((col, i) => (
                                <div key={i} className="space-y-6">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FCBF49]">{col.title}</h5>
                                    <ul className="space-y-4">
                                        {col.links.map((link, j) => (
                                            <li key={j}>
                                                <a href="#" className="text-sm text-white/20 hover:text-white transition-colors no-underline font-semibold italic">{link}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex flex-col items-center md:items-start gap-1">
                             <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">
                                © {new Date().getFullYear()} {config?.name || 'DEMO STORE'}. POWERED BY PT DAGANGPLAY TEKNOLOGI INTI.
                             </span>
                        </div>
                        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5 flex items-center gap-4">
                            <span className="text-[9px] font-black text-[#F77F00] tracking-[0.5em] uppercase">SYSTEM VERSION 4.2.1-PRO</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Track Order Modal */}
            {trackModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-[#001D2D]/90 backdrop-blur-2xl" onClick={() => setTrackModal(false)}></div>
                    <div className="relative w-full max-w-xl glass-card rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Lacak Pesanan</h2>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[.3em] mt-1">Cek Riwayat Pembelian Anda</p>
                            </div>
                            <button onClick={() => setTrackModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleTrack} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[.4em] ml-2">Nomor Whatsapp (WA)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="08XXXXXXXXXX"
                                        value={searchPhone}
                                        onChange={(e) => setSearchPhone(e.target.value)}
                                        className="w-full h-16 px-8 bg-[#001D2D] border border-white/10 rounded-2xl font-black text-sm tracking-widest outline-none focus:border-[#F77F00] transition-all text-white"
                                    />
                                    <button 
                                        disabled={isTracking}
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-[#001D2D] px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#F77F00] hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {isTracking ? '...' : 'CARI'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-10 max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {trackingResults.length === 0 && !isTracking && (
                                <div className="py-10 text-center opacity-20 italic text-sm uppercase tracking-widest">
                                    Masukkan nomor WA untuk melihat history
                                </div>
                            )}
                            
                            {trackingResults.map((order) => (
                                <div key={order.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-[#F77F00] italic">{order.orderNumber}</span>
                                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                            order.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 
                                            order.paymentStatus === 'PENDING' ? 'bg-[#FCBF49]/10 text-[#FCBF49]' : 
                                            'bg-[#D62828]/10 text-[#D62828]'
                                        }`}>
                                            {order.paymentStatus || 'PENDING'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white leading-none">{order.productName}</span>
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">{order.productSkuName}</span>
                                        </div>
                                        <span className="text-sm font-black text-white italic">Rp {Number(order.totalPrice).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantStorefront;
