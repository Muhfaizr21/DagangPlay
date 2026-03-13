"use client";
import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Gamepad, Zap, MessageSquare, ShieldCheck, Wallet, ShoppingCart,
    ChevronRight, ArrowLeft, Phone, Mail, Instagram, Twitter, Facebook,
    Monitor, Trophy, Star, ArrowRight, Lock, Bell, X
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ProductTopupPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const searchParams = useSearchParams();
    const merchantSlug = searchParams.get('merchant');

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    const categoryUrl = merchantSlug
        ? `${baseUrl}/public/products/categories/${params.slug}?merchant=${merchantSlug}`
        : `${baseUrl}/public/products/categories/${params.slug}`;

    const configUrl = merchantSlug
        ? `${baseUrl}/public/orders/config?slug=${merchantSlug}`
        : `${baseUrl}/public/orders/config`;

    const swrConfig = {
        revalidateOnFocus: false,
        dedupingInterval: 10000 
    };

    const { data: category, error, isLoading } = useSWR(categoryUrl, fetcher, swrConfig);
    const { data: tripayChannelsResp } = useSWR(`${baseUrl}/public/orders/payment-channels`, fetcher, swrConfig);
    const { data: config } = useSWR(configUrl, fetcher, swrConfig);

    const [selectedSku, setSelectedSku] = useState<any>(null);
    const [gameId, setGameId] = useState('');
    const [serverId, setServerId] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isCheckoutting, setIsCheckoutting] = useState(false);

    // Tracking State
    const [trackModal, setTrackModal] = useState(false);
    const [searchPhone, setSearchPhone] = useState('');
    const [trackingResults, setTrackingResults] = useState<any[]>([]);
    const [isTracking, setIsTracking] = useState(false);

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

    const storeName = config?.name || "Premium Store";
    const storeLogo = config?.logo;

    // Dynamic SEO Title
    useEffect(() => {
        if (category?.name || storeName) {
            document.title = `${category?.name || 'Topup'} - ${storeName} | DagangPlay Pro`;
        }
    }, [category, storeName]);

    const paymentChannels = tripayChannelsResp?.data?.filter((ch: any) => ch.active !== false) || [];

    const handleBuy = async () => {
        if (!gameId) return alert('Silakan masukkan ID game Anda');
        if (bestProductInfo?.gameServerId && !serverId) return alert('Silakan masukkan Server ID game Anda');
        if (!selectedSku) return alert('Pilih nominal top up terlebih dahulu');
        if (!whatsapp) return alert('Masukkan nomor WhatsApp Anda');
        if (!selectedPayment) return alert('Pilih metode pembayaran');

        setIsCheckoutting(true);
        try {
            const res = await axios.post(`${baseUrl}/public/orders/checkout`, {
                skuId: selectedSku.id,
                gameId,
                serverId,
                whatsapp,
                paymentMethod: selectedPayment,
                merchant: merchantSlug
            });
            if (res.data.success && res.data.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            } else {
                alert('Gagal membuat pesanan');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Terjadi kesalahan sistem.');
        } finally {
            setIsCheckoutting(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#001D2D] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-white/40 animate-pulse uppercase tracking-widest text-[10px]">Syncing...</p>
        </div>
    );

    if (error || !category) return (
        <div className="min-h-screen bg-[#001D2D] text-white flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-white/5 text-[#D62828] rounded-full flex items-center justify-center">
                <Gamepad size={40} />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-black italic tracking-tight uppercase mb-2 text-white/80">Service Unavailable</h2>
                <p className="text-white/20 text-xs font-medium uppercase tracking-widest">Layanan Tidak Tersedia</p>
            </div>
            <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="bg-white text-[#001D2D] px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest no-underline hover:bg-[#F77F00] hover:text-white transition-all">
                Return to Storefront
            </Link>
        </div>
    );

    const allSkus = category.products.flatMap((p: any) => p.skus || []);
    const bestProductInfo = category.products.reduce((prev: any, current: any) =>
        (prev.skus?.length > current.skus?.length) ? prev : current
        , category.products[0]);

    return (
        <div className="min-h-screen bg-[#001D2D] text-white font-outfit selection:bg-[#F77F00] selection:text-white overflow-x-hidden antialiased">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                body {
                    font-family: 'Outfit', sans-serif;
                    background-color: #001D2D;
                }

                .bg-mesh-ultra {
                    background: 
                        radial-gradient(circle at 0% 0%, rgba(214, 40, 40, 0.06) 0%, transparent 40%),
                        radial-gradient(circle at 100% 0%, rgba(247, 127, 0, 0.04) 0%, transparent 40%),
                        radial-gradient(circle at 50% 100%, rgba(0, 48, 73, 0.8) 0%, transparent 50%),
                        #001D2D;
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.015);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                }

                .premium-gradient-text {
                    background: linear-gradient(to right, #FCBF49, #F77F00, #D62828);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            <div className="fixed inset-0 bg-mesh-ultra pointer-events-none" />

            <header className="sticky top-0 z-[100] h-14 bg-[#001D2D]/80 backdrop-blur-2xl border-b border-white/5">
                <div className="container max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="flex items-center gap-3 no-underline group">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="relative w-full h-full bg-[#003049] border border-white/10 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-500">
                                {storeLogo ? (
                                    <img src={storeLogo} alt="Logo" className="w-5 h-5 object-contain" />
                                ) : (
                                    <Gamepad className="w-4 h-4 text-[#FCBF49]" />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black tracking-tighter uppercase italic leading-none">
                                <span className="text-white">{storeName.split(' ')[0]}</span>
                                <span className="premium-gradient-text ml-1">{storeName.split(' ').slice(1).join(' ')}</span>
                            </h2>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="text-[8px] font-black uppercase tracking-[.3em] text-white/30 hover:text-white no-underline transition-colors">
                            KATALOG
                        </Link>
                        <button onClick={() => setTrackModal(true)} className="text-[8px] font-black uppercase tracking-[.3em] text-white/30 hover:text-white transition-all bg-transparent border-none cursor-pointer">
                            PESANAN
                        </button>
                        <button className="bg-white text-[#001D2D] px-5 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all hover:bg-[#F77F00] hover:text-white">
                            Login
                        </button>
                    </nav>
                </div>
            </header>

            <main className="container max-w-6xl mx-auto px-6 py-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="lg:w-[30%]">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="rounded-[2rem] overflow-hidden glass-card border-white/10 shadow-xl relative group">
                                <div className="aspect-[4/4] relative overflow-hidden">
                                    <img
                                        src={category.image || 'https://via.placeholder.com/800x1000'}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#001D2D] via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-[1px] bg-[#D62828] rounded-full"></div>
                                            <span className="text-[7px] font-black text-[#FCBF49] uppercase tracking-[.4em]">Verified</span>
                                        </div>
                                        <h1 className="text-lg font-black text-white italic uppercase tracking-tighter leading-tight">{category.name}</h1>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 bg-[#003049]/20 backdrop-blur-xl border-t border-white/5">
                                    {[
                                        { icon: Zap, label: 'Proses Instan', val: '1-3 Detik Selesai', color: 'text-[#F77F00]' },
                                        { icon: ShieldCheck, label: 'Aman', val: '100% Produk Legal', color: 'text-emerald-400' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                                                <item.icon size={16} className={item.color} />
                                            </div>
                                            <div>
                                                <p className="text-[7px] font-black uppercase tracking-widest text-white/20">{item.label}</p>
                                                <p className="text-[9px] font-bold text-white mt-0.5 italic uppercase tracking-tighter">{item.val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <Link 
                                href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"}
                                className="flex items-center justify-center gap-2 w-full py-3 glass-card rounded-2xl text-[8px] font-black text-white/30 hover:text-white hover:border-[#F77F00]/20 transition-all no-underline uppercase tracking-widest italic"
                            >
                                <ArrowLeft size={12} /> Katalog Store
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-[70%] space-y-6">

                        <section className="rounded-[2rem] p-6 md:p-8 glass-card relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-[#001D2D] border border-white/5 text-[#F77F00] font-black italic text-lg flex items-center justify-center">01</div>
                                <div>
                                    <h2 className="text-base font-black italic uppercase tracking-tight text-white/90">Target details</h2>
                                    <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-white/20 italic">Akun Pengiriman</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[8px] font-black uppercase tracking-widest ml-1 text-white/20 italic">
                                        {bestProductInfo?.gameIdLabel || "User ID"}
                                    </label>
                                    <input
                                        type="text"
                                        value={gameId}
                                        onChange={e => setGameId(e.target.value)}
                                        className="w-full h-12 px-6 bg-white/5 border border-white/5 rounded-xl font-black text-xs tracking-widest outline-none transition-all focus:bg-white/10 text-white"
                                        placeholder="ID Game..."
                                    />
                                </div>
                                {bestProductInfo?.gameServerId && (
                                    <div className="space-y-3">
                                        <label className="text-[8px] font-black uppercase tracking-widest ml-1 text-white/20 italic">
                                            {bestProductInfo.serverLabel || "Server ID"}
                                        </label>
                                        <input
                                            type="text"
                                            value={serverId}
                                            onChange={e => setServerId(e.target.value)}
                                            className="w-full h-12 px-6 bg-white/5 border border-white/5 rounded-xl font-black text-xs tracking-widest outline-none transition-all focus:bg-white/10 text-white"
                                            placeholder="Server..."
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-[2rem] p-6 md:p-8 glass-card">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-[#001D2D] border border-white/5 text-[#F77F00] font-black italic text-lg flex items-center justify-center">02</div>
                                <div>
                                    <h2 className="text-base font-black italic uppercase tracking-tight text-white/90">Choose item</h2>
                                    <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-white/20 italic">Voucher / Diamonds</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {allSkus.map((sku: any) => {
                                    const isSelected = selectedSku?.id === sku.id;
                                    return (
                                        <button
                                            key={sku.id}
                                            onClick={() => setSelectedSku(sku)}
                                            className={`group relative p-5 rounded-2xl border text-left transition-all duration-300 ${isSelected
                                                ? 'bg-white border-[#F77F00] text-[#001D2D] shadow-lg -translate-y-1'
                                                : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                                            }`}
                                        >
                                            <h3 className={`font-black uppercase italic text-[9px] tracking-tight leading-tight h-6 overflow-hidden ${isSelected ? 'text-[#001D2D]' : 'group-hover:text-white'}`}>
                                                {sku.name}
                                            </h3>
                                            <div className="mt-4 pt-2 border-t border-current/10 flex items-center justify-between">
                                                <p className={`font-black text-xs italic tracking-tighter ${isSelected ? 'text-[#D62828]' : 'text-[#F77F00]'}`}>
                                                    Rp {new Intl.NumberFormat('id-ID').format(sku.priceNormal)}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-[2rem] p-6 md:p-8 glass-card">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-[#001D2D] border border-white/5 text-[#F77F00] font-black italic text-lg flex items-center justify-center">03</div>
                                <div>
                                    <h2 className="text-base font-black italic uppercase tracking-tight text-white/90">Payment gateway</h2>
                                    <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5 text-white/20 italic">Metode Pembayaran</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {(() => {
                                    const groups: Record<string, any[]> = {};
                                    paymentChannels.forEach((ch: any) => {
                                        const g = ch.group || 'OTHER';
                                        if (!groups[g]) groups[g] = [];
                                        groups[g].push(ch);
                                    });

                                    const groupSort = ['QRIS', 'VIRTUAL ACCOUNT', 'E-WALLET'];
                                    return Object.entries(groups).sort(([a], [b]) => {
                                        const ai = groupSort.indexOf(a.toUpperCase());
                                        const bi = groupSort.indexOf(b.toUpperCase());
                                        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                                    }).map(([groupName, channels]) => (
                                        <div key={groupName}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-[7px] font-black uppercase tracking-widest text-white/10 italic shrink-0">{groupName}</span>
                                                <div className="h-px flex-1 bg-white/5"></div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {channels.map((channel: any) => {
                                                    const isSelected = selectedPayment === channel.code;
                                                    return (
                                                        <button
                                                            key={channel.code}
                                                            onClick={() => setSelectedPayment(channel.code)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isSelected
                                                                ? 'bg-[#F77F00] border-[#F77F00] shadow-md'
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                            }`}
                                                        >
                                                            <div className="w-8 h-6 rounded-md relative flex items-center justify-center p-1 bg-white">
                                                                <img src={channel.icon_url} alt={channel.name} className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                            <div className="flex-1 text-left">
                                                                <p className={`text-[9px] font-black italic uppercase tracking-tighter truncate ${isSelected ? 'text-[#001D2D]' : 'text-white/80'}`}>{channel.name}</p>
                                                            </div>
                                                            <p className={`text-[7px] font-bold ${isSelected ? 'text-[#001D2D]/60' : 'text-white/20'}`}>
                                                                {channel.fee_flat > 0 ? `+Rp ${Number(channel.fee_flat).toLocaleString()}` : (channel.fee_percent > 0 ? `+${channel.fee_percent}%` : 'Free')}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </section>

                        <section className="rounded-[2rem] p-6 md:p-8 glass-card border-[#F77F00]/10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="w-full md:w-64">
                                    <label className="text-[7px] font-black uppercase tracking-[.3em] mb-2 block text-white/20 italic ml-2">Kontak Terdaftar</label>
                                    <input
                                        type="text"
                                        value={whatsapp}
                                        onChange={e => setWhatsapp(e.target.value)}
                                        className="w-full h-11 px-6 bg-white/5 border border-white/5 rounded-xl font-black text-[10px] tracking-widest outline-none text-white transition-all focus:bg-white/10"
                                        placeholder="08XXXXXXXXXX"
                                    />
                                </div>
                                <button
                                    onClick={handleBuy}
                                    disabled={isCheckoutting}
                                    className="w-full md:w-auto min-w-[200px] h-14 bg-white text-[#001D2D] rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#F77F00] hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isCheckoutting ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <><Lock size={14} /> Bayar Sekarang</>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="mt-12 border-t border-white/5 py-10 bg-[#00121C]">
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 text-center italic">
                    © {new Date().getFullYear()} {storeName.toUpperCase()} — SECURE PROTOCOL
                </p>
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
                                <div className="py-10 text-center opacity-20 italic text-sm uppercase tracking-widest text-white">
                                    Masukkan nomor WA untuk melihat history
                                </div>
                            )}
                            
                            {trackingResults.map((order) => (
                                <div key={order.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-white">
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
}
