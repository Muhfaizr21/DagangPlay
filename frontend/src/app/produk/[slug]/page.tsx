"use client";
import { getApiUrl } from '@/lib/api';
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

    const [domainMask, setDomainMask] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rawHostname = window.location.hostname;
            const cleanHostname = rawHostname.split(':')[0];
            const isMain = cleanHostname === 'dagangplay.com' || 
                           cleanHostname === 'www.dagangplay.com' || 
                           cleanHostname === 'localhost' || 
                           cleanHostname === '127.0.0.1' || 
                           cleanHostname.includes('trycloudflare.com') ||
                           cleanHostname.includes('vercel.app');
            if (!isMain) {
                setDomainMask(cleanHostname);
            }
        }
    }, []);

    const baseUrl = getApiUrl();

    const categoryUrl = merchantSlug
        ? `${baseUrl}/public/products/categories/${params.slug}?merchant=${merchantSlug}`
        : domainMask 
            ? `${baseUrl}/public/products/categories/${params.slug}?domain=${domainMask}` 
            : `${baseUrl}/public/products/categories/${params.slug}`;

    const configUrl = merchantSlug
        ? `${baseUrl}/public/orders/config?slug=${merchantSlug}`
        : domainMask
            ? `${baseUrl}/public/orders/config?domain=${domainMask}`
            : `${baseUrl}/public/orders/config`;

    const swrConfig = {
        revalidateOnFocus: true,
        refreshInterval: 3000,
        dedupingInterval: 2000
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
    const [isReseller, setIsReseller] = useState(false);
    const [resellerDiscount, setResellerDiscount] = useState(0);

    const [trackModal, setTrackModal] = useState(false);
    const [searchPhone, setSearchPhone] = useState('');
    const [trackingResults, setTrackingResults] = useState<any[]>([]);
    const [isTracking, setIsTracking] = useState(false);

    // OTP Reseller States
    const [isResellerVerified, setIsResellerVerified] = useState(false);
    const [otpToken, setOtpToken] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const paymentChannels = tripayChannelsResp?.data?.filter((ch: any) => ch.active !== false) || [];

    const selectedPaymentChannel = useMemo(() => {
        return paymentChannels.find((ch: any) => ch.code === selectedPayment);
    }, [selectedPayment, paymentChannels]);

    const checkoutCalculations = useMemo(() => {
        if (!selectedSku) return null;
        let price = Number(selectedSku.priceNormal);
        
        // APPLY RESELLER DISCOUNT LIVE
        if (isReseller && resellerDiscount > 0) {
            price = Math.max(Number(selectedSku.basePrice), price - resellerDiscount);
        }

        let fee = 0;
        if (selectedPaymentChannel) {
            const flatFee = Number(selectedPaymentChannel.fee_flat || 0);
            const percentFee = Number(selectedPaymentChannel.fee_percent || 0);
            fee = flatFee + (price * (percentFee / 100));
        }
        const total = price + fee;
        return { basePrice: price, serviceFee: fee, total: Math.ceil(total) };
    }, [selectedSku, selectedPaymentChannel, isReseller, resellerDiscount]);

    // Reseller Status Checker
    useEffect(() => {
        const checkReseller = async () => {
            if (whatsapp.length >= 10 && config?.id) {
                try {
                    const res = await axios.get(`${baseUrl}/public/orders/status/${whatsapp}?merchantId=${config.id}`);
                    if (res.data.isReseller) {
                        setIsReseller(true);
                        setResellerDiscount(res.data.discount || 0);
                    } else {
                        setIsReseller(false);
                        setResellerDiscount(0);
                    }
                } catch (e) {
                    setIsReseller(false);
                }
            } else {
                setIsReseller(false);
            }
        };

        const timer = setTimeout(checkReseller, 1000);
        return () => clearTimeout(timer);
    }, [whatsapp, config?.id]);

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

    useEffect(() => {
        if (category?.name || storeName) {
            document.title = `${category?.name || 'Topup'} - ${storeName} | DagangPlay Pro`;
        }
    }, [category, storeName]);

    const handleSendOtp = async () => {
        if (!whatsapp) return alert('Masukkan nomor WhatsApp terlebih dahulu');
        setIsSendingOtp(true);
        try {
            await axios.post(`${baseUrl}/public/orders/otp/send`, { phone: whatsapp, merchantId: config.id });
            setShowOtpInput(true);
            alert('OTP terkirim ke WhatsApp Anda!');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Gagal mengirim OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode) return;
        try {
            const res = await axios.post(`${baseUrl}/public/orders/otp/verify`, { phone: whatsapp, merchantId: config.id, code: otpCode });
            setOtpToken(res.data.token);
            setIsResellerVerified(true);
            setShowOtpInput(false);
            alert('Verifikasi Berhasil! Kamu bisa lanjut beli dengan harga khusus.');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Kode OTP salah');
        }
    };

    const handleBuy = async () => {
        if (!gameId) return alert('Silakan masukkan ID game Anda');
        if (bestProductInfo?.gameServerId && !serverId) return alert('Silakan masukkan Server ID game Anda');
        if (!selectedSku) return alert('Pilih nominal top up terlebih dahulu');
        if (!whatsapp) return alert('Masukkan nomor WhatsApp Anda');
        if (!selectedPayment) return alert('Pilih metode pembayaran');
        if (isReseller && !isResellerVerified) return alert('Silakan verifikasi WhatsApp Anda sebagai reseller terlebih dahulu');

        setIsCheckoutting(true);
        try {
            const res = await axios.post(`${baseUrl}/public/orders/checkout`, {
                skuId: selectedSku.id,
                gameId,
                serverId,
                whatsapp,
                paymentMethod: selectedPayment,
                merchant: merchantSlug,
                domain: domainMask,
                otpToken: otpToken // Send the verified token
            });
            if (res.data.success && res.data.payment?.checkout_url) {
                window.location.href = res.data.payment.checkout_url;
            } else {
                alert(res.data.message || 'Gagal membuat pesanan');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Terjadi kesalahan sistem.');
        } finally {
            setIsCheckoutting(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#09090F] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: '#E8B84B', borderRightColor: '#F77F00' }} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/20">Memuat...</p>
        </div>
    );

    if (error || !category) return (
        <div className="min-h-screen bg-[#09090F] text-white flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                <Gamepad size={36} />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight text-white/70 mb-1">Layanan Tidak Tersedia</h2>
                <p className="text-white/25 text-xs tracking-widest uppercase">Service Unavailable</p>
            </div>
            <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="no-underline px-7 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-widest text-[#09090F]" style={{ background: 'linear-gradient(135deg, #E8B84B, #F77F00)' }}>
                Kembali ke Toko
            </Link>
        </div>
    );

    const allSkus = category.products.flatMap((p: any) => p.skus || []).filter((s: any) => s.isActive !== false && s.isAvailable !== false);
    const bestProductInfo = category.products.reduce((prev: any, current: any) =>
        (prev.skus?.filter((s:any)=>s.isActive!==false)?.length || 0) > (current.skus?.filter((s:any)=>s.isActive!==false)?.length || 0) ? prev : current,
        category.products[0]);

    return (
        <div className="min-h-screen bg-[#09090F] text-white overflow-x-hidden antialiased" style={{ fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif" }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

                :root {
                    --g-start: #00D8FF;
                    --g-end: #7B2CBF;
                    --bg: #080A10;
                    --bg-2: #111520;
                    --bg-3: #111520;
                    --border: rgba(255,255,255,0.06);
                    --border-hover: rgba(0,216,255,0.4);
                    --text-dim: #8A94A6;
                    --text-mid: #F8FAFC;
                    --mono: 'DM Mono', monospace;
                }

                * { box-sizing: border-box; }

                body {
                    font-family: 'DM Sans', sans-serif;
                    background: var(--bg);
                }

                /* ── Gradient text */
                .grad-text {
                    background: linear-gradient(135deg, var(--g-start) 0%, var(--g-end) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* ── Gradient fill */
                .grad-fill {
                    background: linear-gradient(135deg, var(--g-start) 0%, var(--g-end) 100%);
                }

                /* ── Cards */
                .card {
                    background: var(--bg-2);
                    border: 1px solid var(--border);
                    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
                }
                .card:hover { 
                    border-color: var(--border-hover); 
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(0, 216, 255, 0.15);
                }

                /* ── Input */
                .field {
                    width: 100%;
                    height: 48px;
                    padding: 0 16px;
                    background: var(--bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 700;
                    color: white;
                    outline: none;
                    transition: border-color 0.3s, box-shadow 0.3s;
                    font-family: 'DM Sans', sans-serif;
                }
                .field::placeholder { color: rgba(255,255,255,0.2); font-weight: 500; }
                .field:focus {
                    border-color: var(--g-start);
                    box-shadow: 0 0 15px rgba(0,216,255,0.2);
                }

                /* ── SKU card */
                .sku-card {
                    background: var(--bg-3);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: left;
                    padding: 14px 16px;
                }
                .sku-card:hover {
                    border-color: var(--g-start);
                    transform: translateY(-2px);
                    box-shadow: 0 0 15px rgba(0,216,255,0.2);
                }
                .sku-card.selected {
                    background: rgba(0, 216, 255, 0.1);
                    border-color: var(--g-start);
                    box-shadow: 0 0 0 1px var(--g-start), 0 0 20px rgba(0,216,255,0.3);
                    transform: translateY(-2px);
                }

                /* ── Payment card */
                .pay-card {
                    background: var(--bg-3);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                }
                .pay-card:hover { border-color: var(--border-hover); box-shadow: 0 0 15px rgba(0,216,255,0.1); }
                .pay-card.selected {
                    background: rgba(0, 216, 255, 0.1);
                    border-color: var(--g-start);
                    box-shadow: 0 0 0 1px var(--g-start);
                }

                /* ── Step badge */
                .step-badge {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: rgba(0,216,255,0.15);
                    border: 1px solid rgba(0,216,255,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--g-start);
                    flex-shrink: 0;
                    box-shadow: 0 0 10px rgba(0,216,255,0.2);
                }

                /* ── Navbar */
                .navbar {
                    background: rgba(8, 10, 16, 0.85);
                    backdrop-filter: blur(20px) saturate(150%);
                    -webkit-backdrop-filter: blur(20px) saturate(150%);
                    border-bottom: 1px solid var(--border);
                }

                /* ── Scrollbar */
                .thin-scroll::-webkit-scrollbar { width: 4px; }
                .thin-scroll::-webkit-scrollbar-track { background: transparent; }
                .thin-scroll::-webkit-scrollbar-thumb { background: rgba(0,216,255,0.2); border-radius: 4px; }

                /* ── Tag */
                .tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    background: rgba(0,216,255,0.1);
                    border: 1px solid rgba(0,216,255,0.3);
                    color: var(--g-start);
                }

                /* ── Divider with label */
                .group-divider {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }
                .group-divider span {
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.3);
                    white-space: nowrap;
                    font-style: italic;
                }
                .group-divider::before, .group-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--border);
                }
                .group-divider::before { display: none; }

                /* ── Buy button */
                .buy-btn {
                    background: var(--g-start);
                    color: #080A10;
                    font-weight: 800;
                    font-size: 13px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-style: italic;
                }
                .buy-btn:hover:not(:disabled) {
                    background: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 0 25px rgba(0,216,255,0.6);
                }
                .buy-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                /* ── Ambient glow behind hero image */
                .img-glow::after {
                    content: '';
                    position: absolute;
                    inset: -30px;
                    background: radial-gradient(ellipse at center, rgba(123,44,191,0.2) 0%, transparent 60%);
                    pointer-events: none;
                    z-index: 0;
                }

                /* ── Status badge */
                .status-paid   { background: rgba(52,211,153,0.1); color: #34D399; }
                .status-pending { background: rgba(232,184,75,0.1); color: #E8B84B; }
                .status-failed  { background: rgba(255,51,102,0.1);  color: #FF3366; }
            `}</style>

            {/* Ambient top glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top, rgba(0,216,255,0.1) 0%, transparent 65%)', zIndex: 0 }} />

            {/* ── NAVBAR */}
            <header className="navbar sticky top-0 z-[100] h-[58px]">
                <div className="max-w-5xl mx-auto px-5 h-full flex items-center justify-between">
                    <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="flex items-center gap-3 no-underline group">
                        <div className="w-9 h-9 flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{ background: 'rgba(0,216,255,0.1)', border: '1px solid rgba(0,216,255,0.3)', borderRadius: '10px' }}>
                            {storeLogo
                                ? <img src={storeLogo} alt="Logo" className="w-5 h-5 object-contain" />
                                : <Gamepad className="w-4 h-4 text-[#00D8FF]" />}
                        </div>
                        <div>
                            <span className="text-[14px] font-bold tracking-tight text-white">{storeName.split(' ')[0]}</span>
                            {storeName.split(' ').slice(1).join(' ') && (
                                <span className="text-[14px] font-bold tracking-tight grad-text ml-1">{storeName.split(' ').slice(1).join(' ')}</span>
                            )}
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-5">
                        <Link href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"} className="text-[11px] font-medium uppercase tracking-[0.15em] no-underline" style={{ color: 'var(--text-dim)' }}>
                            Katalog
                        </Link>
                        <button onClick={() => setTrackModal(true)}
                            className="text-[11px] font-medium uppercase tracking-[0.15em] bg-transparent border-none cursor-pointer transition-colors"
                            style={{ color: 'var(--text-dim)' }}>
                            Pesanan
                        </button>
                        <button className="px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-[#09090F] buy-btn" style={{ height: 'auto', padding: '7px 18px' }}>
                            Login
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-5 py-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── LEFT: Game info */}
                    <div className="lg:w-[26%]">
                        <div className="lg:sticky lg:top-[80px] space-y-4">

                            {/* Cover card */}
                            <div className="card rounded-2xl overflow-hidden relative img-glow">
                                <div className="aspect-[3/4] relative overflow-hidden">
                                    <img
                                        src={category.image || 'https://via.placeholder.com/400x533'}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                        style={{ opacity: 0.75 }}
                                    />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #09090F 0%, rgba(9,9,15,0.4) 40%, transparent 100%)' }} />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                        <div className="tag mb-2">
                                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#E8B84B' }} />
                                            Verified
                                        </div>
                                        <h1 className="text-[17px] font-bold text-white leading-tight tracking-tight">{category.name}</h1>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                                    {[
                                        { icon: Zap, label: 'Proses Instan', val: '1–3 Detik Selesai', color: '#E8B84B' },
                                        { icon: ShieldCheck, label: 'Produk Legal', val: '100% Aman & Resmi', color: '#34D399' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                                                <item.icon size={14} style={{ color: item.color }} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{item.label}</p>
                                                <p className="text-[12px] font-semibold text-white mt-0.5">{item.val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Back link */}
                            <Link
                                href={merchantSlug ? `/?merchant=${merchantSlug}` : "/"}
                                className="card flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[11px] font-medium uppercase tracking-[0.15em] no-underline transition-colors"
                                style={{ color: 'var(--text-dim)' }}>
                                <ArrowLeft size={12} /> Kembali ke Katalog
                            </Link>
                        </div>
                    </div>

                    {/* ── RIGHT: Form */}
                    <div className="lg:w-[74%] space-y-4">

                        {/* Step 01 – Game ID */}
                        <div className="card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="step-badge">01</div>
                                <div>
                                    <h2 className="text-[14px] font-semibold text-white tracking-tight">Data Akun</h2>
                                    <p className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: 'var(--text-dim)' }}>Target Pengiriman</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium uppercase tracking-[0.15em] ml-1" style={{ color: 'var(--text-dim)' }}>
                                        {bestProductInfo?.gameIdLabel || "User ID"}
                                    </label>
                                    <input
                                        type="text"
                                        value={gameId}
                                        onChange={e => setGameId(e.target.value)}
                                        className="field"
                                        placeholder="Masukkan ID game…"
                                    />
                                </div>
                                {bestProductInfo?.gameServerId && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-medium uppercase tracking-[0.15em] ml-1" style={{ color: 'var(--text-dim)' }}>
                                            {bestProductInfo.serverLabel || "Server ID"}
                                        </label>
                                        <input
                                            type="text"
                                            value={serverId}
                                            onChange={e => setServerId(e.target.value)}
                                            className="field"
                                            placeholder="Masukkan server…"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 02 – SKU */}
                        <div className="card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="step-badge">02</div>
                                <div>
                                    <h2 className="text-[14px] font-semibold text-white tracking-tight">Pilih Nominal</h2>
                                    <p className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: 'var(--text-dim)' }}>Voucher / Diamonds</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {allSkus.map((sku: any) => {
                                    const isSelected = selectedSku?.id === sku.id;
                                    return (
                                        <button
                                            key={sku.id}
                                            onClick={() => setSelectedSku(sku)}
                                            className={`sku-card ${isSelected ? 'selected' : ''}`}
                                        >
                                            <p className={`text-[12px] font-semibold leading-snug mb-2 ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                                {sku.name}
                                            </p>
                                            <p className={`text-[13px] font-bold ${isSelected ? 'grad-text' : ''}`}
                                                style={!isSelected ? { color: 'var(--text-mid)' } : {}}>
                                                Rp {new Intl.NumberFormat('id-ID').format(sku.priceNormal)}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 03 – Payment */}
                        <div className="card rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="step-badge">03</div>
                                <div>
                                    <h2 className="text-[14px] font-semibold text-white tracking-tight">Metode Pembayaran</h2>
                                    <p className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: 'var(--text-dim)' }}>Payment Gateway</p>
                                </div>
                            </div>
                            <div className="space-y-5">
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
                                            <div className="group-divider"><span>{groupName}</span></div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {channels.map((channel: any) => {
                                                    const isSelected = selectedPayment === channel.code;
                                                    return (
                                                        <button
                                                            key={channel.code}
                                                            onClick={() => setSelectedPayment(channel.code)}
                                                            className={`pay-card ${isSelected ? 'selected' : ''}`}
                                                        >
                                                            <div className="w-9 h-7 rounded-md bg-white flex items-center justify-center p-1 flex-shrink-0">
                                                                <img src={channel.icon_url} alt={channel.name} className="max-w-full max-h-full object-contain" />
                                                            </div>
                                                            <p className={`flex-1 text-left text-[12px] font-medium truncate ${isSelected ? 'text-white' : 'text-white/60'}`}>
                                                                {channel.name}
                                                            </p>
                                                            <span className={`text-[10px] font-medium flex-shrink-0 ${isSelected ? 'grad-text' : ''}`}
                                                                style={!isSelected ? { color: 'var(--text-dim)' } : {}}>
                                                                {channel.fee_flat > 0
                                                                    ? `+Rp ${Number(channel.fee_flat).toLocaleString()}`
                                                                    : channel.fee_percent > 0
                                                                        ? `+${channel.fee_percent}%`
                                                                        : 'Gratis'}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Step 04 – Order Summary */}
                        {selectedSku && (
                            <div className="card rounded-2xl p-5" style={{ borderColor: 'rgba(232,184,75,0.12)' }}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="step-badge">04</div>
                                    <div>
                                        <h2 className="text-[14px] font-semibold text-white tracking-tight">Rincian Pesanan</h2>
                                        <p className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: 'var(--text-dim)' }}>Review Order</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {isReseller && resellerDiscount > 0 && (
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">RESELLER PRICING APPLIED</span>
                                            <span className="text-[12px] font-bold text-emerald-400">-Rp {resellerDiscount.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                    {[
                                        { label: 'Item', val: selectedSku.name },
                                        { label: 'Harga', val: `Rp ${new Intl.NumberFormat('id-ID').format(checkoutCalculations?.basePrice || 0)}` },
                                    ].map((row, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <span className="text-[11px] font-medium" style={{ color: 'var(--text-dim)' }}>{row.label}</span>
                                            <span className="text-[12px] font-semibold text-white/80">{row.val}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-dim)' }}>
                                            Biaya Layanan {selectedPaymentChannel ? `(${selectedPaymentChannel.name})` : ''}
                                        </span>
                                        <span className="text-[12px] font-semibold text-white/80">
                                            {selectedPaymentChannel
                                                ? `Rp ${new Intl.NumberFormat('id-ID').format(checkoutCalculations?.serviceFee || 0)}`
                                                : <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Pilih metode…</span>
                                            }
                                        </span>
                                    </div>
                                    <div className="my-1" style={{ height: '1px', background: 'var(--border)' }} />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[12px] font-semibold grad-text">Total Bayar</span>
                                        <span className="text-[18px] font-bold text-white">
                                            Rp {new Intl.NumberFormat('id-ID').format(checkoutCalculations?.total || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step – Checkout */}
                        <div className="card rounded-2xl p-5">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="text-[10px] font-medium uppercase tracking-[0.15em] ml-1" style={{ color: 'var(--text-dim)' }}>
                                            Nomor WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={whatsapp}
                                            onChange={e => {
                                                setWhatsapp(e.target.value);
                                                setIsResellerVerified(false);
                                                setOtpToken('');
                                                setShowOtpInput(false);
                                            }}
                                            className="field"
                                            placeholder="08XXXXXXXXXX"
                                        />
                                    </div>
                                    
                                    {isReseller && !isResellerVerified && !showOtpInput && (
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={isSendingOtp}
                                            className="w-full md:w-auto h-[48px] px-6 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-amber-400/20 text-amber-400 flex items-center justify-center gap-2 hover:bg-amber-400/5 transition-colors"
                                            style={{ marginTop: 'auto' }}
                                        >
                                            {isSendingOtp ? '...' : <><Zap size={13} /> Verifikasi WA Reseller</>}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleBuy}
                                        disabled={isCheckoutting || (isReseller && !isResellerVerified)}
                                        className="buy-btn w-full md:w-auto md:min-w-[180px] h-[48px] rounded-xl"
                                        style={{ marginTop: 'auto' }}
                                    >
                                        {isCheckoutting
                                            ? <div className="w-4 h-4 rounded-full border-2 border-[#09090F] border-t-transparent animate-spin" />
                                            : <><Lock size={13} /> {isReseller && !isResellerVerified ? 'Verifikasi Dulu' : 'Bayar Sekarang'}</>
                                        }
                                    </button>
                                </div>

                                {showOtpInput && (
                                    <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex-1">
                                            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-2">Masukkan Kode OTP WA</p>
                                            <div className="flex gap-2">
                                                {['', '', '', ''].map((_, i) => (
                                                    <input
                                                        key={i}
                                                        type="text"
                                                        maxLength={1}
                                                        className="w-10 h-10 bg-black/40 border border-white/10 rounded-lg text-center font-bold text-amber-400 focus:border-amber-400/50 outline-none"
                                                        value={otpCode[i] || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^\d?$/.test(val)) {
                                                                const newOtp = otpCode.split('');
                                                                newOtp[i] = val;
                                                                setOtpCode(newOtp.join(''));
                                                                // Auto focus next or verify
                                                                if (val && i < 3) {
                                                                    (e.target.nextSibling as HTMLInputElement)?.focus();
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleVerifyOtp}
                                            className="h-[40px] px-6 rounded-lg bg-amber-400 text-black text-[11px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
                                        >
                                            Konfirmasi
                                        </button>
                                    </div>
                                )}

                                {isResellerVerified && (
                                    <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Reseller Terverifikasi</p>
                                            <p className="text-[10px] text-emerald-400/60 uppercase">Selamat belanja dengan harga khusus!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <footer className="mt-8 py-8" style={{ borderTop: '1px solid var(--border)', background: '#06060B' }}>
                <p className="text-center text-[10px] font-medium uppercase tracking-[0.35em]" style={{ color: 'rgba(255,255,255,0.12)' }}>
                    © {new Date().getFullYear()} {storeName.toUpperCase()} — Secure Checkout
                </p>
            </footer>

            {/* ── TRACK ORDER MODAL */}
            {trackModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-5">
                    <div className="absolute inset-0 bg-[#09090F]/80 backdrop-blur-2xl" onClick={() => setTrackModal(false)} />
                    <div className="card relative w-full max-w-lg rounded-2xl p-8 shadow-2xl"
                        style={{ animation: 'modalIn 0.2s ease', border: '1px solid rgba(232,184,75,0.12)' }}>
                        <style>{`@keyframes modalIn { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: none; } }`}</style>

                        <div className="flex items-center justify-between mb-7">
                            <div>
                                <h2 className="text-[18px] font-bold text-white tracking-tight">Lacak Pesanan</h2>
                                <p className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--text-dim)' }}>Cek Riwayat Pembelian</p>
                            </div>
                            <button onClick={() => setTrackModal(false)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleTrack} className="mb-6">
                            <label className="text-[10px] font-medium uppercase tracking-[0.15em] ml-1 mb-2 block" style={{ color: 'var(--text-dim)' }}>
                                Nomor WhatsApp
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="08XXXXXXXXXX"
                                    value={searchPhone}
                                    onChange={e => setSearchPhone(e.target.value)}
                                    className="field flex-1"
                                />
                                <button
                                    type="submit"
                                    disabled={isTracking}
                                    className="buy-btn px-5 rounded-xl text-[11px] flex-shrink-0"
                                    style={{ height: '48px' }}>
                                    {isTracking ? '…' : 'Cari'}
                                </button>
                            </div>
                        </form>

                        <div className="space-y-3 max-h-[380px] overflow-y-auto thin-scroll">
                            {trackingResults.length === 0 && !isTracking && (
                                <div className="py-10 text-center text-[12px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>
                                    Masukkan nomor WA untuk melihat riwayat
                                </div>
                            )}
                            {trackingResults.map((order) => (
                                <div key={order.id} className="p-4 rounded-xl" style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-semibold grad-text">{order.orderNumber}</span>
                                        <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${order.paymentStatus === 'PAID' ? 'status-paid' :
                                                order.paymentStatus === 'PENDING' ? 'status-pending' : 'status-failed'
                                            }`}>
                                            {order.paymentStatus || 'PENDING'}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[13px] font-semibold text-white">{order.productName}</p>
                                            <p className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>{order.productSkuName}</p>
                                        </div>
                                        <span className="text-[14px] font-bold text-white">Rp {Number(order.totalPrice).toLocaleString()}</span>
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