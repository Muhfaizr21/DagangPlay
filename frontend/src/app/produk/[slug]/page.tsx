"use client";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Gamepad, Zap, MessageSquare, ShieldCheck, Wallet, ShoppingCart,
    ChevronRight, ArrowLeft, Phone, Mail, Instagram, Twitter, Facebook
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
        dedupingInterval: 10000 // 10s dedupe
    };

    const { data: category, error, isLoading } = useSWR(categoryUrl, fetcher, swrConfig);
    const { data: tripayChannelsResp } = useSWR(`${baseUrl}/public/orders/payment-channels`, fetcher, swrConfig);
    const { data: config } = useSWR(configUrl, fetcher, swrConfig);

    // Extract active payment channels from Tripay response
    // Tripay format: { success: true, data: [{ code, name, group, icon_url, fee_flat, fee_percent, active }] }
    const rawChannels = tripayChannelsResp?.data || [];
    // Include channel if active is true OR if active field doesn't exist (sandbox may omit it)
    const paymentChannels = rawChannels.length > 0
        ? rawChannels.filter((ch: any) => ch.active !== false)
        : [];

    const [selectedSku, setSelectedSku] = useState<any>(null);
    const [gameId, setGameId] = useState('');
    const [serverId, setServerId] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isCheckoutting, setIsCheckoutting] = useState(false);

    // Determine Theme
    const isMerchant = !!merchantSlug || config?.isOfficial === false;
    const isLight = isMerchant; // Force light for merchant context

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
        <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-[#050B18] text-white'} flex flex-col items-center justify-center gap-4`}>
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold animate-pulse">Memuat data produk...</p>
        </div>
    );

    if (error || !category) return (
        <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-[#050B18] text-white'} flex flex-col items-center justify-center gap-6`}>
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <Gamepad size={48} />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black italic tracking-tight uppercase mb-2">Produk Tidak Ditemukan</h2>
                <p className="text-slate-500 font-medium">Layanan ini belum tersedia atau sedang dalam pemeliharaan.</p>
            </div>
            <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-indigo-100 no-underline">
                Kembali ke Beranda
            </Link>
        </div>
    );

    // Collect all SKUs from all active products in this category
    const allSkus = category.products.flatMap((p: any) => p.skus || []);

    // Optimization: if there are multiple products, pick labels from the one that has most skus
    const bestProductInfo = category.products.reduce((prev: any, current: any) =>
        (prev.skus?.length > current.skus?.length) ? prev : current
        , category.products[0]);

    return (
        <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#050B18] text-white'} font-sans antialiased`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 h-20 border-b backdrop-blur-xl ${isLight ? 'bg-white/80 border-slate-200' : 'bg-[#050B18]/70 border-white/5'}`}>
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="flex items-center gap-3 no-underline group">
                        <div className={`w-11 h-11 rounded-2xl relative flex items-center justify-center text-white transition-transform group-hover:scale-110 ${isLight ? 'bg-indigo-600 shadow-xl shadow-indigo-100' : 'bg-indigo-600'}`}>
                            {config?.logo ? (
                                <Image
                                    src={config.logo}
                                    alt="Logo"
                                    fill
                                    sizes="44px"
                                    className="object-cover rounded-2xl"
                                />
                            ) : (
                                <Gamepad size={24} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-black text-xl tracking-tight leading-none uppercase italic ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {config?.name || (merchantSlug ? "Loading Store..." : "DagangPlay")}
                            </span>
                            <span className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1.5 ">Safe & Instant Topup</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className={`text-[11px] font-black uppercase tracking-[0.3em] no-underline transition-colors ${isLight ? 'text-slate-400 hover:text-indigo-600' : 'text-slate-400 hover:text-white'}`}>
                            Layanan
                        </Link>
                        <Link href="#" className={`text-[11px] font-black uppercase tracking-[0.3em] no-underline transition-colors ${isLight ? 'text-slate-400 hover:text-indigo-600' : 'text-slate-400 hover:text-white'}`}>
                            Kontak
                        </Link>
                        <div className={`h-8 w-px ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}></div>
                        <button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                            Member Area
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className={`flex flex-col lg:flex-row gap-12`}>

                    {/* LEFT COLUMN: Product Overview & Summary */}
                    <div className="lg:w-1/3">
                        <div className="lg:sticky lg:top-32 space-y-8">
                            {/* Product Card */}
                            <div className={`rounded-[3rem] overflow-hidden border transition-all ${isLight ? 'bg-white border-slate-200 shadow-2xl shadow-indigo-100/30' : 'bg-slate-900 border-white/5'}`}>
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            priority
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-5xl font-black text-white italic">
                                            {category.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-6 h-1 bg-indigo-500 rounded-full"></span>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Premium Store</span>
                                        </div>
                                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{category.name}</h1>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Waktu Proses</p>
                                            <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>1-3 Detik Selesai</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Keamanan</p>
                                            <p className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Legal & Bergaransi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Order Review (Visible when SKU selected) */}
                            {selectedSku && (
                                <div className={`rounded-3xl p-8 border animate-in fade-in slide-in-from-bottom-4 duration-500 ${isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-900 border-white/5'}`}>
                                    <h3 className={`text-sm font-black uppercase tracking-widest mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>Review Order</h3>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Pilihan:</span>
                                            <span className={`font-black uppercase italic ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>{selectedSku.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Pembayaran:</span>
                                            <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{selectedPayment || '-'}</span>
                                        </div>
                                        <div className={`pt-4 border-t ${isLight ? 'border-slate-100' : 'border-white/5'} flex justify-between items-end`}>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total:</span>
                                            <span className={`text-2xl font-black italic tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                Rp {new Intl.NumberFormat('id-ID').format(selectedSku.priceNormal)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleBuy}
                                        disabled={isCheckoutting}
                                        className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 ${isLight ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700' : 'bg-indigo-600 text-white'}`}
                                    >
                                        {isCheckoutting ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Wallet size={16} /> Checkout Now</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Configuration Form */}
                    <div className="lg:w-2/3 space-y-10">

                        {/* 1. Account Info */}
                        <section className={`rounded-[3rem] p-10 border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-white/5'}`}>
                            <div className="flex items-center gap-5 mb-12">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black italic text-2xl flex items-center justify-center shadow-lg shadow-indigo-100">01</div>
                                <div>
                                    <h2 className={`text-2xl font-black italic uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Account Details</h2>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Silakan masukkan ID game Anda</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                        {bestProductInfo?.gameIdLabel || "User ID"}
                                    </label>
                                    <input
                                        type="text"
                                        value={gameId}
                                        onChange={e => setGameId(e.target.value)}
                                        className={`w-full px-8 py-5 rounded-2xl font-extrabold text-base transition-all outline-none border ${isLight
                                            ? 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-slate-900'
                                            : 'bg-black/20 border-white/5 focus:border-indigo-600 text-white'}`}
                                        placeholder="Ex: 12345678"
                                    />
                                </div>
                                {bestProductInfo?.gameServerId && (
                                    <div className="space-y-3">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {bestProductInfo.serverLabel || "Server ID"}
                                        </label>
                                        <input
                                            type="text"
                                            value={serverId}
                                            onChange={e => setServerId(e.target.value)}
                                            className={`w-full px-8 py-5 rounded-2xl font-extrabold text-base transition-all outline-none border ${isLight
                                                ? 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-slate-900'
                                                : 'bg-black/20 border-white/5 focus:border-indigo-600 text-white'}`}
                                            placeholder="Ex: 2001"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 2. Nominal Selection */}
                        <section className={`rounded-[3rem] p-10 border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-white/5'}`}>
                            <div className="flex items-center gap-5 mb-12">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black italic text-2xl flex items-center justify-center shadow-lg shadow-indigo-100">02</div>
                                <div>
                                    <h2 className={`text-2xl font-black italic uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Pilih Nominal</h2>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Layanan tersedia 24 jam</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                                {allSkus.map((sku: any) => (
                                    <button
                                        key={sku.id}
                                        onClick={() => setSelectedSku(sku)}
                                        className={`group relative p-6 rounded-[2rem] border text-left transition-all duration-500 ${selectedSku?.id === sku.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 -translate-y-1'
                                            : `${isLight ? 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-slate-50 text-slate-900' : 'bg-black/20 border-white/5 text-white hover:border-indigo-600'}`
                                            }`}
                                    >
                                        <h3 className={`font-black uppercase italic text-xs tracking-tight line-clamp-2 leading-tight h-8 ${selectedSku?.id === sku.id ? 'text-white' : 'group-hover:text-indigo-600 transition-colors'}`}>
                                            {sku.name}
                                        </h3>
                                        <p className={`mt-4 font-black text-base italic tracking-tighter ${selectedSku?.id === sku.id ? 'text-white/90' : 'text-indigo-600'}`}>
                                            Rp {new Intl.NumberFormat('id-ID').format(sku.priceNormal)}
                                        </p>
                                        {selectedSku?.id === sku.id && (
                                            <div className="absolute top-4 right-4 animate-bounce">
                                                <div className="bg-white/20 backdrop-blur rounded-full p-1"><Zap size={10} className="text-white" /></div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 3. Payment Method */}
                        <section className={`rounded-[3rem] p-10 border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-white/5'}`}>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black italic text-2xl flex items-center justify-center shadow-lg shadow-indigo-100">03</div>
                                <div>
                                    <h2 className={`text-2xl font-black italic uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Payment Mode</h2>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Verified & Automatic Checkout</p>
                                </div>
                            </div>

                            {/* Loading Skeleton */}
                            {!tripayChannelsResp && (
                                <div className="space-y-3 animate-pulse">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-16 rounded-2xl ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}></div>
                                    ))}
                                </div>
                            )}

                            {/* Error / Empty State */}
                            {tripayChannelsResp && paymentChannels.length === 0 && (
                                <div className={`text-center py-10 rounded-2xl border-2 border-dashed ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                                    <Wallet size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className={`text-sm font-bold ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Metode pembayaran tidak tersedia saat ini
                                    </p>
                                    <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Silakan hubungi admin atau coba beberapa saat lagi
                                    </p>
                                </div>
                            )}

                            {/* Payment Channels Grouped by Category */}
                            {paymentChannels.length > 0 && (() => {
                                // Group channels by their group field
                                const groups: Record<string, any[]> = {};
                                paymentChannels.forEach((ch: any) => {
                                    // Filter: only active channels (if field exists)
                                    if (ch.active === false) return;
                                    const g = ch.group || 'Lainnya';
                                    if (!groups[g]) groups[g] = [];
                                    groups[g].push(ch);
                                });

                                // Define display order for groups
                                const groupOrder = ['QRIS', 'Virtual Account', 'E-Wallet', 'Convenience Store', 'Transfer Bank', 'Lainnya'];
                                const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
                                    const ai = groupOrder.findIndex(g => a.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(a.toLowerCase()));
                                    const bi = groupOrder.findIndex(g => b.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(b.toLowerCase()));
                                    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                                });

                                return (
                                    <div className="space-y-8">
                                        {sortedGroups.map(([groupName, channels]) => (
                                            <div key={groupName}>
                                                {/* Group Label */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {groupName}
                                                    </span>
                                                    <div className={`flex-1 h-px ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}></div>
                                                </div>

                                                {/* Channels Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {channels.map((channel: any) => {
                                                        const isSelected = selectedPayment === channel.code;
                                                        const fee = channel.fee_flat > 0
                                                            ? `+Rp ${Number(channel.fee_flat).toLocaleString('id-ID')}`
                                                            : channel.fee_percent > 0
                                                                ? `+${channel.fee_percent}%`
                                                                : 'Gratis';
                                                        const isFree = fee === 'Gratis';

                                                        return (
                                                            <button
                                                                key={channel.code}
                                                                onClick={() => setSelectedPayment(channel.code)}
                                                                className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected
                                                                    ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200/50 scale-[1.02]'
                                                                    : isLight
                                                                        ? 'bg-slate-50 border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-md'
                                                                        : 'bg-black/20 border-white/5 hover:border-indigo-600/50 hover:bg-white/5'
                                                                    }`}
                                                            >
                                                                {/* Bank/Channel Icon */}
                                                                {(() => {
                                                                    const iconStyle: Record<string, string> = {
                                                                        'QRISC': 'bg-gradient-to-br from-blue-500 to-indigo-600',
                                                                        'BNIVA': 'bg-gradient-to-br from-orange-500 to-orange-600',
                                                                        'BRIVA': 'bg-gradient-to-br from-sky-500 to-blue-600',
                                                                        'BCAVA': 'bg-gradient-to-br from-blue-700 to-indigo-800',
                                                                        'MANDIRIVA': 'bg-gradient-to-br from-yellow-400 to-orange-500',
                                                                        'PERMATAVA': 'bg-gradient-to-br from-red-500 to-rose-600',
                                                                        'DANA': 'bg-gradient-to-br from-blue-400 to-blue-600',
                                                                        'OVO': 'bg-gradient-to-br from-purple-500 to-purple-700',
                                                                        'SHOPEEPAY': 'bg-gradient-to-br from-orange-400 to-red-500',
                                                                        'GOPAY': 'bg-gradient-to-br from-green-500 to-emerald-600',
                                                                        'ALFAMART': 'bg-gradient-to-br from-red-500 to-red-700',
                                                                        'INDOMARET': 'bg-gradient-to-br from-red-600 to-yellow-500',
                                                                    };
                                                                    const iconLabel: Record<string, string> = {
                                                                        'QRISC': 'QR', 'BNIVA': 'BNI', 'BRIVA': 'BRI',
                                                                        'BCAVA': 'BCA', 'MANDIRIVA': 'MDR', 'PERMATAVA': 'PMT',
                                                                        'DANA': 'DAN', 'OVO': 'OVO', 'SHOPEEPAY': 'SPY',
                                                                        'GOPAY': 'GPY', 'ALFAMART': 'ALF', 'INDOMARET': 'IND',
                                                                    };
                                                                    const bg = isSelected ? 'bg-white/20' : (iconStyle[channel.code] || 'bg-gradient-to-br from-slate-400 to-slate-600');
                                                                    const label = iconLabel[channel.code] || channel.code.slice(0, 3);
                                                                    return (
                                                                        <div className={`w-14 h-10 rounded-xl relative flex items-center justify-center flex-shrink-0 transition-all ${bg}`}>
                                                                            {channel.icon_url ? (
                                                                                <Image
                                                                                    src={channel.icon_url}
                                                                                    alt={channel.name}
                                                                                    fill
                                                                                    loading="lazy"
                                                                                    sizes="56px"
                                                                                    className="object-contain p-1"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-[10px] font-black text-white tracking-tight">{label}</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                                {/* Channel Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-xs font-black uppercase italic tracking-tight leading-tight truncate ${isSelected ? 'text-white' : isLight ? 'text-slate-800' : 'text-white'}`}>
                                                                        {channel.name}
                                                                    </p>
                                                                    <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-indigo-200' : isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                        {channel.code}
                                                                    </p>
                                                                </div>

                                                                {/* Fee Badge */}
                                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isSelected
                                                                        ? 'bg-white/20 text-white'
                                                                        : isFree
                                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                            : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                                        }`}>
                                                                        {fee}
                                                                    </span>
                                                                    {isSelected && (
                                                                        <ShieldCheck size={14} className="text-white/80" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </section>

                        {/* 4. WhatsApp Info */}
                        <section className={`rounded-[3rem] p-10 border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-white/5'}`}>
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black italic text-2xl flex items-center justify-center shadow-lg shadow-indigo-100">04</div>
                                <div>
                                    <h2 className={`text-2xl font-black italic uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Contact Detail</h2>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Status order via WhatsApp</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    className={`w-full px-8 py-5 rounded-2xl font-extrabold text-base transition-all outline-none border ${isLight
                                        ? 'bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-slate-900'
                                        : 'bg-black/20 border-white/5 focus:border-indigo-600 text-white'}`}
                                    placeholder="08XXXXXXXXXX"
                                />
                                <p className={`text-[10px] uppercase tracking-widest font-black text-center ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>Privacy Protected • Automated Notifications</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer Compact */}
            <footer className={`mt-24 border-t py-16 ${isLight ? 'bg-white border-slate-200' : 'bg-[#050B18] border-white/5'}`}>
                <div className="container mx-auto px-6 flex flex-col items-center gap-8">
                    <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className={`no-underline flex items-center gap-2 group ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Back to Store</span>
                    </Link>
                    <div className="h-px w-24 bg-indigo-600/20"></div>
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 text-center leading-relaxed ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        © {new Date().getFullYear()} {config?.name || "Premium Store"}. All Rights Reserved.<br />
                        <span className="text-indigo-600">Secure Checkout System</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}

