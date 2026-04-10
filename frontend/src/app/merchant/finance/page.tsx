"use client";
import { getApiUrl } from '@/lib/api';

// Security: Sanitize HTML from external sources before rendering
const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
};


import React, { useState, useEffect } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpToLine, Gift, RefreshCcw, Lock, Zap, Clock, HelpCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantFinancePage() {
    const baseUrl = getApiUrl();
    const { data: financeData, mutate: mutateFinance } = useSWR(`${baseUrl}/merchant/finance`, fetcher, { refreshInterval: 10000 });

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', bankName: '', bankAccountNumber: '', bankAccountName: '' });
    const [withdrawType, setWithdrawType] = useState('MANUAL'); // MANUAL or INSTANT

    const [merchantPlan, setMerchantPlan] = useState('PRO');

    useEffect(() => {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setMerchantPlan(parsed.plan || 'PRO');
        }
    }, []);

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedChannel, setSelectedChannel] = useState<any>(null);
    const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
    const [channelsLoading, setChannelsLoading] = useState(false);
    const [depositLoading, setDepositLoading] = useState(false);

    const openDepositModal = async () => {
        setIsDepositModalOpen(true);
        setChannelsLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/public/orders/payment-channels`);
            const channels = (res.data?.data || []).filter((c: any) => c.active);
            setPaymentChannels(channels);
            if (channels.length > 0 && !selectedChannel) setSelectedChannel(channels[0]);
        } catch {
            const fallback = [
                { code: 'QRISC', name: 'QRIS (Semua E-Wallet)', group: 'QRIS', fee_flat: 0, fee_percent: 0.7, icon_url: null },
                { code: 'BRIVA', name: 'BRI Virtual Account', group: 'Virtual Account', fee_flat: 4000, fee_percent: 0, icon_url: null },
                { code: 'BCAVA', name: 'BCA Virtual Account', group: 'Virtual Account', fee_flat: 4500, fee_percent: 0, icon_url: null },
                { code: 'BNIVA', name: 'BNI Virtual Account', group: 'Virtual Account', fee_flat: 4000, fee_percent: 0, icon_url: null },
                { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', group: 'Virtual Account', fee_flat: 4000, fee_percent: 0, icon_url: null },
                { code: 'DANA', name: 'DANA', group: 'E-Wallet', fee_flat: 0, fee_percent: 0.7, icon_url: null },
                { code: 'OVO', name: 'OVO', group: 'E-Wallet', fee_flat: 0, fee_percent: 0.7, icon_url: null },
                { code: 'SHOPEEPAY', name: 'ShopeePay', group: 'E-Wallet', fee_flat: 0, fee_percent: 0.7, icon_url: null },
            ];
            setPaymentChannels(fallback);
            if (!selectedChannel) setSelectedChannel(fallback[0]);
        } finally {
            setChannelsLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            // Pointing to new modular WithdrawalsController
            await axios.post(`${baseUrl}/merchant/withdrawals/request`, {
                amount: Number(withdrawForm.amount),
                bankName: withdrawForm.bankName,
                accountNumber: withdrawForm.bankAccountNumber,
                accountName: withdrawForm.bankAccountName
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Permintaan penarikan dana berhasil terkirim dan saldo tertahan sedang diproses oleh admin.');
            setIsWithdrawModalOpen(false);
            setWithdrawForm({ amount: '', bankName: '', bankAccountNumber: '', bankAccountName: '' });
            mutateFinance();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengajukan penarikan');
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChannel) return alert('Pilih metode pembayaran terlebih dahulu');
        if (!depositAmount || Number(depositAmount) < 10000) return alert('Nominal minimal Rp 10.000');
        setDepositLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.post(`${baseUrl}/merchant/finance/deposit`, {
                amount: Number(depositAmount),
                method: selectedChannel.code
            }, { headers: { Authorization: `Bearer ${token}` } });

            setIsDepositModalOpen(false);
            setDepositAmount('');

            if (res.data.checkoutUrl) {
                window.open(res.data.checkoutUrl, '_blank');
                alert('Tagihan berhasil dibuat! Silakan selesaikan pembayaran di halaman Tripay yang terbuka.');
            } else {
                alert('Request topup deposit berhasil dibuat, silakan lakukan pembayaran!');
            }

            mutateFinance();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal membuat deposit request');
        } finally {
            setDepositLoading(false);
        }
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Financial Center</h1>
                    <p className="text-slate-500 text-sm mt-1">Audit saldo, tarik profit, dan monitor kesehatan finansial toko Anda.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={openDepositModal} className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowDownToLine className="w-4 h-4 text-emerald-600" /> Top Up Saldo
                    </button>
                    <button onClick={() => setIsWithdrawModalOpen(true)} className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-2xl shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <ArrowUpToLine className="w-4 h-4" /> Tarik Profit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Card */}
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[35px] p-8 text-white shadow-2xl relative overflow-hidden col-span-1 lg:col-span-2">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Wallet className="w-48 h-48 transform rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 opacity-70 mb-3">
                            <Zap className="w-4 h-4 text-amber-300" />
                            <span className="text-xs font-black tracking-widest uppercase">SALDO SIAP TARIK</span>
                        </div>
                        <h2 className="text-5xl font-black mb-10 tracking-tighter">
                            <span className="text-2xl font-medium mr-1">Rp</span>
                            {Number(financeData?.balance || 0).toLocaleString('id-ID')}
                        </h2>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                            <div>
                                <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Total Penjualan</p>
                                <p className="text-xl font-black leading-none">Rp {Number(financeData?.revenue || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Status Toko</p>
                                <p className="text-lg font-black leading-none flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {merchantPlan} MEMBER
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Widget */}
                <div className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-slate-400 text-xs font-black tracking-widest mb-4">INFO WD TERAKHIR</h3>
                        {financeData?.withdrawals?.[0] ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <p className="text-2xl font-black text-slate-800">Rp {Number(financeData.withdrawals[0].amount).toLocaleString('id-ID')}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${financeData.withdrawals[0].status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                        financeData.withdrawals[0].status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {financeData.withdrawals[0].status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-snug">
                                    Tujuan: <span className="font-bold text-slate-700">{financeData.withdrawals[0].bankName}</span><br />
                                    Rek: <span className="font-mono text-slate-600 font-medium">{financeData.withdrawals[0].bankAccountNumber}</span>
                                </p>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm italic py-4">Belum ada aktivitas penarikan.</p>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-50">
                        <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-colors">
                            Lihat Detail Finance &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {/* History Table (Withdrawal & Deposits) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Deposit History */}
                <div className="bg-white rounded-[30px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
                        <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            Riwayat Isi Saldo
                        </h3>
                    </div>
                    <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-slate-50">
                                {financeData?.deposits?.length === 0 ? (
                                    <tr><td className="p-10 text-center text-slate-300 text-sm italic">Belum ada histori deposit</td></tr>
                                ) : (
                                    financeData?.deposits?.map((d: any) => (
                                        <React.Fragment key={d.id}>
                                            <tr className="hover:bg-slate-50 transition-colors cursor-pointer group text-slate-800">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${d.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-500 group-hover:scale-110' :
                                                            d.status === 'PENDING' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'
                                                            }`}>
                                                            <ArrowDownToLine className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm">Rp {Number(d.amount).toLocaleString('id-ID')}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">{d.method?.replace('TRIPAY_', '')?.replace('_', ' ') || 'MANUAL'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm ${d.status === 'CONFIRMED' ? 'bg-emerald-500 text-white' :
                                                            d.status === 'PENDING' ? 'bg-amber-400 text-white' : 'bg-red-500 text-white'
                                                            }`}>
                                                            {d.status}
                                                        </span>
                                                        {d.status === 'PENDING' && (
                                                            <span className="text-[9px] text-indigo-500 font-black animate-pulse">KLIK INFO BAYAR &darr;</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Show Instructions Inline if PENDING */}
                                            {d.status === 'PENDING' && d.tripayResponse?.instructions && (
                                                <tr>
                                                    <td colSpan={2} className="p-0 border-none">
                                                        <details className="group bg-slate-50/50 text-slate-800">
                                                            <summary className="p-3 text-[11px] font-bold text-slate-500 cursor-pointer list-none flex items-center gap-2 hover:bg-slate-100 transition-colors">
                                                                <HelpCircle className="w-3 h-3 text-indigo-400" /> Lihat Cara Bayar
                                                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded ml-2 font-mono text-indigo-600">{d.tripayVaNumber || 'Kode Bayar'}</span>
                                                                <ChevronDown className="w-3 h-3 ml-auto group-open:rotate-180 transition-transform" />
                                                            </summary>
                                                            <div className="p-4 pt-0 space-y-4 max-h-[300px] overflow-y-auto">
                                                                {d.tripayQrUrl && (
                                                                    <div className="text-center py-2">
                                                                        <img src={d.tripayQrUrl} alt="QR Code" className="w-32 h-32 mx-auto mb-2 bg-white p-2 rounded-xl border" />
                                                                        <p className="text-[10px] text-slate-400 italic">Scan QR di atas</p>
                                                                    </div>
                                                                )}
                                                                {d.tripayResponse.instructions.map((ins: any, i: number) => (
                                                                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-100">
                                                                        <p className="text-[11px] font-black text-slate-800 mb-2 flex items-center gap-2">
                                                                            <span className="w-4 h-4 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px]">{i + 1}</span>
                                                                            {ins.title}
                                                                        </p>
                                                                        <ul className="space-y-2">
                                                                            {ins.steps.map((st: string, si: number) => (
                                                                                <li key={si} className="text-[11px] text-slate-600 list-disc list-inside leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(st)}} />
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ))}
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

                {/* Withdrawal History */}
                <div className="bg-white rounded-[30px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
                        <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                            Riwayat Penarikan Dana
                        </h3>
                    </div>
                    <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50">
                                {financeData?.withdrawals?.length === 0 ? (
                                    <tr><td className="p-10 text-center text-slate-300 text-sm italic">Belum ada request penarikan</td></tr>
                                ) : (
                                    financeData?.withdrawals?.map((w: any) => (
                                        <tr key={w.id} className="hover:bg-slate-50 transition-all text-slate-800">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${w.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500' :
                                                        w.status === 'PENDING' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'
                                                        }`}>
                                                        <ArrowUpToLine className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-sm">Rp {Number(w.amount).toLocaleString('id-ID')}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ke: {w.bankName} • {w.bankAccountNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${w.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                        w.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {w.status}
                                                    </span>
                                                    <p className="text-[9px] text-slate-400 font-medium">{new Date(w.createdAt).toLocaleDateString()} • {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals Section */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden relative max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10 text-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ArrowUpToLine className="w-5 h-5 text-indigo-600" /> Tarik Dana Penjualan
                            </h3>
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
                        </div>

                        <form onSubmit={handleWithdraw} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-3">Pilih Mode Pencairan:</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setWithdrawType('MANUAL')}
                                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${withdrawType === 'MANUAL' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${withdrawType === 'MANUAL' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                                {withdrawType === 'MANUAL' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-[13px]">Manual Transfer</h4>
                                        <p className="text-slate-500 text-[11px] mt-1 leading-snug">Diproses oleh admin max 1x24 jam kerja. Bebas biaya layanan.</p>
                                    </div>

                                    <div
                                        onClick={() => {
                                            if (merchantPlan === 'SUPREME') setWithdrawType('INSTANT');
                                        }}
                                        className={`border-2 rounded-2xl p-4 transition-all relative ${merchantPlan !== 'SUPREME' ? 'border-red-200 bg-red-50/30 cursor-not-allowed opacity-80' : withdrawType === 'INSTANT' ? 'border-amber-500 bg-amber-50/50 cursor-pointer' : 'border-slate-200 hover:border-amber-300 cursor-pointer'}`}
                                    >
                                        {merchantPlan !== 'SUPREME' && (
                                            <div className="absolute top-3 right-3 text-red-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-[13px] flex items-center gap-1">Instan API <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded leading-none">VIP</span></h4>
                                        <p className={`text-[11px] mt-1 leading-snug ${merchantPlan !== 'SUPREME' ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                                            {merchantPlan !== 'SUPREME' ? 'Eksklusif tier SUPREME. Upgrade tier Anda.' : 'Otomatis cair ke rekening detik ini juga via API Bank.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nominal Penarikan (Rp)</label>
                                    <input type="number" required min="10000" placeholder="50000" value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-bold text-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Bank Tujuan</label>
                                        <input type="text" required placeholder="BCA / Mandiri / BNI" value={withdrawForm.bankName} onChange={e => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Rekening</label>
                                        <input type="text" required placeholder="1234567890" value={withdrawForm.bankAccountNumber} onChange={e => setWithdrawForm({ ...withdrawForm, bankAccountNumber: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pemilik Rekening</label>
                                        <input type="text" required placeholder="A.n John Doe" value={withdrawForm.bankAccountName} onChange={e => setWithdrawForm({ ...withdrawForm, bankAccountName: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 flex justify-center items-center gap-2 ${withdrawType === 'INSTANT' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                {withdrawType === 'INSTANT' ? <><Zap className="w-4 h-4" /> Tarik Sekarang (Instan)</> : <><Clock className="w-4 h-4" /> Ajukan Penarikan Manual</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isDepositModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                                <ArrowDownToLine className="w-5 h-5 text-emerald-600" /> Isi Saldo via Tripay
                            </h3>
                            <button onClick={() => setIsDepositModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">&times;</button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={handleDeposit} className="p-6 space-y-5">
                                {/* Amount Input */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Nominal Top Up (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">Rp</span>
                                        <input
                                            type="number"
                                            required
                                            min="10000"
                                            placeholder="100.000"
                                            value={depositAmount}
                                            onChange={e => setDepositAmount(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-emerald-500 font-bold text-xl transition-colors bg-slate-50 focus:bg-white text-slate-800"
                                        />
                                    </div>
                                    {/* Quick amount pills */}
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {[50000, 100000, 200000, 500000].map(amt => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setDepositAmount(String(amt))}
                                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${depositAmount === String(amt) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                {amt.toLocaleString('id-ID')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Metode Pembayaran</label>
                                    {channelsLoading ? (
                                        <div className="flex items-center justify-center py-8 text-slate-400">
                                            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span className="text-sm font-medium">Memuat metode pembayaran...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {Object.entries(
                                                paymentChannels.reduce((groups: any, ch: any) => {
                                                    const g = ch.group || 'Lainnya';
                                                    if (!groups[g]) groups[g] = [];
                                                    groups[g].push(ch);
                                                    return groups;
                                                }, {})
                                            ).map(([group, channels]: any) => (
                                                <div key={group}>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 mt-2">{group}</p>
                                                    <div className="space-y-1.5">
                                                        {channels.map((ch: any) => {
                                                            const feeInfo = ch.fee_flat > 0
                                                                ? `+Rp${ch.fee_flat.toLocaleString('id-ID')}`
                                                                : ch.fee_percent > 0
                                                                    ? `+${ch.fee_percent}%`
                                                                    : 'Gratis';
                                                            return (
                                                                <button
                                                                    key={ch.code}
                                                                    type="button"
                                                                    onClick={() => setSelectedChannel(ch)}
                                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${selectedChannel?.code === ch.code
                                                                        ? 'border-emerald-500 bg-emerald-50'
                                                                        : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {ch.icon_url ? (
                                                                            <img src={ch.icon_url} alt={ch.name} className="w-8 h-8 object-contain rounded-lg" />
                                                                        ) : (
                                                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                                                <CreditCard className="w-4 h-4 text-slate-400" />
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-800 leading-none">{ch.name}</p>
                                                                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{ch.code}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${feeInfo === 'Gratis' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                                            {feeInfo}
                                                                        </span>
                                                                        {selectedChannel?.code === ch.code && (
                                                                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Summary */}
                                {selectedChannel && depositAmount && Number(depositAmount) >= 10000 && (
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm text-slate-800">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-500">Nominal Top Up</span>
                                            <span className="font-bold text-slate-800">Rp {Number(depositAmount).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-slate-500">Biaya Layanan ({selectedChannel.name})</span>
                                            <span className="font-bold text-orange-600">
                                                {selectedChannel.fee_flat > 0
                                                    ? `Rp ${selectedChannel.fee_flat.toLocaleString('id-ID')}`
                                                    : selectedChannel.fee_percent > 0
                                                        ? `Rp ${Math.ceil(Number(depositAmount) * selectedChannel.fee_percent / 100).toLocaleString('id-ID')}`
                                                        : 'Gratis'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-slate-200">
                                            <span className="font-bold text-slate-700">Total Bayar</span>
                                            <span className="font-black text-emerald-700 text-base">
                                                Rp {(Number(depositAmount) + (selectedChannel.fee_flat || Math.ceil(Number(depositAmount) * (selectedChannel.fee_percent || 0) / 100))).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 text-center">*Saldo yang dikreditkan: Rp {Number(depositAmount).toLocaleString('id-ID')}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setIsDepositModalOpen(false)} className="flex-1 py-3.5 text-slate-600 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={depositLoading || !selectedChannel || !depositAmount || Number(depositAmount) < 10000}
                                        className="flex-1 py-3.5 text-white font-bold bg-emerald-500 rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                                    >
                                        {depositLoading ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Memproses...</>
                                        ) : (
                                            <><ArrowDownToLine className="w-4 h-4" /> Buat Tagihan Sekarang</>
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
