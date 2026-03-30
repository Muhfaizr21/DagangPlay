"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import {
    CheckCircle,
    Clock,
    Copy,
    Download,
    ExternalLink,
    ArrowLeft,
    CreditCard,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Zap,
    ShieldCheck,
    Smartphone,
    Share2,
    RefreshCcw,
    Gamepad as GamepadIcon
} from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    const orderRef = React.useRef<any>(null);

    const fetchOrder = async (isManual = false) => {
        if (isManual) setSyncing(true);
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        try {
            const res = await axios.get(`${baseUrl}/public/orders/${id}`);
            setOrder(res.data);
            orderRef.current = res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat pesanan');
        } finally {
            setLoading(false);
            if (isManual) setTimeout(() => setSyncing(false), 500);
        }
    };

    // FIX FE-2: Sanitize text from external API before rendering as HTML
    const sanitizeText = (html: string) => {
        if (!html) return '';
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
    };

    useEffect(() => {
        if (id) fetchOrder();

        // FIX FE-4: Use ref to read current order status — prevents multiple interval creation
        const interval = setInterval(() => {
            const current = orderRef.current;
            if (current && (current.paymentStatus === 'PENDING' || current.paymentStatus === 'PROCESSING')) {
                fetchOrder();
            }
        }, 5000);

        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Only depends on id, not order.paymentStatus — prevents multiple interval spawning

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Simple visual feedback instead of alert if possible, but alert is fine for now
    };

    if (loading) return (
        <div className="min-h-screen bg-[#001D2D] flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-[#F77F00] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-white/20 uppercase tracking-[0.4em] italic text-xs animate-pulse">Syncing Blockchain...</p>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen bg-[#001D2D] flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full glass-card p-10 rounded-[3rem] border-white/5 shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Invoice Not Found</h2>
                <p className="text-white/40 text-sm font-medium mb-10 italic">Detail pesanan tidak dapat ditemukan atau telah kadaluarsa.</p>
                <Link href="/" className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#001D2D] font-black rounded-2xl hover:bg-[#F77F00] hover:text-white transition-all uppercase tracking-widest text-[10px]">
                    <ArrowLeft size={16} /> Back to Store
                </Link>
            </div>
        </div>
    );

    const payment = order.payment;
    const tripayData = payment?.tripayResponse || {};
    const instructions = tripayData.instructions || [];

    return (
        <div className="min-h-screen bg-[#001D2D] text-white font-outfit selection:bg-[#F77F00] selection:text-white relative overflow-x-hidden font-sans">
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

                .glass-card {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .premium-gradient-text {
                    background: linear-gradient(to right, #FCBF49, #F77F00, #D62828);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            <div className="fixed inset-0 bg-mesh-ultra pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-[100] h-20 bg-[#001D2D]/80 backdrop-blur-2xl border-b border-white/5">
                <div className="container max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 no-underline group hover:opacity-80 transition-all">
                        <ArrowLeft size={18} className="text-white/40 group-hover:text-[#F77F00] transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Invoice #{order.orderNumber}</span>
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 transition-all ${syncing ? 'bg-[#F77F00]/20 border-[#F77F00]/40' : 'bg-white/5 border-white/10'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full bg-[#F77F00] ${syncing ? 'animate-ping' : 'animate-pulse'}`}></div>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#F77F00]">Real-time Sync</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container max-w-5xl mx-auto px-6 py-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Status Section */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Status Card Hero */}
                        <div className={`p-10 rounded-[3rem] border transition-all duration-700 shadow-2xl relative overflow-hidden ${order.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'glass-card border-white/10'
                        }`}>
                            {order.paymentStatus === 'PAID' && (
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                            )}
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-transform duration-500 hover:rotate-6 ${
                                    order.paymentStatus === 'PAID' ? 'bg-emerald-500 text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)]' : 'bg-[#FCBF49] text-[#001D2D] shadow-[0_20px_50px_rgba(252,191,73,0.2)]'
                                }`}>
                                    {order.paymentStatus === 'PAID' ? <CheckCircle size={48} strokeWidth={3} /> : <div className="animate-spin duration-[4000ms]"><RefreshCcw size={48} strokeWidth={3} /></div>}
                                </div>
                                
                                <div className="flex-1">
                                    <h1 className={`text-4xl font-black uppercase italic tracking-tighter mb-2 leading-tight ${order.paymentStatus === 'PAID' ? 'text-white' : 'text-white'}`}>
                                        {order.paymentStatus === 'PAID' ? 'Payment Verified' : 'Awaiting Payment'}
                                    </h1>
                                    <p className="text-white/40 text-sm font-medium italic">
                                        {order.paymentStatus === 'PAID'
                                            ? 'Success! Your order is being processed by the system.'
                                            : 'Please complete your payment to continue the transaction.'
                                        }
                                    </p>
                                </div>
                                
                                <div className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl">
                                     <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Pay</p>
                                     <p className="text-2xl font-black italic">Rp {Number(order.totalPrice).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Box */}
                        {order.paymentStatus === 'PENDING' && (
                            <div className="glass-card rounded-[3rem] p-10 border-white/10 shadow-2xl">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#F77F00]/10 border border-[#F77F00]/20 flex items-center justify-center text-[#F77F00]">
                                            <CreditCard size={20} />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tight">Payment Portal</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{payment?.method} Method</span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div className="flex flex-col items-center">
                                        {tripayData.qr_url ? (
                                            <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(255,255,255,0.05)] mb-6">
                                                <img src={tripayData.qr_url} alt="QR" className="w-56 h-56" />
                                            </div>
                                        ) : (
                                            <div className="w-full space-y-6">
                                                <div className="p-10 bg-white/300 rounded-[2rem] border border-white/10 text-center relative group">
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Transfer / VA Code</p>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <span className="text-4xl font-black text-white bg-[#001D2D] px-6 py-4 rounded-2xl tracking-tighter italic">
                                                            {tripayData.pay_code || '------'}
                                                        </span>
                                                        <button
                                                            onClick={() => copyToClipboard(tripayData.pay_code)}
                                                            className="w-14 h-14 bg-white text-[#001D2D] rounded-2xl flex items-center justify-center hover:bg-[#F77F00] hover:text-white transition-all transform active:scale-95 shadow-xl"
                                                        >
                                                            <Copy size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-white/30">
                                            <Zap size={14} className="text-[#F77F00]" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest italic">Fast & Encrypted Protocol</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <p className="text-xs font-black text-[#F77F00] uppercase tracking-[0.3em] mb-4">Next Steps:</p>
                                        <div className="space-y-4">
                                            {instructions.slice(0, 3).map((group: any, idx: number) => (
                                                <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer group" onClick={() => setOpenAccordion(openAccordion === group.title ? null : group.title)}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase italic tracking-tight">{group.title}</span>
                                                        <ChevronDown size={16} className={`text-white/20 group-hover:text-white transition-transform ${openAccordion === group.title ? 'rotate-180' : ''}`} />
                                                    </div>
                                                    {openAccordion === group.title && (
                                                        <ol className="mt-4 space-y-3 list-decimal list-inside border-t border-white/5 pt-4">
                                                            {group.steps.map((step: string, sIdx: number) => (
                                                                <li key={sIdx} className="text-[10px] text-white/40 font-medium leading-relaxed italic">
                                                                    <span dangerouslySetInnerHTML={{ __html: sanitizeText(step) }} />
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SN Display */}
                        {order.paymentStatus === 'PAID' && (
                            <div className="glass-card rounded-[3rem] p-10 border-[#F77F00]/20 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                                <div className="text-center space-y-8">
                                    <div className="w-20 h-20 bg-[#F77F00]/10 text-[#F77F00] rounded-[1.5rem] flex items-center justify-center mx-auto rotate-6 animate-pulse">
                                        <Zap size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Transaction Fulfilled</h3>
                                        <p className="text-white/40 text-sm font-medium italic">Your product has been delivered successfully.</p>
                                    </div>

                                    <div className="p-10 bg-[#FCBF49]/300 rounded-[2.5rem] border border-[#FCBF49]/10 relative group bg-white/5">
                                        <p className="text-[9px] font-black text-[#FCBF49] uppercase tracking-[0.5em] mb-4">Serial Number / Transaction ID</p>
                                        <div className="flex items-center justify-center gap-4">
                                            <p className="text-3xl font-mono font-black text-white tracking-widest">
                                                {order.serialNumber || 'FULFILLING...'}
                                            </p>
                                            <button
                                                onClick={() => copyToClipboard(order.serialNumber)}
                                                className="w-12 h-12 bg-white text-[#001D2D] rounded-xl flex items-center justify-center hover:bg-[#F77F00] hover:text-white transition-all"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card rounded-[3rem] p-10 border-white/5 shadow-2xl">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 pb-4 border-b border-white/5">Order Summary</h4>
                             
                             <div className="space-y-8">
                                 <div className="flex items-start gap-5">
                                      <div className="w-16 h-16 rounded-2xl bg-[#003049] border border-white/10 flex items-center justify-center shadow-xl rotate-3">
                                          <GamepadIcon size={28} className="text-[#F77F00]" />
                                      </div>
                                      <div>
                                          <p className="text-lg font-black italic uppercase leading-tight">{order.productName}</p>
                                          <p className="text-[10px] font-bold text-[#FCBF49] uppercase tracking-widest mt-1">{order.productSkuName}</p>
                                      </div>
                                 </div>

                                 <div className="space-y-4 pt-4 border-t border-white/5">
                                     <div className="flex justify-between items-center">
                                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Target Account</span>
                                         <span className="text-xs font-black italic">{order.gameUserId} {order.gameUserServerId ? `(${order.gameUserServerId})` : ''}</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Payment Method</span>
                                         <span className="text-xs font-black italic">{payment?.method || 'TRIPAY'}</span>
                                     </div>
                                     <div className="flex justify-between items-center">
                                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">WhatsApp</span>
                                         <span className="text-xs font-black italic">{order.user?.phone || order.phone || '-'}</span>
                                     </div>
                                 </div>

                                 <div className="pt-6 border-t border-white/5">
                                      <div className="flex justify-between items-end">
                                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Price</span>
                                          <span className="text-3xl font-black italic text-white">Rp {Number(order.totalPrice).toLocaleString()}</span>
                                      </div>
                                 </div>
                             </div>
                        </div>

                        {order.paymentStatus === 'PENDING' && (
                             <a
                                href={order.payment?.tripayPaymentUrl || '#'}
                                target="_blank"
                                className="w-full h-20 flex items-center justify-center gap-4 bg-white text-[#001D2D] font-black rounded-[2rem] hover:bg-[#F77F00] hover:text-white transition-all shadow-2xl group transition-all transform hover:-translate-y-2 no-underline"
                            >
                                <span className="uppercase tracking-widest text-[11px]">Pay with Tripay Gateway</span>
                                <ExternalLink size={20} className="group-hover:rotate-45 transition-transform" />
                            </a>
                        )}

                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <div className="flex items-start gap-4">
                                <ShieldCheck size={18} className="text-[#F77F00] mt-1 shrink-0" />
                                <p className="text-[10px] text-white/40 font-medium leading-relaxed italic uppercase tracking-[0.05em]">
                                    This invoice is a legal document of <span className="text-white">DagangPlay Pro</span>. If you face any issues, please contact our support agent via WhatsApp for immediate verification.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="py-20 text-center opacity-20 relative z-10">
                 <p className="text-[8px] font-black uppercase tracking-[0.5em] italic">Encrypted Secure Portal — V.4.2.1-PRO</p>
            </footer>
        </div>
    );
}
