"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { PremiumSlider } from "./HomeComponents";
import {
    Search, ShoppingBag, ShieldCheck, Zap, Laptop, Clock,
    MessageSquare, ChevronRight, Gamepad, Wallet, Phone,
    Smartphone, Star, ArrowRight, TrendingUp, Sparkles,
    Trophy, Heart, Filter, Monitor, Menu, X, Bell, Lock, Crosshair
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
    const [loginUrl, setLoginUrl] = useState("/admin/login");
    const [showPromo, setShowPromo] = useState(true);

    const [liveNotif, setLiveNotif] = useState<any>(null);
    const [showLiveNotif, setShowLiveNotif] = useState(false);

    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        try {
            const userData = localStorage.getItem('admin_user');
            const token = localStorage.getItem('admin_token');
            if (userData && token) {
                const parsed = JSON.parse(userData);
                if (parsed.role === 'MERCHANT') setLoginUrl('/merchant');
                else if (parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN_STAFF') setLoginUrl('/admin');
            }
        } catch { }
    }, []);

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

    const flashSaleEnabled = config?.planFeatures?.flashSale === true || (config?.plan === 'SUPREME' && config?.planFeatures === undefined);
    const fomoEnabled = config?.planFeatures?.flashSale === true || (config?.plan === 'SUPREME' && config?.planFeatures === undefined);
    const isSupreme = config?.plan === 'SUPREME' || config?.isOfficial === true;

    useEffect(() => {
        if (!flashSaleEnabled) return;
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            
            if (diff > 0) {
                return {
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                };
            }
            return { hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [flashSaleEnabled]);

    useEffect(() => {
        if (!fomoEnabled || !filteredProducts || filteredProducts.length === 0) return;

        const firstNames = ["Andi", "Budi", "Siti", "Rizky", "Putra", "Dewi", "Fajar", "Bintang", "Hendra", "Ayu", "Nanda", "Wahyu", "Alif", "Gilang", "Reza", "Yoga", "Dian"];
        let intervalRef: ReturnType<typeof setInterval>;
        
        const showNextNotif = () => {
            const randomProduct = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
            const randomName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const randomTime = Math.floor(Math.random() * 15) + 1;

            const maskedName = randomName.length > 2 
                ? `${randomName[0]}***${randomName[randomName.length - 1]}`
                : randomName;

            setLiveNotif({
                name: maskedName,
                productName: randomProduct.name,
                image: randomProduct.image,
                time: randomTime
            });
            
            setShowLiveNotif(true);
            setTimeout(() => setShowLiveNotif(false), 4000);
        };

        const initialTimer = setTimeout(() => {
            showNextNotif();
            intervalRef = setInterval(showNextNotif, Math.floor(Math.random() * 15000) + 15000);
        }, 5000);

        return () => {
            clearTimeout(initialTimer);
            if (intervalRef) clearInterval(intervalRef);
        };
    }, [filteredProducts, fomoEnabled]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isPreview = !config?.id;

    const categoryList = useMemo(() => {
        const defaultCats = ["SEMUA", "GAME", "E-WALLET", "PULSA", "APLIKASI"];
        if (!filteredProducts || filteredProducts.length === 0) return defaultCats;
        
        const uniqueCats = Array.from(
            new Set(filteredProducts.map((p: any) => (p.category || 'GAME').toUpperCase()))
        ) as string[];
        
        return ["SEMUA", ...uniqueCats.sort()];
    }, [filteredProducts]);

    const activePromo = contentData?.popupPromos?.[0];
    const activeAnnc = contentData?.announcements?.[0];

    return (
        <div className="min-h-screen bg-dp-bg text-white font-sans selection:bg-dp-primary/30 relative">

            {/* PREVIEW BANNER */}
            {isPreview && !isLoading && (
                <div className="fixed inset-x-0 top-0 z-[200] h-8 bg-dp-accent flex items-center justify-center gap-2 shadow-glow-accent">
                    <Lock size={12} className="text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Editor Preview Mode</span>
                </div>
            )}

            {/* ANNOUNCEMENT BAR */}
            {!isLoading && activeAnnc && (
                <div className={`fixed inset-x-0 z-[200] w-full py-2.5 px-6 border-b border-dp-secondary/30 bg-dp-secondary/20 backdrop-blur-xl ${isPreview ? 'top-8' : 'top-0'}`}>
                    <div className="max-w-[1240px] mx-auto flex items-center justify-center gap-3 overflow-hidden">
                        <Bell size={14} className="text-dp-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-dp-primary tracking-widest">{activeAnnc.title}:</span>
                        <span className="text-[10px] font-medium text-white/90 truncate">{activeAnnc.content}</span>
                    </div>
                </div>
            )}

            {/* NAVBAR */}
            <header className={`fixed inset-x-0 z-[100] transition-all duration-300 border-b ${scrolled ? 'bg-dp-surface/90 backdrop-blur-xl border-white/10 shadow-lg' : 'bg-transparent border-transparent'} ${(isPreview ? (activeAnnc ? 'top-[72px]' : 'top-8') : (activeAnnc ? 'top-[44px]' : 'top-0'))}`}>
                <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-dp-primary/50 transition-colors bg-black/50">
                            {config?.logo ? (
                                <img src={config.logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Gamepad className="w-5 h-5 text-dp-primary group-hover:drop-shadow-[0_0_8px_rgba(0,216,255,1)] transition-all" />
                            )}
                        </div>
                        <h1 className="text-xl font-display font-black tracking-tight text-white uppercase italic">
                            {config?.name || 'STORE'}
                        </h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                        {['Katalog', 'Cek Pesanan', 'Bantuan'].map((item, idx) => (
                            <button key={item} onClick={item === 'Cek Pesanan' ? () => setTrackModal(true) : undefined} className={`text-xs font-bold uppercase tracking-widest relative group ${idx === 0 ? 'text-white' : 'text-dp-muted hover:text-white transition-colors'}`}>
                                {item}
                                {idx === 0 && <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-dp-primary shadow-[0_0_8px_rgba(0,216,255,0.8)]" />}
                            </button>
                        ))}
                    </nav>

                    <a href={loginUrl} className="bg-white/10 border border-white/20 hover:bg-dp-primary hover:border-dp-primary hover:text-black hover:shadow-glow-primary text-white px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all">
                        {loginUrl === '/admin/login' ? 'Login' : 'Dashboard'}
                    </a>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <main className="relative z-10 max-w-[1240px] mx-auto px-6 pt-36 pb-24">
                
                {/* HERO BANNERS */}
                <div className="w-full h-[250px] sm:h-[350px] rounded-[32px] overflow-hidden mb-12 border border-white/10 relative shadow-2xl">
                     {isLoading ? (
                         <div className="w-full h-full flex items-center justify-center bg-dp-surface animate-pulse">
                             <Crosshair className="w-10 h-10 text-dp-muted animate-spin-slow" />
                         </div>
                     ) : (
                         <PremiumSlider banners={contentData?.banners?.filter((b:any) => b.location !== 'FOOTER')} theme="dark" />
                     )}
                     <div className="absolute inset-0 border-[2px] border-black/50 rounded-[32px] pointer-events-none" />
                </div>

                {/* FILTER BAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0">
                        {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="w-24 h-10 rounded-xl bg-white/5 border border-white/5 animate-pulse" />) :
                            categoryList.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-dp-primary/10 border-dp-primary text-dp-primary shadow-glow-primary' : 'bg-dp-surface/50 border-white/5 text-dp-muted hover:border-white/20 hover:text-white'}`}>
                                    {cat}
                                </button>
                            ))
                        }
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-dp-primary to-dp-secondary rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500" />
                        <div className="relative bg-dp-surface border border-white/10 rounded-xl flex items-center">
                            <Search size={16} className="absolute left-4 text-dp-muted group-hover:text-dp-primary transition-colors" />
                            <input type="text" placeholder="Search arsenal..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-12 bg-transparent pl-12 pr-4 text-[13px] font-bold text-white focus:outline-none placeholder:text-dp-muted" />
                        </div>
                    </div>
                </div>

                {/* FLASH SALE ALERT */}
                {isSupreme && !isLoading && (
                    <div className="mb-8 rounded-2xl bg-dp-accent/10 border border-dp-accent/30 p-1 relative overflow-hidden shadow-glow-accent">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-dp-accent/20 blur-[80px] pointer-events-none" />
                        <div className="bg-dp-surface rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-dp-accent/20 flex items-center justify-center border border-dp-accent/40 animate-pulse">
                                    <Zap className="w-6 h-6 text-dp-accent fill-dp-accent" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="font-display font-black text-xl text-white uppercase italic">Flash Sale Dimulai</h3>
                                    <p className="text-[11px] font-bold text-dp-accent uppercase tracking-widest mt-1">Diskon Terbesar Server Berjalan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-black/50 px-5 py-3 border border-white/10 rounded-xl">
                                <Clock className="w-5 h-5 text-white" />
                                <span className="font-display text-xl font-black text-white italic tracking-widest">{timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRODUCT LIST */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {isLoading
                        ? Array(12).fill(0).map((_, i) => <div key={i} className="aspect-[4/5] bg-white/5 rounded-[20px] animate-pulse" />)
                        : filteredProducts.map((p: any) => (
                                <a href={`/produk/${p.slug}${config?.slug ? `?merchant=${config.slug}` : ''}`} key={p.id} className="group relative block rounded-[20px] bg-dp-surface border border-white/5 hover:border-dp-primary overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-primary">
                                    <div className="aspect-[4/5] bg-[#000] relative">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#080A10] via-transparent to-transparent" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <div className="text-[9px] uppercase font-black text-dp-primary tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                                            <span className="w-1 h-1 rounded-full bg-dp-primary" /> {p.categoryName}
                                        </div>
                                        <div className="font-display text-[14px] font-black text-white uppercase italic truncate">{p.name}</div>
                                    </div>
                                </a>
                        ))
                    }
                </div>

            </main>

            {/* TRACK ORDER MODAL */}
            {trackModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-dp-bg/90 backdrop-blur-md" onClick={() => setTrackModal(false)} />
                    <div className="relative w-full max-w-xl glass-panel-glow rounded-[24px] overflow-hidden p-8 shadow-2xl animate-fade-in shadow-black">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="font-display font-black text-2xl text-white uppercase italic">Status Tracker</h2>
                                <p className="text-[10px] text-dp-primary font-bold tracking-widest uppercase mt-1">Cek Pesanan Real-Time</p>
                            </div>
                            <button onClick={() => setTrackModal(false)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-dp-accent hover:text-white flex items-center justify-center transition-colors text-dp-muted">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleTrack} className="flex gap-3 mb-6 relative">
                            <input type="text" placeholder="Phone Number (08XXXXXXXXX)" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} className="flex-1 bg-black/50 border border-white/20 rounded-xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-dp-primary transition-colors" />
                            <button type="submit" disabled={isTracking} className="bg-dp-primary text-black px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-white transition-colors">
                                Track
                            </button>
                        </form>
                        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                            {trackingResults.map((o: any) => (
                                <div key={o.id} className="p-5 bg-black/30 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between transition-colors">
                                    <div>
                                        <div className="text-sm font-black text-white uppercase">{o.productName}</div>
                                        <div className="text-[10px] text-dp-muted mt-1 font-mono">{o.orderNumber} &bull; Rp {Number(o.totalPrice).toLocaleString()}</div>
                                    </div>
                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${o.paymentStatus==='PAID'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': o.paymentStatus==='PENDING'?'bg-dp-gold/10 text-dp-gold border-dp-gold/30':'bg-dp-accent/10 text-dp-accent border-dp-accent/30'}`}>
                                        {o.paymentStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FOMO BUYER (Notification Bubble) */}
            {isSupreme && (
                <div className={`fixed bottom-6 left-6 z-[300] transition-all duration-500 pointer-events-none ${showLiveNotif ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                    <div className="bg-dp-surface/95 backdrop-blur-2xl border-l-[4px] border-dp-primary border-y border-r border-white/10 p-3 pr-6 pl-4 rounded-r-2xl rounded-l-md shadow-glow-primary flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black border border-white/10 flex-shrink-0">
                            {liveNotif?.image ? <img src={liveNotif.image} className="w-full h-full object-cover" alt="item" /> : <div className="w-full h-full bg-dp-primary/20 flex items-center justify-center"><Crosshair className="w-6 h-6 text-dp-primary" /></div>}
                        </div>
                        <div>
                            <div className="text-[11px] font-black text-white italic uppercase"><span className="text-dp-primary">{liveNotif?.name}</span> Acquired</div>
                            <div className="text-[13px] font-black text-dp-muted truncate mt-0.5">{liveNotif?.productName}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP PROMO MODAL */}
            {activePromo && showPromo && !isLoading && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-dp-bg/90 backdrop-blur-lg" onClick={() => setShowPromo(false)} />
                    <div className="relative bg-dp-surface border border-white/10 rounded-[28px] overflow-hidden max-w-sm w-full animate-slide-up shadow-2xl">
                        <button onClick={() => setShowPromo(false)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/60 backdrop-blur-md text-white rounded-full z-10 hover:bg-dp-accent transition-colors"><X size={16} /></button>
                        {activePromo.imageUrl && <img src={activePromo.imageUrl} alt={activePromo.title} className="w-full h-[240px] object-cover" />}
                        <div className="p-8 text-center bg-gradient-to-t from-dp-surface via-dp-surface to-transparent relative -mt-10 pt-14">
                            <h3 className="font-display text-2xl font-black text-white mb-2 uppercase italic">{activePromo.title}</h3>
                            <p className="text-xs font-medium text-dp-muted mb-8">{activePromo.content}</p>
                            {activePromo.linkUrl && <a href={activePromo.linkUrl} className="block w-full py-4 bg-dp-primary hover:bg-white text-black text-[12px] font-black uppercase tracking-widest rounded-xl mb-4 transition-colors shadow-glow-primary">Claim Drops</a>}
                            <button onClick={() => setShowPromo(false)} className="text-[10px] font-black text-dp-muted uppercase tracking-widest hover:text-white transition-colors">Close Intel</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="py-8 border-t border-white/5 text-center px-6 mt-16 bg-[#000]">
                <p className="text-[9px] font-black text-dp-muted uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} {config?.name || 'STORE'} &bull; Secure Protocol</p>
            </footer>
        </div>
    );
};

export default MerchantStorefront;