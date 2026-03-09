"use client";
import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { use } from 'react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ProductTopupPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const { data: category, error, isLoading } = useSWR(`http://localhost:3001/public/products/categories/${params.slug}`, fetcher);
    const { data: tripayChannelsResp } = useSWR('http://localhost:3001/public/orders/payment-channels', fetcher);
    // Usually Tripay returns data in "data" array
    const paymentChannels = tripayChannelsResp?.data || [];

    const [selectedSku, setSelectedSku] = useState<any>(null);
    const [gameId, setGameId] = useState('');
    const [serverId, setServerId] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isCheckoutting, setIsCheckoutting] = useState(false);

    const handleBuy = async () => {
        if (!gameId) return alert('Silakan masukkan ID game Anda');
        if (bestProductInfo?.gameServerId && !serverId) return alert('Silakan masukkan Server ID game Anda');
        if (!selectedSku) return alert('Pilih nominal top up terlebih dahulu');
        if (!whatsapp) return alert('Masukkan nomor WhatsApp Anda');
        if (!selectedPayment) return alert('Pilih metode pembayaran');

        setIsCheckoutting(true);
        try {
            const res = await axios.post('http://localhost:3001/public/orders/checkout', {
                skuId: selectedSku.id,
                gameId,
                serverId,
                whatsapp,
                paymentMethod: selectedPayment
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

    if (isLoading) return <div className="min-h-screen bg-navy-deep flex items-center justify-center text-white">Memuat data produk...</div>;
    if (error || !category) return <div className="min-h-screen bg-navy-deep flex items-center justify-center text-white">Produk tidak ditemukan.</div>;

    // Collect all SKUs from all active products in this category
    const allSkus = category.products.flatMap((p: any) => p.skus || []);
    const product = category.products[0]; // Use the first product metadata for labels 
    // Optimization: if there are multiple products, pick labels from the one that has most skus or just use the first one as fallback
    const bestProductInfo = category.products.reduce((prev: any, current: any) =>
        (prev.skus?.length > current.skus?.length) ? prev : current
        , category.products[0]);

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Header / Banner */}
            <div className="relative h-64 bg-slate-800 overflow-hidden">
                {category.image && (
                    <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-2 overflow-hidden shadow-xl">
                            {category.image ? (
                                <img src={category.image} alt="Icon" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="w-full h-full bg-indigo-500 rounded-xl flex items-center justify-center text-3xl font-black text-white">{category.name.substring(0, 2)}</div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">{category.name}</h1>
                            <p className="text-cyan-400 font-medium text-sm mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                Top Up Cepat & Otomatis
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
                {/* Left Form */}
                <div className="flex-1 space-y-6">
                    {/* Step 1: Input Data */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-cyan-500 text-white font-black flex items-center justify-center shadow-lg shadow-cyan-500/30">1</span>
                            <h2 className="text-xl font-bold text-white">Masukkan Data Akun</h2>
                        </div>

                        <div className="flex gap-4 mb-3">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{bestProductInfo?.gameIdLabel || "User ID"}</label>
                                <input
                                    type="text"
                                    value={gameId}
                                    onChange={e => setGameId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                    placeholder={`Masukkan ${bestProductInfo?.gameIdLabel || 'ID'}...`}
                                />
                            </div>
                            {bestProductInfo?.gameServerId && (
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{bestProductInfo.serverLabel || "Zone / Server ID"}</label>
                                    <input
                                        type="text"
                                        value={serverId}
                                        onChange={e => setServerId(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                        placeholder={`Masukkan ${bestProductInfo.serverLabel || 'Server'}...`}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">Pastikan data akun yang Anda masukkan sudah benar.</p>
                    </div>

                    {/* Step 2: Pilih Nominal */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-cyan-500 text-white font-black flex items-center justify-center shadow-lg shadow-cyan-500/30">2</span>
                            <h2 className="text-xl font-bold text-white">Pilih Nominal Top Up</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {allSkus.map((sku: any) => (
                                <button
                                    key={sku.id}
                                    onClick={() => setSelectedSku(sku)}
                                    className={`relative p-4 rounded-xl border text-left transition ${selectedSku?.id === sku.id
                                        ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                                        }`}
                                >
                                    <p className="font-bold text-white text-sm leading-tight">{sku.name}</p>
                                    <p className="text-cyan-400 font-black mt-2 text-sm italic">
                                        Rp {new Intl.NumberFormat('id-ID').format(sku.priceNormal)}
                                    </p>
                                    {selectedSku?.id === sku.id && (
                                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                                            <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
                                        </div>
                                    )}
                                </button>
                            ))}
                            {allSkus.length === 0 && (
                                <p className="col-span-3 text-center text-slate-500 py-8">Produk belum tersedia.</p>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Nomor WA */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-cyan-500 text-white font-black flex items-center justify-center shadow-lg shadow-cyan-500/30">3</span>
                            <h2 className="text-xl font-bold text-white">Nomor WhatsApp</h2>
                        </div>

                        <div>
                            <input
                                type="text"
                                value={whatsapp}
                                onChange={e => setWhatsapp(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                placeholder="081234567890"
                            />
                            <p className="text-[11px] text-slate-400 mt-2">Nomor ini akan digunakan untuk mengirimkan konfirmasi dan status pesanan.</p>
                        </div>
                    </div>

                    {/* Step 4: Pilih Pembayaran */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl mt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-8 rounded-full bg-cyan-500 text-white font-black flex items-center justify-center shadow-lg shadow-cyan-500/30">4</span>
                            <h2 className="text-xl font-bold text-white">Metode Pembayaran</h2>
                        </div>

                        <div className="space-y-3">
                            {paymentChannels.map((channel: any) => (
                                <button
                                    key={channel.code}
                                    onClick={() => setSelectedPayment(channel.code)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${selectedPayment === channel.code
                                        ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-10 bg-white rounded flex items-center justify-center overflow-hidden p-1">
                                            {channel.icon_url ? (
                                                <img src={channel.icon_url} alt={channel.name} className="max-h-full max-w-full" />
                                            ) : (
                                                <span className="text-xs font-bold text-slate-800">{channel.name}</span>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-white text-sm">{channel.name}</p>
                                        </div>
                                    </div>
                                    {selectedPayment === channel.code && (
                                        <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                            {paymentChannels.length === 0 && (
                                <p className="text-slate-500 py-4">Memuat metode pembayaran...</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Checkout Info */}
                <div className="lg:w-96">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-24">
                        <h3 className="font-bold text-white text-lg border-b border-slate-700 pb-4 mb-4">Ringkasan Pesanan</h3>

                        {selectedSku ? (
                            <>
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-400 text-sm">Item</span>
                                        <span className="text-white font-bold text-sm text-right">{selectedSku.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm">Game</span>
                                        <span className="text-white font-medium text-sm">{category.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                                        <span className="text-slate-300 font-bold">Total Pembayaran</span>
                                        <span className="text-cyan-400 font-black text-xl">
                                            Rp {new Intl.NumberFormat('id-ID').format(selectedSku.priceNormal)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleBuy}
                                    disabled={isCheckoutting}
                                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl font-black text-[15px] shadow-lg shadow-cyan-500/30 transition transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCheckoutting ? '🔄 Memproses...' : '💰 Beli Sekarang'}
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-10 opacity-50">
                                <span className="text-4xl block mb-2">🛒</span>
                                <p className="text-sm text-slate-400 font-medium">Belum ada item yang dipilih</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-20 container mx-auto px-4 text-center">
                <Link href="/" className="text-slate-400 hover:text-white transition inline-flex items-center gap-2 text-sm">
                    ← Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
