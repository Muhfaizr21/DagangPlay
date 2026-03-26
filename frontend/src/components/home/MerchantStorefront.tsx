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
    const [loginUrl, setLoginUrl] = useState("/admin/login");
    const [showPromo, setShowPromo] = useState(true);

    // Live Notification State
    const [liveNotif, setLiveNotif] = useState<any>(null);
    const [showLiveNotif, setShowLiveNotif] = useState(false);

    // Flash Sale Timer State
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

    // 🔒 Feature flag dari backend planFeatures — bukan hardcode plan name
    // config.planFeatures dikirim dari halaman induk via /merchant/subscription atau storefront API
    const flashSaleEnabled = config?.planFeatures?.flashSale === true || (config?.plan === 'SUPREME' && config?.planFeatures === undefined);
    const fomoEnabled = config?.planFeatures?.flashSale === true || (config?.plan === 'SUPREME' && config?.planFeatures === undefined);
    // Backward compat: jika planFeatures belum ada, fallback ke cek plan name
    const isSupreme = config?.plan === 'SUPREME' || config?.isOfficial === true;

    // 1. Flash Sale Timer Logic — hanya aktif jika flag flashSale === true di planFeatures
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

    // 2. FOMO Live Buyer Notification — hanya aktif jika fomoEnabled === true
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

    // Fix #7: Category list dari produk aktual di storefront, bukan hardcode
    const categoryList = useMemo(() => {
        const defaultCats = ["SEMUA", "GAME", "E-WALLET", "PULSA", "APLIKASI"];
        if (!filteredProducts || filteredProducts.length === 0) return defaultCats;
        
        // Ambil kategori unik dari produk yang benar-benar ada
        const uniqueCats = Array.from(
            new Set(filteredProducts.map((p: any) => (p.category || 'GAME').toUpperCase()))
        ) as string[];
        
        return ["SEMUA", ...uniqueCats.sort()];
    }, [filteredProducts]);

    const heroBanners = contentData?.banners?.filter((b: any) => b.location === 'HERO' || !b.location) || [];
    const sidebarBanners = contentData?.banners?.filter((b: any) => b.location === 'SIDEBAR') || [];
    const footerBanners = contentData?.banners?.filter((b: any) => b.location === 'FOOTER') || [];

    const activePromo = contentData?.popupPromos?.[0];
    const activeAnnc = contentData?.announcements?.[0];

    return (
        <div className="min-h-screen bg-[#09090F] text-white overflow-x-hidden" style={{ fontFamily: "'Figtree', 'DM Sans', sans-serif" }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=DM+Mono:wght@400;500&display=swap');

                :root {
                    --go-start: #E8B84B;
                    --go-end:   #F77F00;
                    --bg:       #09090F;
                    --bg-2:     #0F0F18;
                    --bg-3:     #14141E;
                    --bd:       rgba(255,255,255,0.055);
                    --bd-h:     rgba(255,255,255,0.11);
                    --dim:      rgba(255,255,255,0.32);
                    --mid:      rgba(255,255,255,0.58);
                    --mono:     'DM Mono', monospace;
                }

                * { box-sizing: border-box; }
                body { font-family: 'Figtree', sans-serif; background: var(--bg); }

                /* gradient helpers */
                .go-text {
                    background: linear-gradient(135deg, var(--go-start) 0%, var(--go-end) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .go-fill { background: linear-gradient(135deg, var(--go-start) 0%, var(--go-end) 100%); }

                /* ── Navbar ── */
                .ms-nav {
                    background: rgba(9,9,15,0.82);
                    backdrop-filter: blur(22px) saturate(160%);
                    -webkit-backdrop-filter: blur(22px) saturate(160%);
                    border-bottom: 1px solid var(--bd);
                }

                /* ── Preview banner ── */
                .preview-bar {
                    background: linear-gradient(135deg, var(--go-start) 0%, var(--go-end) 100%);
                }

                /* ── Banner wrapper ── */
                .banner-wrap {
                    background: var(--bg-2);
                    border: 1px solid var(--bd);
                    border-radius: 20px;
                    overflow: hidden;
                }

                /* ── Bento info cards ── */
                .info-card {
                    background: var(--bg-2);
                    border: 1px solid var(--bd);
                    border-radius: 16px;
                    padding: 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    transition: border-color 0.25s, background 0.25s;
                }
                .info-card:hover {
                    border-color: rgba(232,184,75,0.2);
                    background: var(--bg-3);
                }
                .ic-icon {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    background: linear-gradient(135deg, rgba(232,184,75,0.12), rgba(247,127,0,0.1));
                    border: 1px solid rgba(232,184,75,0.18);
                }

                /* ── Category pills ── */
                .cat-pill {
                    padding: 8px 20px;
                    border-radius: 99px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid var(--bd);
                    background: var(--bg-2);
                    color: var(--dim);
                }
                .cat-pill:hover { border-color: var(--bd-h); color: white; }
                .cat-pill.active {
                    background: linear-gradient(135deg, var(--go-start), var(--go-end));
                    border-color: transparent;
                    color: #09090F;
                    box-shadow: 0 4px 16px rgba(247,127,0,0.22);
                }

                /* ── Search input ── */
                .ms-search {
                    width: 100%;
                    height: 44px;
                    background: var(--bg-2);
                    border: 1px solid var(--bd);
                    border-radius: 12px;
                    padding: 0 16px 0 42px;
                    font-size: 12px;
                    font-weight: 500;
                    color: white;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    font-family: 'Figtree', sans-serif;
                }
                .ms-search::placeholder { color: var(--dim); }
                .ms-search:focus {
                    border-color: rgba(232,184,75,0.35);
                    background: var(--bg-3);
                }

                /* ── Product grid card ── */
                .prod-card {
                    position: relative;
                    border-radius: 14px;
                    overflow: hidden;
                    border: 1px solid var(--bd);
                    background: var(--bg-2);
                    transition: transform 0.3s cubic-bezier(.25,.46,.45,.94), border-color 0.25s, box-shadow 0.3s;
                    cursor: pointer;
                    display: block;
                    text-decoration: none;
                }
                .prod-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(232,184,75,0.25);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,184,75,0.1);
                }
                .prod-card img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    opacity: 0.68;
                    transition: opacity 0.35s, transform 0.5s cubic-bezier(.25,.46,.45,.94);
                }
                .prod-card:hover img { opacity: 1; transform: scale(1.04); }
                .prod-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to top, rgba(9,9,15,0.96) 0%, rgba(9,9,15,0.3) 45%, transparent 100%);
                }
                .prod-info {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    padding: 14px 12px 12px;
                }

                /* ── Shimmer skeleton ── */
                .shimmer {
                    background: var(--bg-2);
                    background-image: linear-gradient(90deg, var(--bg-2) 0%, rgba(255,255,255,0.04) 50%, var(--bg-2) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.6s infinite;
                    border: 1px solid var(--bd);
                    border-radius: 14px;
                }
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }

                /* ── Scrollbar hide ── */
                .scroll-hide::-webkit-scrollbar { display: none; }
                .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

                /* ── Thin scrollbar ── */
                .thin-scroll::-webkit-scrollbar { width: 3px; }
                .thin-scroll::-webkit-scrollbar-track { background: transparent; }
                .thin-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

                /* ── Modal ── */
                .ms-modal {
                    background: var(--bg-2);
                    border: 1px solid rgba(232,184,75,0.12);
                    border-radius: 24px;
                    animation: modalPop 0.22s ease;
                }
                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to   { opacity: 1; transform: none; }
                }

                /* ── Modal input ── */
                .ms-modal-input {
                    width: 100%;
                    height: 48px;
                    background: var(--bg-3);
                    border: 1px solid var(--bd);
                    border-radius: 10px;
                    padding: 0 16px;
                    font-size: 13px;
                    font-weight: 500;
                    color: white;
                    outline: none;
                    transition: border-color 0.2s;
                    font-family: 'Figtree', sans-serif;
                }
                .ms-modal-input::placeholder { color: var(--dim); }
                .ms-modal-input:focus { border-color: rgba(232,184,75,0.4); }

                /* ── Track order result card ── */
                .track-card {
                    background: var(--bg-3);
                    border: 1px solid var(--bd);
                    border-radius: 12px;
                    padding: 14px 16px;
                    transition: border-color 0.2s;
                }
                .track-card:hover { border-color: var(--bd-h); }

                /* ── Section label ── */
                .section-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.28em;
                    text-transform: uppercase;
                    color: var(--dim);
                    font-family: 'DM Mono', monospace;
                }

                /* ── Ambient glow ── */
                .ambient {
                    position: fixed; top: -200px; left: 50%;
                    transform: translateX(-50%);
                    width: 900px; height: 500px;
                    background: radial-gradient(ellipse at top, rgba(232,184,75,0.055) 0%, transparent 65%);
                    pointer-events: none; z-index: 0;
                }

                /* ── Login btn ── */
                .login-btn {
                    background: linear-gradient(135deg, var(--go-start) 0%, var(--go-end) 100%);
                    color: #09090F;
                    font-weight: 700;
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    padding: 9px 20px;
                    border-radius: 10px;
                    transition: opacity 0.2s, transform 0.2s;
                }
                .login-btn:hover { opacity: 0.88; transform: translateY(-1px); }

                /* status badges */
                .s-paid    { background: rgba(52,211,153,0.1); color: #34D399; }
                .s-pending { background: rgba(232,184,75,0.1);  color: #E8B84B; }
                .s-failed  { background: rgba(239,68,68,0.1);   color: #EF4444; }

                /* ── Live Notif Slide ── */
                @keyframes slideNotifUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.9); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes slideNotifDown {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to   { opacity: 0; transform: translateY(40px) scale(0.9); }
                }
                .notif-enter { animation: slideNotifUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .notif-exit { animation: slideNotifDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                /* ── Timer Box ── */
                .timer-box {
                    background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 8px;
                    min-width: 32px;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--mono);
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                }
            `}</style>

            {/* Ambient top glow */}
            <div className="ambient" />

            {/* Preview Banner */}
            {isPreview && !isLoading && (
                <div className="relative z-[200] h-8 preview-bar flex items-center justify-center gap-2">
                    <Lock size={9} className="text-[#09090F]" />
                    <span className="text-[9px] font-black text-[#09090F] uppercase tracking-[0.45em]">Preview Mode Active — View Only</span>
                </div>
            )}

            {/* Announcement Bar */}
            {!isLoading && activeAnnc && (
                <div className="relative z-[200] w-full py-2.5 px-6" style={{ background: 'linear-gradient(90deg, #1E1B4B, #312E81)' }}>
                    <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 sm:gap-4 overflow-hidden">
                        <Bell size={13} className="text-indigo-300 flex-shrink-0 animate-bounce" />
                        <span className="text-[10px] sm:text-[11px] font-black text-indigo-100 uppercase tracking-widest flex-shrink-0">{activeAnnc.title}:</span>
                        <span className="text-[10px] sm:text-[11px] font-medium text-indigo-50 truncate">{activeAnnc.content}</span>
                    </div>
                </div>
            )}

            {/* ── NAVBAR ── */}
            <header className={`ms-nav fixed inset-x-0 z-[100] transition-all duration-400 ${(isPreview || activeAnnc) ? 'top-8' : 'top-0'}`}>
                <div className="max-w-[1280px] mx-auto px-6 h-[58px] flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-95"
                            style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.15), rgba(247,127,0,0.1))', border: '1px solid rgba(232,184,75,0.2)' }}>
                            {config?.logo
                                ? <img src={config.logo} alt="Logo" className="w-5 h-5 object-contain" />
                                : <Gamepad className="w-4 h-4" style={{ color: '#E8B84B' }} />}
                        </div>
                        <h1 className="text-[16px] font-extrabold tracking-tight leading-none">
                            <span className="text-white">{config?.name?.split(' ')[0] || 'DEMO'}</span>
                            {config?.name?.split(' ').slice(1).join(' ') && (
                                <span className="go-text ml-1">{config?.name?.split(' ').slice(1).join(' ')}</span>
                            )}
                            {!config?.name && <span className="go-text ml-1">STORE</span>}
                        </h1>
                    </div>

                    {/* Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        {[
                            { label: 'Katalog', active: true, onClick: undefined },
                            { label: 'Pesanan', active: false, onClick: () => setTrackModal(true) },
                            { label: 'Bantuan', active: false, onClick: undefined },
                        ].map(item => (
                            item.onClick
                                ? <button key={item.label} onClick={item.onClick}
                                    className="text-[11px] font-semibold uppercase tracking-[0.16em] bg-transparent border-none cursor-pointer transition-colors"
                                    style={{ color: item.active ? '#E8B84B' : 'var(--dim)' }}>
                                    {item.label}
                                </button>
                                : <a key={item.label} href="#"
                                    className="text-[11px] font-semibold uppercase tracking-[0.16em] no-underline transition-colors"
                                    style={{ color: item.active ? '#E8B84B' : 'var(--dim)' }}>
                                    {item.label}
                                </a>
                        ))}
                    </nav>

                    <a href={loginUrl} className="login-btn no-underline flex items-center justify-center">
                        {loginUrl === '/admin/login' ? 'Login' : 'Dashboard'}
                    </a>
                </div>
            </header>

            <main className="relative z-10 max-w-[1280px] mx-auto px-6" style={{ paddingTop: (isPreview || activeAnnc) ? '100px' : '84px', paddingBottom: '80px' }}>

                {/* ── HERO BENTO ── */}
                <div className="grid lg:grid-cols-[1fr_260px] gap-4 mb-8">
                    {/* Banner */}
                    <div className="banner-wrap">
                        {isLoading ? (
                            <div className="aspect-[21/9] shimmer flex items-center justify-center">
                                <Zap size={40} style={{ color: 'rgba(255,255,255,0.04)' }} />
                            </div>
                        ) : (
                            <PremiumSlider banners={heroBanners} theme="dark" />
                        )}
                    </div>

                    {/* Side cards — Fix #8: dari config merchant, bukan hardcode */}
                    <div className="flex flex-row lg:flex-col gap-4">
                        <div className="info-card flex-1">
                            <div className="ic-icon">
                                <Zap size={16} style={{ color: '#E8B84B' }} />
                            </div>
                            <p className="text-[15px] font-bold text-white leading-tight">
                                {config?.infoCard1Title || 'Instant Delivery'}
                            </p>
                            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--dim)' }}>
                                {config?.infoCard1Desc || 'Proses otomatis dalam hitungan detik.'}
                            </p>
                        </div>
                        <div className="info-card flex-1" style={{ background: 'linear-gradient(135deg, rgba(232,184,75,0.06), rgba(247,127,0,0.04))' }}>
                            <div className="ic-icon">
                                <Trophy size={16} style={{ color: '#E8B84B' }} />
                            </div>
                            <p className="text-[15px] font-bold text-white leading-tight">
                                {config?.infoCard2Title || 'Harga Terbaik'}
                            </p>
                            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--dim)' }}>
                                {config?.infoCard2Desc || 'Margin kompetitif langsung dari agen.'}
                            </p>
                        </div>
                        {/* Sidebar Banners */}
                        {!isLoading && sidebarBanners.map((b: any) => (
                            <a href={b.linkUrl || '#'} key={b.id} className="hidden lg:block w-full rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.055)] hover:border-[rgba(232,184,75,0.2)] transition-colors">
                                <img src={b.imageUrl} alt={b.title} className="w-full object-cover" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── FILTER BAR ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    {/* Category pills */}
                    <div className="flex items-center gap-2 overflow-x-auto scroll-hide w-full sm:w-auto pb-1 sm:pb-0">
                        {isLoading
                            ? Array(5).fill(0).map((_, i) => (
                                <div key={i} className="shimmer w-24 h-9 rounded-full flex-shrink-0" />
                            ))
                            : categoryList.map(cat => (
                                <button key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`cat-pill flex-shrink-0 ${selectedCategory === cat ? 'active' : ''}`}>
                                    {cat}
                                </button>
                            ))
                        }
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-[260px] flex-shrink-0">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--dim)' }} />
                        <input
                            type="text"
                            placeholder="Cari game…"
                            className="ms-search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── FLASH SALE BANNER (Exclusive SUPREME) ── */}
                {isSupreme && (
                    <div className="mb-6 rounded-[18px] overflow-hidden relative" style={{ background: 'linear-gradient(90deg, #7F1D1D 0%, #B91C1C 50%, #7F1D1D 100%)', border: '1px solid rgba(255,100,100,0.2)' }}>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
                        <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 animate-pulse">
                                    <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider italic">Flash Sale Dimulai!</h3>
                                    <p className="text-[10px] text-red-200 mt-0.5 font-medium uppercase tracking-[0.1em]">Diskon Terbesar Hari Ini</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-100 mr-2 border-r border-red-400/30 pr-4">Berakhir dalam:</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="timer-box text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
                                    <span className="text-white/50 font-bold mb-1">:</span>
                                    <span className="timer-box text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                                    <span className="text-white/50 font-bold mb-1">:</span>
                                    <span className="timer-box text-red-300">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section label ── */}
                <div className="flex items-center gap-3 mb-5 mt-8">
                    <span className="section-label">
                        {isLoading ? 'Memuat' : `TOP UP GAME TERPOPULER (${filteredProducts?.length || 0})`}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--bd)' }} />
                </div>

                {/* ── Product Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3.5">
                    {isLoading
                        ? Array(14).fill(0).map((_, i) => (
                            <div key={i} className="shimmer aspect-[3/4]" />
                        ))
                        : filteredProducts.map((p: any) => (
                            <a
                                href={`/produk/${p.slug}${config?.slug ? `?merchant=${config.slug}` : ''}`}
                                key={p.id}
                                className="prod-card"
                            >
                                <div className="aspect-[3/4]">
                                    <img src={p.image} alt={p.name} />
                                </div>
                                <div className="prod-overlay" />
                                <div className="prod-info">
                                    <p className="text-[12px] font-bold text-white leading-tight truncate">{p.name}</p>
                                    <p className="text-[9px] font-medium uppercase tracking-[0.18em] mt-1 truncate" style={{ color: 'rgba(232,184,75,0.55)' }}>{p.categoryName}</p>
                                </div>
                            </a>
                        ))
                    }
                </div>
            </main>

            {/* ── FOOTER BANNERS ── */}
            {!isLoading && footerBanners.length > 0 && (
                <div className="relative z-10 max-w-[1280px] mx-auto px-6 mb-10">
                    <div className={`grid gap-4 ${footerBanners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
                        {footerBanners.map((b: any) => (
                            <a href={b.linkUrl || '#'} key={b.id} className="block w-full rounded-[20px] overflow-hidden border border-[rgba(255,255,255,0.055)] hover:border-[rgba(232,184,75,0.3)] transition-colors group">
                                <img src={b.imageUrl} alt={b.title} className="w-full max-h-[180px] sm:max-h-[220px] object-cover group-hover:scale-105 transition-transform duration-500" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* ── FOOTER ── */}
            <footer className="relative z-10 py-10 text-center" style={{ borderTop: '1px solid var(--bd)', background: '#06060B' }}>
                <p className="text-[9px] font-medium uppercase tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.1)' }}>
                    © {new Date().getFullYear()} {config?.name?.toUpperCase() || 'STORE'} — Secure Protocol
                </p>
            </footer>

            {/* ── TRACK ORDER MODAL ── */}
            {trackModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-5">
                    <div className="absolute inset-0 bg-[#09090F]/75 backdrop-blur-2xl" onClick={() => setTrackModal(false)} />
                    <div className="ms-modal relative w-full max-w-[480px] p-7 shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-[18px] font-bold text-white tracking-tight">Lacak Pesanan</h2>
                                <p className="text-[10px] uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--dim)' }}>Cek Riwayat Pembelian</p>
                            </div>
                            <button onClick={() => setTrackModal(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: 'var(--bg-3)', border: '1px solid var(--bd)', color: 'var(--dim)' }}>
                                <X size={15} />
                            </button>
                        </div>

                        {/* Search form */}
                        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                placeholder="08XXXXXXXXXX"
                                value={searchPhone}
                                onChange={e => setSearchPhone(e.target.value)}
                                className="ms-modal-input flex-1"
                            />
                            <button type="submit" disabled={isTracking}
                                className="login-btn flex-shrink-0 px-5 disabled:opacity-40"
                                style={{ height: '48px', borderRadius: '10px' }}>
                                {isTracking ? '…' : 'Cari'}
                            </button>
                        </form>

                        {/* Results */}
                        <div className="space-y-2.5 max-h-[360px] overflow-y-auto thin-scroll">
                            {trackingResults.length === 0 && !isTracking && (
                                <div className="py-10 text-center text-[11px] uppercase tracking-widest font-medium" style={{ color: 'rgba(255,255,255,0.1)' }}>
                                    Masukkan nomor WA untuk melihat riwayat
                                </div>
                            )}
                            {trackingResults.map(order => (
                                <div key={order.id} className="track-card">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <span className="text-[11px] font-semibold go-text">{order.orderNumber}</span>
                                        <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.paymentStatus === 'PAID' ? 's-paid' :
                                                order.paymentStatus === 'PENDING' ? 's-pending' : 's-failed'
                                            }`}>
                                            {order.paymentStatus || 'PENDING'}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[13px] font-semibold text-white">{order.productName}</p>
                                            <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--dim)' }}>{order.productSkuName}</p>
                                        </div>
                                        <span className="text-[14px] font-bold text-white ml-4 flex-shrink-0">
                                            Rp {Number(order.totalPrice).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── POPUP PROMO MODAL ── */}
            {activePromo && showPromo && !isLoading && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center px-5">
                    <div className="absolute inset-0 bg-[#09090F]/80 backdrop-blur-md" onClick={() => setShowPromo(false)} />
                    <div className="relative bg-[#0F0F18] border border-white/10 rounded-[28px] overflow-hidden max-w-[420px] w-full shadow-2xl" style={{ animation: 'modalPop 0.3s cubic-bezier(.25,.46,.45,.94)' }}>
                        <button onClick={() => setShowPromo(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-black text-white rounded-full z-10 transition-colors backdrop-blur-md">
                            <X size={14} />
                        </button>
                        {activePromo.imageUrl && (
                            <a href={activePromo.linkUrl || '#'} className="block h-[220px] sm:h-[260px] w-full overflow-hidden">
                                <img src={activePromo.imageUrl} alt={activePromo.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                            </a>
                        )}
                        <div className="p-7 text-center">
                            <h3 className="text-xl font-black text-white mb-2 tracking-tight">{activePromo.title}</h3>
                            {activePromo.content && <p className="text-[13px] leading-relaxed" style={{ color: 'var(--dim)' }}>{activePromo.content}</p>}
                            <div className="mt-7 space-y-3">
                                {activePromo.linkUrl && (
                                    <a href={activePromo.linkUrl} className="block w-full py-3.5 bg-indigo-600 text-white text-[12px] font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-indigo-700 transition-colors shadow-[0_4px_16px_rgba(79,70,229,0.3)]">
                                        Lihat Promo
                                    </a>
                                )}
                                <button onClick={() => setShowPromo(false)} className="block w-full py-3 text-[11px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors" style={{ color: 'var(--dim)' }}>
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── FOMO LIVE BUYER NOTIFICATION (Exclusive SUPREME) ── */}
            {isSupreme && (
                <div className={`fixed bottom-6 lg:bottom-10 left-6 z-[350] pointer-events-none ${showLiveNotif ? 'notif-enter' : 'notif-exit opacity-0'}`} style={{ display: liveNotif ? 'block' : 'none' }}>
                    <div className="bg-[#0F0F18]/95 backdrop-blur-xl border border-[rgba(232,184,75,0.3)] p-3 pr-5 pl-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] flex items-center gap-3.5 max-w-[320px] pointer-events-auto">
                        <div className="w-11 h-11 rounded-lg bg-indigo-900/40 border border-indigo-500/20 flex-shrink-0 overflow-hidden relative">
                            {liveNotif?.image ? (
                                <img src={liveNotif.image} className="w-full h-full object-cover" alt="Product" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShieldCheck size={18} className="text-indigo-400" />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-[#0F0F18] flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-white leading-tight truncate">
                                <span className="font-bold text-emerald-400">{liveNotif?.name}</span> baru saja membeli
                            </p>
                            <p className="text-[13px] font-black italic mt-0.5 truncate go-text">
                                {liveNotif?.productName}
                            </p>
                            <p className="text-[9px] font-medium uppercase tracking-widest text-slate-500 mt-1">
                                {liveNotif?.time} menit yang lalu
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantStorefront;