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
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            try {
                const res = await axios.get(`${baseUrl}/public/orders/${id}`);
                setOrder(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Gagal memuat pesanan');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();

        // Polling for status update if PENDING
        const interval = setInterval(() => {
            if (order && order.paymentStatus === 'PENDING') {
                fetchOrder();
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [id, order?.paymentStatus]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Disalin ke clipboard!');
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Memuat Tagihan...</p>
            </div>
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Oops! Terjadi Kesalahan</h2>
                <p className="text-slate-500 mt-2 mb-6">{error || 'Pesanan tidak ditemukan'}</p>
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                </Link>
            </div>
        </div>
    );

    const payment = order.payment;
    const tripayData = payment?.tripayResponse || {};
    const instructions = tripayData.instructions || [];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header / Nav */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
                        <ArrowLeft className="w-4 h-4" /> <span>Kembali</span>
                    </Link>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan Pesanan</p>
                        <p className="text-sm font-bold text-slate-800">#{order.orderNumber}</p>
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status Card */}
                        <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-5 ${order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-white border-slate-100'
                            }`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${order.paymentStatus === 'PAID' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {order.paymentStatus === 'PAID' ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                            </div>
                            <div>
                                <h2 className={`text-xl font-black ${order.paymentStatus === 'PAID' ? 'text-emerald-800' : 'text-slate-800'}`}>
                                    {order.paymentStatus === 'PAID' ? 'Pembayaran Berhasil!' : 'Menunggu Pembayaran'}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">
                                    {order.paymentStatus === 'PAID'
                                        ? 'Terima kasih, pesanan Anda sedang diproses sistem.'
                                        : 'Segera selesaikan pembayaran sebelum batas waktu berakhir.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Payment Details Card */}
                        {order.paymentStatus === 'PENDING' && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-indigo-600" /> Detail Pembayaran
                                    </h3>
                                </div>
                                <div className="p-8 text-center bg-slate-50/50">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Metode: {payment?.method}</p>

                                    {/* Code / VA Display */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 inline-block min-w-[280px]">
                                        {tripayData.qr_url ? (
                                            <div className="space-y-4">
                                                <img src={tripayData.qr_url} alt="QR Code" className="w-48 h-48 mx-auto" />
                                                <p className="text-xs text-slate-400 italic">Scan QR di atas untuk membayar</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Nomor Virtual Account</p>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="text-3xl font-black text-slate-800 tracking-wider">
                                                        {tripayData.pay_code || '---'}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(tripayData.pay_code)}
                                                        className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:text-indigo-600 transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-200/60 max-w-xs mx-auto">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Bayar</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-2xl font-black text-slate-800">Rp {Number(order.totalPrice).toLocaleString('id-ID')}</span>
                                            <button
                                                onClick={() => copyToClipboard(order.totalPrice.toString())}
                                                className="text-slate-300 hover:text-indigo-500"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions / Langkah-langkah */}
                                <div className="p-6 border-t border-slate-100 bg-white">
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4 text-indigo-400" /> Instruksi Pembayaran
                                    </h4>

                                    <div className="space-y-3">
                                        {instructions.map((group: any, idx: number) => (
                                            <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                                                <button
                                                    onClick={() => setOpenAccordion(openAccordion === group.title ? null : group.title)}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className="text-sm font-bold text-slate-700">{group.title}</span>
                                                    {openAccordion === group.title ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                </button>
                                                {openAccordion === group.title && (
                                                    <div className="p-4 bg-white">
                                                        <ol className="list-decimal list-inside space-y-3">
                                                            {group.steps.map((step: string, sIdx: number) => (
                                                                <li
                                                                    key={sIdx}
                                                                    className="text-sm text-slate-600 leading-relaxed"
                                                                    dangerouslySetInnerHTML={{ __html: step }}
                                                                />
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {order.paymentStatus === 'PAID' && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Download className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Tiket / SN Produk</h3>
                                <p className="text-slate-500 mt-2 mb-6">Produk telah berhasil diisi ke akun Anda.</p>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block w-full">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Serial Number / Ref ID</p>
                                    <p className="text-lg font-mono font-black text-slate-700 tracking-wider">
                                        {order.serialNumber || 'Tunggu Sebentar...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-50 pb-4">Ringkasan Pesanan</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{order.productName}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">{order.productSkuName}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">Target:</span>
                                        <span className="text-slate-700 font-bold">{order.gameUserId} {order.gameUserServerId ? `(${order.gameUserServerId})` : ''}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">Harga:</span>
                                        <span className="text-slate-700 font-bold">Rp {Number(order.totalPrice).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">WhatsApp:</span>
                                        <span className="text-slate-700 font-bold">{order.user?.phone || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {order.paymentStatus === 'PENDING' && (
                            <Link
                                href={order.payment?.tripayPaymentUrl || '#'}
                                target="_blank"
                                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-lg"
                            >
                                <ExternalLink className="w-4 h-4" /> Buka di Checkout Tripay
                            </Link>
                        )}

                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <p className="text-[11px] text-indigo-700 leading-relaxed">
                                <b>Catatan:</b> Jika terjadi kendala pembayaran atau saldo tidak otomatis bertambah, hubungi Customer Service kami via WhatsApp dengan melampirkan nomor tagihan.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
