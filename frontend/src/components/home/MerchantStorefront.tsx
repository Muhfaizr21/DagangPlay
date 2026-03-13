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
    isLoading?: boolean;
}

const MerchantStorefront = ({ config, contentData, filteredProducts, search, setSearch, isLoading }: MerchantStorefrontProps) => {
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

                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            {/* Background Base */}
            <div className="fixed inset-0 bg-mesh-ultra pointer-events-none" />
            
            {/* Preview Banner */}
            {isPreview && !isLoading && (
                <div className="relative z-[200] h-8 bg-gradient-to-r from-[#D62828] via-[#F77F00] to-[#FCBF49] flex items-center justify-center gap-3 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 animate-pulse" />
                    <span className="text-[9px] font-black text-[#001D2D] uppercase tracking-[0.5em] relative z-10 italic flex items-center gap-2">
                        <Lock size={10} /> PREVIEW MODE ACTIVE — VIEW ONLY
                    </span>
                </div>
            )}

            {/* Top Navigation */}
            <header className={`fixed inset-x-0 z-[100] transition-all duration-500 ${isPreview ? 'top-8' : 'top-0'} ${scrolled ? 'py-4 bg-[#001D2D]/90 backdrop-blur-xl border-b border-white/5' : 'py-8 bg-transparent'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
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
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-12">
                        <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F77F00] no-underline">KATALOG</a>
                        <button onClick={() => setTrackModal(true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white bg-transparent border-none cursor-pointer">PESANAN</button>
                        <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white no-underline">BANTUAN</a>
                    </nav>

                    <div className="flex items-center gap-5">
                        <button className="bg-white text-[#001D2D] px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#F77F00] hover:text-white transition-all transform hover:-translate-y-0.5 shadow-xl">
                            LOGIN
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-44 pb-20">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-4 gap-8 mb-16">
                        <div className="lg:col-span-3">
                            <div className="rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5 p-2 bg-white/5">
                                {isLoading ? (
                                    <div className="aspect-[21/9] bg-white/5 rounded-[2.5rem] shimmer flex items-center justify-center">
                                         <Zap size={48} className="text-white/5 animate-pulse" />
                                    </div>
                                ) : (
                                    <PremiumSlider banners={contentData?.banners || []} theme="dark" />
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-1 grid grid-rows-2 gap-6">
                            <div className="bento-card p-8 rounded-[2.5rem] flex flex-col justify-center gap-4 group">
                                <Zap size={24} className="text-[#D62828]" />
                                <h3 className="text-xl font-black uppercase italic">Instant Delivery</h3>
                                <p className="text-xs text-white/40 italic">System otomatis memproses pesanan Anda dalam hitungan detik.</p>
                            </div>
                            <div className="bento-card p-8 rounded-[2.5rem] bg-gradient-to-br from-[#003049] to-[#001D2D] group">
                                <Trophy size={24} className="text-[#FCBF49]" />
                                <h3 className="text-xl font-black uppercase italic mt-4">Best Pricing</h3>
                                <p className="text-xs text-white/40 italic">Harga kompetitif dengan margin agen langsung.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-4">
                        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide w-full md:w-auto pb-4 md:pb-0">
                            {isLoading ? (
                                Array(5).fill(0).map((_,i) => <div key={i} className="w-32 h-12 bg-white/5 rounded-full shimmer" />)
                            ) : (
                                categoryList.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all border whitespace-nowrap ${selectedCategory === cat ? 'bg-[#F77F00] border-[#F77F00] text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                                    >
                                        {cat}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="w-full md:w-96 relative">
                             <input
                                type="text"
                                placeholder="CARI GAME..."
                                className="w-full bg-[#003049]/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-white outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {isLoading ? (
                            Array(12).fill(0).map((_,i) => (
                                <div key={i} className="aspect-[3.5/5] rounded-[2.5rem] bg-white/5 border border-white/5 shimmer" />
                            ))
                        ) : filteredProducts.map((p: any) => (
                            <a href={`/produk/${p.slug}${config?.slug ? `?merchant=${config.slug}` : ''}`} key={p.id} className="group">
                                <div className="relative aspect-[3.5/5] rounded-[2.5rem] overflow-hidden bento-card border-white/10 group-hover:border-[#F77F00]/30 shadow-xl">
                                    <img src={p.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" alt={p.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#001D2D] via-transparent to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                                        <h4 className="font-black text-sm uppercase italic truncate mb-2">{p.name}</h4>
                                        <span className="text-[8px] font-extrabold text-white/30 uppercase tracking-[0.2em]">{p.categoryName}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="bg-[#00121C] py-20 text-center border-t border-white/5">
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 italic">
                    © {new Date().getFullYear()} {config?.name?.toUpperCase() || 'STORE'} — SECURE PROTOCOL
                </p>
            </footer>

            {trackModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-[#001D2D]/90 backdrop-blur-2xl" onClick={() => setTrackModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-[#001D2D] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-black italic uppercase text-white">Lacak Pesanan</h2>
                            <button onClick={() => setTrackModal(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleTrack}>
                            <input 
                                type="text" 
                                placeholder="Nomor WA (08XXXXXXXXXX)"
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-[#F77F00]"
                            />
                            <button disabled={isTracking} type="submit" className="w-full mt-4 bg-white text-[#001D2D] h-14 rounded-2xl font-black uppercase tracking-widest">
                                {isTracking ? '...' : 'CARI'}
                            </button>
                        </form>
                        <div className="mt-10 space-y-4">
                            {trackingResults.map((order) => (
                                <div key={order.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex justify-between text-[10px] font-black italic text-[#F77F00] mb-2">
                                        <span>{order.orderNumber}</span>
                                        <span>{order.paymentStatus}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-black text-white">{order.productName}</span>
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
