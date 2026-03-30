"use client";

// Security: Sanitize HTML from external sources before rendering
const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
};


import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { CreditCard, CheckCircle, Clock, Zap, Check, ArrowRight, Shield, HelpCircle, ChevronDown, X } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantSubscriptionPage() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    // States for modals and forms
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [proofUrl, setProofUrl] = useState('');

    // Fetch subscription status and invoices
    const { data: status, error: statusError, mutate: mutateStatus } = useSWR(`${baseUrl}/merchant/subscription`, fetcher);
    const { data: invoices, mutate: mutateInvoices } = useSWR(`${baseUrl}/merchant/subscription/invoices`, fetcher);

    // State for new invoice modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({ plan: 'PRO', method: 'QRISC' });
    const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
    const [channelsLoading, setChannelsLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Fetch plan features (Dynamic Prices)
    const { data: planFeatures, isLoading: plansLoading } = useSWR(`${baseUrl}/public/subscriptions/plans/features`, (url) => axios.get(url).then(res => res.data));

    // Dynamic mapping from backend data
    const getPlanConfigs = (): Record<string, { price: number; yearlyPrice: number; description: string; features: string[] }> => {
        if (!planFeatures) return {};
        
        const validPlans = ['PRO', 'LEGEND', 'SUPREME'];
        const configs: any = {};
        
        const featureLabels: Record<string, (d: any) => string | null> = {
            maxProducts: (d) => `Max ${d.maxProducts?.toLocaleString('id-ID')} Produk Aktif`,
            customDomain: (d) => d.customDomain ? `BONUS Domain (${d.domainChoices || 2} Pilihan)` : null,
            multiUser: (d) => d.multiUser ? 'Multi User / Staff' : null,
            seoPixel: (d) => d.seoPixel ? 'Optimasi SEO & Pixel' : null,
            couponManagement: (d) => d.couponManagement ? 'Manajemen Kupon Diskon' : null,
            templateVariants: (d) => d.templateVariants ? 'Variasi Template Website' : null,
            tldDomain: (d) => d.tldDomain ? 'Dapat Domain TLD' : null,
            flashSale: (d) => d.flashSale ? 'Fitur Flash Sale (FOMO)' : null,
            instantWithdrawal: (d) => d.instantWithdrawal ? 'Penarikan Saldo Instan' : null,
            customProductDetail: (d) => d.customProductDetail ? 'Kustomisasi Detail Produk' : null,
            resellerAcademy: (d) => d.resellerAcademy ? 'Reseller Academy' : null,
            buildApk: (d) => d.buildApk ? 'Build Your APK' : null,
            whiteLabel: (d) => d.whiteLabel ? 'White Label (Tanpa Branding DagangPlay)' : null,
            prioritySupport: (d) => d.prioritySupport ? 'Prioritized Support (WhatsApp)' : null,
        };

        validPlans.forEach(plan => {
            const data = planFeatures[plan];
            if (data) {
                const features: string[] = [
                    'Akses Semua Produk',
                    'Harga Modal ' + (plan === 'PRO' ? 'Murah' : plan === 'LEGEND' ? 'Lebih Murah' : 'Paling Murah'),
                    'Tanpa Deposit',
                    `Website ${plan === 'PRO' ? 'Fast' : plan === 'LEGEND' ? 'Faster' : 'Super Fast'}`,
                    'Kustomisasi Website',
                ];
                Object.values(featureLabels).forEach(fn => {
                    const label = fn(data);
                    if (label) features.push(label);
                });
                configs[plan] = {
                    price: data.price || 0,
                    yearlyPrice: data.yearlyPrice || 0,
                    description: data.description || '',
                    features,
                };
            }
        });

        return configs;
    };

    const PLAN_PRICES = getPlanConfigs();

    const openCreateModal = async () => {
        setIsCreateModalOpen(true);
        if (paymentChannels.length === 0) {
            setChannelsLoading(true);
            try {
                const res = await axios.get(`${baseUrl}/public/orders/payment-channels`);
                const channels = (res.data?.data || []).filter((c: any) => c.active);
                setPaymentChannels(channels.length > 0 ? channels : getFallbackChannels());
            } catch {
                setPaymentChannels(getFallbackChannels());
            } finally {
                setChannelsLoading(false);
            }
        }
    };

    const getFallbackChannels = () => [
        { code: 'QRISC', name: 'QRIS (Semua E-Wallet)' },
        { code: 'BRIVA', name: 'BRI Virtual Account' },
        { code: 'BCAVA', name: 'BCA Virtual Account' },
        { code: 'BNIVA', name: 'BNI Virtual Account' },
        { code: 'MANDIRIVA', name: 'Mandiri Virtual Account' },
        { code: 'DANA', name: 'DANA' },
        { code: 'OVO', name: 'OVO' },
    ];

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const planData = PLAN_PRICES[invoiceForm.plan];
            
            if (!planData) {
                alert('Pilih paket yang valid');
                setCreateLoading(false);
                return;
            }

            const res = await axios.post(`${baseUrl}/merchant/subscription/invoices`,
                { plan: invoiceForm.plan, amount: planData.price, method: invoiceForm.method },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsCreateModalOpen(false);

            if (res.data.tripayPaymentUrl) {
                window.open(res.data.tripayPaymentUrl, '_blank');
                alert('Tagihan berhasil dibuat! Selesaikan pembayaran di halaman Tripay yang terbuka.');
            } else {
                alert('Tagihan berhasil dibuat!');
            }

            mutateStatus();
            mutateInvoices();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal membuat tagihan');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleUploadProof = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/subscription/invoices/${selectedInvoice.id}/proof`, { proofUrl }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Bukti transfer berhasil diupload. Harap tunggu konfirmasi admin.');
            setIsUploadModalOpen(false);
            setProofUrl('');
            mutateInvoices();
        } catch (err: any) {
            alert('Gagal mengupload bukti transfer');
        }
    };

    // Error State
    if (statusError) return (
        <MerchantLayout>
            <div className="py-20 text-center">
                <div className="bg-red-50 text-red-600 p-8 rounded-[35px] border border-red-100 inline-block max-w-lg shadow-sm">
                    <Shield className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Koneksi Gagal</h3>
                    <p className="text-sm opacity-80 leading-relaxed mb-6">
                        {statusError.response?.status === 401
                            ? "Sesi Anda telah berakhir. Silakan login kembali untuk mengakses halaman ini."
                            : statusError.response?.data?.message || statusError.message || 'Gagal memuat data dari server DagangPlay.'}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => mutateStatus()} className="px-8 py-3 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all">
                            Coba Hubungkan Kembali
                        </button>
                        <button onClick={() => window.location.href = '/merchant/login'} className="text-[10px] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest">
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );

    // Initial Loading State
    if (!status) return (
        <MerchantLayout>
            <div className="py-32 text-center text-slate-400">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-black tracking-widest uppercase text-[10px]">Menyinkronkan Status Langganan...</p>
            </div>
        </MerchantLayout>
    );

    return (
        <MerchantLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Subscription & Billing</h1>
                <p className="text-slate-500 text-sm mt-1">Kelola paket langganan DagangPlay Anda dan pantau riwayat penagihan otomatis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[35px] p-8 shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                    <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                    {status.isActive ? 'Status Aktif' : 'Tenggang'}
                                </span>
                            </div>

                            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Paket Saat Ini</p>
                            <h2 className="text-4xl font-black tracking-tighter uppercase">{status.plan} PACKAGE</h2>

                            <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                                <p className="text-xs text-indigo-100/60 font-medium flex justify-between items-center">
                                    <span>Dimulai Pada:</span>
                                    <span className="text-white font-bold">{status.planStartedAt ? new Date(status.planStartedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                </p>
                                <p className="text-xs text-indigo-100/60 font-medium flex justify-between items-center">
                                    <span>Berakhir Pada:</span>
                                    <span className="text-white font-bold">{status.planExpiredAt ? new Date(status.planExpiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                </p>
                            </div>

                            <button onClick={openCreateModal} className="mt-10 w-full py-4 bg-white text-indigo-700 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-xl flex items-center justify-center gap-3 text-[13px] hover:-translate-y-1">
                                PERPANJANG / UPGRADE <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm">
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                            Fitur {status.plan}
                        </h3>
                        {planFeatures?.[status.plan]?.maxProfitLabel && (
                            <p className="text-[11px] text-emerald-600 font-bold mb-4 pl-4">
                                Potensi Profit Hingga {planFeatures[status.plan].maxProfitLabel}
                            </p>
                        )}
                        <ul className="space-y-3">
                            {(PLAN_PRICES[status.plan]?.features || []).map((f: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-[12px] text-slate-600 font-medium">
                                    <div className="w-5 h-5 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 stroke-[3]" /></div>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        {planFeatures?.[status.plan]?.yearlyPrice > 0 && (
                            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Harga Tahunan</p>
                                <p className="text-xl font-black text-indigo-700">Rp {planFeatures[status.plan].yearlyPrice.toLocaleString('id-ID')}</p>
                                <p className="text-[10px] text-slate-400 font-medium">/ tahun</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* History Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-slate-300" /> Riwayat Pembayaran
                            </h3>
                            <button onClick={() => mutateInvoices()} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <Clock className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Invoices</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {!invoices ? (
                                        <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-400 text-xs italic">Memuat transaski...</td></tr>
                                    ) : invoices.length === 0 ? (
                                        <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-medium">Belum ada riwayat transaksi.</td></tr>
                                    ) : (
                                        invoices.map((inv: any) => (
                                            <React.Fragment key={inv.id}>
                                                <tr className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <p className="font-black text-slate-800 tracking-tight">{inv.invoiceNo}</p>
                                                        <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase">{new Date(inv.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} • {inv.plan}</p>
                                                        <p className="text-sm font-black text-indigo-600 mt-2">Rp {Number(inv.totalAmount).toLocaleString('id-ID')}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                            inv.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                            }`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {inv.status === 'UNPAID' && inv.tripayPaymentUrl && (
                                                            <button onClick={() => window.open(inv.tripayPaymentUrl, '_blank')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                                                BAYAR
                                                            </button>
                                                        )}
                                                        {inv.status === 'UNPAID' && !inv.tripayPaymentUrl && (
                                                            <button onClick={() => { setSelectedInvoice(inv); setIsUploadModalOpen(true); }} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">
                                                                UPLOAD
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* Instructions if Unpaid */}
                                                {inv.status === 'UNPAID' && inv.tripayResponse?.instructions && (
                                                    <tr>
                                                        <td colSpan={3} className="px-8 py-0 border-none">
                                                            <details className="group">
                                                                <summary className="py-4 text-[11px] font-orange text-indigo-600 cursor-pointer list-none flex items-center gap-2 hover:opacity-70 transition-opacity">
                                                                    <HelpCircle className="w-3.5 h-3.5" /> LIHAT INSTRUKSI PEMBAYARAN
                                                                    <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180 ml-auto" />
                                                                </summary>
                                                                <div className="pb-8 pt-2">
                                                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                                        <div className="flex flex-col md:flex-row gap-8">
                                                                            <div className="flex-1 space-y-4">
                                                                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">KODE BAYAR / VA</p>
                                                                                    <p className="text-2xl font-black text-indigo-600 tracking-wider">{inv.tripayResponse.pay_code || inv.tripayResponse.payment_name}</p>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    {inv.tripayResponse.instructions.slice(0, 3).map((ins: any, i: number) => (
                                                                                        <div key={i} className="bg-white/50 p-3 rounded-xl border border-slate-100">
                                                                                            <p className="text-[11px] font-black text-slate-700 mb-2">{ins.title}</p>
                                                                                            <ul className="space-y-1">
                                                                                                {ins.steps.slice(0, 5).map((st: string, si: number) => (
                                                                                                    <li key={si} className="text-[11px] text-slate-500 list-disc list-inside leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(st)}} />
                                                                                                ))}
                                                                                            </ul>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            {inv.tripayResponse.qr_url && (
                                                                                <div className="text-center">
                                                                                    <img src={inv.tripayResponse.qr_url} alt="QR" className="w-40 h-40 mx-auto border-4 border-white p-2 bg-white rounded-2xl shadow-sm mb-3" />
                                                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Scan QRIS Untuk Bayar</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </details>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Upload */}
            {isUploadModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-[450px] overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Kirim Bukti Bayar</h3>
                            <button onClick={() => { setIsUploadModalOpen(false); setSelectedInvoice(null); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-2xl font-light">&times;</button>
                        </div>
                        <div className="p-8">
                            <div className="mb-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                                <p className="text-3xl font-black text-slate-800">Rp {Number(selectedInvoice.totalAmount).toLocaleString('id-ID')}</p>
                                <p className="text-[10px] font-bold text-indigo-600 mt-4 px-3 py-1 bg-white rounded-full inline-block border border-indigo-100">{selectedInvoice.invoiceNo}</p>
                            </div>
                            <form onSubmit={handleUploadProof}>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Tautan Gambar Bukti Bayar</label>
                                        <input
                                            type="url"
                                            required
                                            value={proofUrl}
                                            onChange={e => setProofUrl(e.target.value)}
                                            placeholder="Upload ke imgur/posimg dan tempel link di sini"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 text-[13px] uppercase tracking-widest">
                                        Konfirmasi Pembayaran
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Create Invoice Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-800 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Upgrade / Perpanjang Paket</h3>
                                <p className="text-indigo-200 text-xs font-medium mt-1">Pilih paket dan metode pembayaran</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-2xl font-light">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={handleCreateInvoice} className="p-6 space-y-6">
                                {/* Plan Selector */}
                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">Pilih Paket</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {Object.entries(PLAN_PRICES).map(([plan, data]: [string, any]) => (
                                            <button
                                                key={plan}
                                                type="button"
                                                onClick={() => setInvoiceForm({ ...invoiceForm, plan })}
                                                className={`relative p-4 rounded-2xl border-2 text-left transition-all ${invoiceForm.plan === plan
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                                                    : 'border-slate-100 hover:border-indigo-200'
                                                    }`}
                                            >
                                                {invoiceForm.plan === plan && (
                                                    <div className="absolute top-3 right-3 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                                    </div>
                                                )}
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{plan}</p>
                                                <p className="text-xl font-black text-slate-800">Rp {data.price.toLocaleString('id-ID')}</p>
                                                <p className="text-[11px] text-slate-500 font-medium mt-1">{data.description}</p>
                                                <ul className="mt-3 space-y-1.5">
                                                    {data.features.map((f: string, i: number) => (
                                                        <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                                            <Check className="w-3 h-3 text-emerald-500 stroke-[3] flex-shrink-0" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">Metode Pembayaran</label>
                                    {channelsLoading ? (
                                        <div className="flex items-center gap-2 py-4 text-slate-400">
                                            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm">Memuat metode pembayaran...</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {paymentChannels.map((ch: any) => (
                                                <button
                                                    key={ch.code}
                                                    type="button"
                                                    onClick={() => setInvoiceForm({ ...invoiceForm, method: ch.code })}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all ${invoiceForm.method === ch.code
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-slate-100 hover:border-indigo-200'
                                                        }`}
                                                >
                                                    <p className="text-xs font-bold text-slate-800 leading-tight">{ch.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ch.code}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Summary */}
                                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-indigo-600 font-bold">Paket {invoiceForm.plan} — 1 Tahun</p>
                                            <p className="text-[11px] text-indigo-400 font-medium mt-0.5">
                                                {paymentChannels.find((c: any) => c.code === invoiceForm.method)?.name || invoiceForm.method}
                                            </p>
                                        </div>
                                        <p className="text-2xl font-black text-indigo-700">Rp {Number(PLAN_PRICES?.[invoiceForm.plan]?.price || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {createLoading ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Memproses...</>
                                        ) : (
                                            <>Buat Tagihan & Bayar <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
