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
        <div className="min-h-screen bg-[#0A1628] text-white font-inter selection:bg-[#E8B84B] selection:text-[#0A1628] overflow-x-hidden antialiased">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');
                .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
                .text-gold {
                    background: linear-gradient(135deg, #E8B84B 0%, #F5D280 50%, #E8B84B 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gold-glow { box-shadow: 0 0 20px rgba(232, 184, 75, 0.2); }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .grid-pattern {
                    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 30px 30px;
                }
            `}</style>

            {/* Header */}
            <header className="sticky top-0 z-[100] h-16 bg-[#0A1628]/80 backdrop-blur-2xl border-b border-white/5">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="flex items-center gap-3 no-underline group">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#E8B84B] to-[#B88A2D] rounded-lg flex items-center justify-center shadow-lg shadow-[#E8B84B]/20 transition-transform group-hover:scale-110">
                            <Gamepad size={20} className="text-[#0A1628]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-extrabold text-lg tracking-tight leading-none uppercase italic">
                                DAGANG<span className="text-gold">PLAY</span>
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex items-center gap-6">
                            {['Layanan', 'Kontak'].map((item) => (
                                <Link key={item} href="#" className="text-[10px] font-bold uppercase tracking-[.2em] text-white/40 hover:text-white no-underline transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </nav>
                        <div className="h-6 w-px bg-white/10"></div>
                        <button className="bg-[#E8B84B] text-[#0A1628] px-6 py-2.5 rounded-md font-extrabold text-[10px] uppercase tracking-widest shadow-xl gold-glow active:scale-95 transition-all">
                            Member Area
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-10 relative">
                <div className="absolute inset-0 grid-pattern pointer-events-none -z-10 opacity-50" />
                
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* LEFT COLUMN: Product Overview */}
                    <div className="lg:w-[30%]">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="rounded-2xl overflow-hidden glass-card">
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            priority
                                            sizes="(max-width: 768px) 100vw, 30vw"
                                            className="object-cover opacity-80"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#060A0F] flex items-center justify-center text-4xl font-heading font-extrabold text-white italic opacity-40">
                                            {category.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/20 to-transparent"></div>
                                    <div className="absolute bottom-4 left-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-4 h-[2px] bg-[#E8B84B] rounded-full"></div>
                                            <span className="text-[8px] font-bold text-[#E8B84B] uppercase tracking-[.3em]">Official Provider</span>
                                        </div>
                                        <h1 className="text-xl md:text-2xl font-heading font-extrabold text-white italic uppercase tracking-tighter leading-none">{category.name}</h1>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {[
                                        { icon: Zap, label: 'Waktu Proses', val: '1-3 Detik Selesai' },
                                        { icon: ShieldCheck, label: 'Keamanan', val: 'Legal & Bergaransi' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#E8B84B]">
                                                <item.icon size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">{item.label}</p>
                                                <p className="text-[10px] font-bold text-white/70">{item.val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sticky Order Review */}
                            {selectedSku && (
                                <div className="rounded-2xl p-6 glass-card border-[#E8B84B]/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[.3em] text-[#E8B84B] mb-5">Review Order</h3>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-white/40 font-medium">SKU:</span>
                                            <span className="font-extrabold uppercase italic text-white/90">{selectedSku.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-white/40 font-medium">Payment:</span>
                                            <span className="font-bold text-white/80">{selectedPayment || '-'}</span>
                                        </div>
                                        <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Total Tagihan:</span>
                                            <span className="text-lg font-heading font-extrabold italic tracking-tighter text-white">
                                                Rp {new Intl.NumberFormat('id-ID').format(selectedSku.priceNormal)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleBuy}
                                        disabled={isCheckoutting}
                                        className="w-full py-3.5 rounded-lg bg-[#E8B84B] text-[#0A1628] font-extrabold text-[10px] uppercase tracking-[.2em] transition-all hover:bg-[#F5D280] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg gold-glow"
                                    >
                                        {isCheckoutting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <><Wallet size={14} /> Bayar Sekarang</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Configuration Form */}
                    <div className="lg:w-[70%] space-y-8">

                        {/* 1. Account Info */}
                        <section className="rounded-2xl p-6 md:p-8 glass-card">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/10 text-[#E8B84B] font-heading font-extrabold italic text-lg flex items-center justify-center border border-[#E8B84B]/20 shadow-sm">01</div>
                                <div>
                                    <h2 className="text-lg font-heading font-extrabold italic uppercase tracking-tight text-white/90">Account Details</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/30 italic">Target Akun Pengiriman</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest ml-1 text-white/40">
                                        {bestProductInfo?.gameIdLabel || "User ID"}
                                    </label>
                                    <input
                                        type="text"
                                        value={gameId}
                                        onChange={e => setGameId(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-xl font-bold text-sm transition-all outline-none border border-white/5 bg-white/[0.02] focus:border-[#E8B84B]/40 focus:bg-white/[0.04] text-white placeholder:text-white/10"
                                        placeholder="Ex: 12345678"
                                    />
                                </div>
                                {bestProductInfo?.gameServerId && (
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest ml-1 text-white/40">
                                            {bestProductInfo.serverLabel || "Server ID"}
                                        </label>
                                        <input
                                            type="text"
                                            value={serverId}
                                            onChange={e => setServerId(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-xl font-bold text-sm transition-all outline-none border border-white/5 bg-white/[0.02] focus:border-[#E8B84B]/40 focus:bg-white/[0.04] text-white placeholder:text-white/10"
                                            placeholder="Ex: 2001"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 2. Nominal Selection */}
                        <section className="rounded-2xl p-6 md:p-8 glass-card">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/10 text-[#E8B84B] font-heading font-extrabold italic text-lg flex items-center justify-center border border-[#E8B84B]/20 shadow-sm">02</div>
                                <div>
                                    <h2 className="text-lg font-heading font-extrabold italic uppercase tracking-tight text-white/90">Pilih Nominal</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/30 italic">Layanan Aman & Instan 24 Jam</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                                {allSkus.map((sku: any) => (
                                    <button
                                        key={sku.id}
                                        onClick={() => setSelectedSku(sku)}
                                        className={`group relative p-4 rounded-xl border text-left transition-all duration-300 ${selectedSku?.id === sku.id
                                            ? 'bg-[#E8B84B] border-[#E8B84B] text-[#0A1628] shadow-lg shadow-[#E8B84B]/10 -translate-y-1'
                                            : 'bg-white/[0.02] border-white/5 text-white/70 hover:border-[#E8B84B]/30 hover:bg-white/[0.05]'
                                            }`}
                                    >
                                        <h3 className={`font-bold uppercase italic text-[10px] tracking-tight line-clamp-2 leading-tight h-7 ${selectedSku?.id === sku.id ? 'text-[#0A1628]' : 'group-hover:text-[#E8B84B]'}`}>
                                            {sku.name}
                                        </h3>
                                        <p className={`mt-3 font-heading font-extrabold text-sm italic tracking-tighter ${selectedSku?.id === sku.id ? 'text-[#0A1628]' : 'text-[#E8B84B]'}`}>
                                            Rp {new Intl.NumberFormat('id-ID').format(sku.priceNormal)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 3. Payment Method */}
                        <section className="rounded-2xl p-6 md:p-8 glass-card">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/10 text-[#E8B84B] font-heading font-extrabold italic text-lg flex items-center justify-center border border-[#E8B84B]/20 shadow-sm">03</div>
                                <div>
                                    <h2 className="text-lg font-heading font-extrabold italic uppercase tracking-tight text-white/90">Payment Mode</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/30 italic">Gerbang Pembayaran Otomatis</p>
                                </div>
                            </div>

                            {!tripayChannelsResp && (
                                <div className="space-y-3 animate-pulse">
                                    {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-white/5"></div>)}
                                </div>
                            )}

                            {paymentChannels.length > 0 && (() => {
                                const groups: Record<string, any[]> = {};
                                paymentChannels.forEach((ch: any) => {
                                    if (ch.active === false) return;
                                    const g = ch.group || 'Lainnya';
                                    if (!groups[g]) groups[g] = [];
                                    groups[g].push(ch);
                                });

                                const groupOrder = ['QRIS', 'Virtual Account', 'E-Wallet', 'Convenience Store', 'Transfer Bank'];
                                const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
                                    const ai = groupOrder.findIndex(g => a.includes(g));
                                    const bi = groupOrder.findIndex(g => b.includes(g));
                                    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                                });

                                return (
                                    <div className="space-y-6">
                                        {sortedGroups.map(([groupName, channels]) => (
                                            <div key={groupName}>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-[8px] font-black uppercase tracking-[.3em] text-white/20">{groupName}</span>
                                                    <div className="flex-1 h-px bg-white/5"></div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {channels.map((channel: any) => {
                                                        const isSelected = selectedPayment === channel.code;
                                                        const fee = channel.fee_flat > 0 ? `+Rp ${Number(channel.fee_flat).toLocaleString()}` : (channel.fee_percent > 0 ? `+${channel.fee_percent}%` : 'Gratis');
                                                        return (
                                                            <button
                                                                key={channel.code}
                                                                onClick={() => setSelectedPayment(channel.code)}
                                                                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isSelected
                                                                    ? 'bg-[#E8B84B] border-[#E8B84B] shadow-md'
                                                                    : 'bg-white/[0.02] border-white/5 hover:border-[#E8B84B]/20 hover:bg-white/5'
                                                                }`}
                                                            >
                                                                <div className={`w-10 h-7 rounded-md relative flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white' : 'bg-white/[0.05]'}`}>
                                                                    {channel.icon_url ? (
                                                                        <Image src={channel.icon_url} alt={channel.name} fill sizes="40px" className="object-contain p-1" />
                                                                    ) : (
                                                                        <span className="text-[7px] font-bold text-white/40">{channel.code.slice(0,3)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-[10px] font-bold uppercase italic tracking-tight leading-tight truncate ${isSelected ? 'text-[#0A1628]' : 'text-white/90'}`}>{channel.name}</p>
                                                                    <p className={`text-[8px] font-mono mt-0.5 ${isSelected ? 'text-[#0A1628]/60' : 'text-white/20'}`}>{channel.code}</p>
                                                                </div>
                                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-[#0A1628]/10 text-[#0A1628]' : 'bg-white/5 text-white/40'}`}>{fee}</span>
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
                        <section className="rounded-2xl p-6 md:p-8 glass-card border-[#E8B84B]/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/10 text-[#E8B84B] font-heading font-extrabold italic text-lg flex items-center justify-center border border-[#E8B84B]/20 shadow-sm">04</div>
                                <div>
                                    <h2 className="text-lg font-heading font-extrabold italic uppercase tracking-tight text-white/90">Contact Detail</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/30 italic">Konfirmasi Pesanan & Status</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-xl font-bold text-sm transition-all outline-none border border-white/5 bg-white/[0.02] focus:border-[#E8B84B]/40 focus:bg-white/[0.04] text-white placeholder:text-white/10 text-center"
                                    placeholder="08XXXXXXXXXX"
                                />
                                <div className="flex items-center justify-center gap-2 opacity-30">
                                    <div className="w-1 h-1 rounded-full bg-[#E8B84B]"></div>
                                    <p className="text-[8px] uppercase tracking-[.3em] font-bold text-white">Secure Transaction Protocol</p>
                                    <div className="w-1 h-1 rounded-full bg-[#E8B84B]"></div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Footer Compact */}
            <footer className="mt-20 border-t border-white/5 py-12 bg-[#060A0F]">
                <div className="container mx-auto px-6 flex flex-col items-center gap-6">
                    <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="no-underline flex items-center gap-2 group text-white/40 hover:text-[#E8B84B] transition-colors">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Kembali ke Beranda</span>
                    </Link>
                    <div className="h-[1px] w-16 bg-white/5"></div>
                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/20 text-center leading-relaxed">
                        © {new Date().getFullYear()} {config?.name || "Premium Store"}. <br />
                        <span className="text-white/10 uppercase tracking-[.4em] mt-1 inline-block">Secure Checkout System</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}


