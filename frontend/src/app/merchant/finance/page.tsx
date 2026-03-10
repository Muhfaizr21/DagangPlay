"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpToLine, Gift, RefreshCcw, Lock, Zap, Clock, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantFinancePage() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: financeData, mutate: mutateFinance } = useSWR(`${baseUrl}/merchant/finance`, fetcher, { refreshInterval: 10000 });

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', bankName: '', bankAccountNumber: '', bankAccountName: '' });
    const [withdrawType, setWithdrawType] = useState('MANUAL'); // MANUAL or INSTANT

    const [merchantPlan, setMerchantPlan] = useState('PRO');

    React.useEffect(() => {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setMerchantPlan(parsed.plan || 'PRO');
        }
    }, []);

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [depositForm, setDepositForm] = useState({ amount: '', method: 'BANK_TRANSFER', provider: 'MANUAL' });

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
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.post(`${baseUrl}/merchant/finance/deposit`, {
                ...depositForm, amount: Number(depositForm.amount)
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.checkoutUrl) {
                window.open(res.data.checkoutUrl, '_blank');
                alert('Silakan selesaikan pembayaran Isi Saldo Anda di halaman Tripay yang terbuka.');
            } else {
                alert('Request topup deposit berhasil dibuat, silakan lakukan pembayaran!');
            }

            setIsDepositModalOpen(false);
            setDepositForm({ amount: '', method: 'BANK_TRANSFER', provider: 'MANUAL' });
            mutateFinance();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal membuat deposit request');
        }
    };

    return (
        <MerchantLayout title="Keuangan & Saldo">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Financial Center</h1>
                    <p className="text-slate-500 text-sm mt-1">Audit saldo, tarik profit, dan monitor kesehatan finansial toko Anda.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => setIsDepositModalOpen(true)} className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Deposit History */}
                <div className="bg-white rounded-[30px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
                        <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            Riwayat Isi Saldo
                        </h3>
                    </div>
                    <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50">
                                {financeData?.deposits?.length === 0 ? (
                                    <tr><td className="p-10 text-center text-slate-300 text-sm italic">Belum ada histori deposit</td></tr>
                                ) : (
                                    financeData?.deposits?.map((d: any) => (
                                        <React.Fragment key={d.id}>
                                            <tr className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${d.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-500 group-hover:scale-110' :
                                                                d.status === 'PENDING' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'
                                                            }`}>
                                                            <ArrowDownToLine className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm">Rp {Number(d.amount).toLocaleString('id-ID')}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">{d.method.replace('TRIPAY_', '').replace('_', ' ')}</p>
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
                                            {/* ... instructions code same ... */}
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
                                        <tr key={w.id} className="hover:bg-slate-50 transition-all">
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
            {/* Show Instructions Inline if PENDING */}
            {d.status === 'PENDING' && d.tripayResponse?.instructions && (
                <tr>
                    <td colSpan={3} className="p-0">
                        <details className="group bg-slate-50/50">
                            <summary className="p-3 text-[11px] font-bold text-slate-500 cursor-pointer list-none flex items-center gap-2 hover:bg-slate-100 transition-colors">
                                <HelpCircle className="w-3 h-3 text-indigo-400" /> Lihat Cara Bayar
                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded ml-2 font-mono text-indigo-600">{d.tripayVaNumber || 'Kode Bayar'}</span>
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
                                                <li key={si} className="text-[11px] text-slate-600 list-disc list-inside leading-relaxed" dangerouslySetInnerHTML={{ __html: st }} />
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
                                )
}
                            </tbody >
                        </table >
                    </div >
                </div >

    {/* Withdrawal History */ }
    < div className = "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" >
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Riwayat Penarikan Dana</h3>
                    </div>
                    <div className="p-0 max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-100">
                                {financeData?.withdrawals?.length === 0 ? (
                                    <tr><td className="p-6 text-center text-slate-400 text-sm">Belum ada penarikan</td></tr>
                                ) : (
                                    financeData?.withdrawals?.map((w: any) => (
                                        <tr key={w.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <p className="font-bold text-sm text-slate-700">Rp {Number(w.amount).toLocaleString('id-ID')}</p>
                                                <p className="text-xs text-indigo-600 mt-1">{w.bankName} - {w.bankAccountNumber}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${w.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                    w.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div >
            </div >

    {/* Modals Here... */ }
{
    isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden relative max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ArrowUpToLine className="w-5 h-5 text-indigo-600" /> Tarik Dana Penjualan
                    </h3>
                    <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
                </div>

                <form onSubmit={handleWithdraw} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Pilih Mode Pencairan:</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Manual Withdrawal (Available for all) */}
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

                            {/* Instant Withdrawal (SUPREME Only) */}
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
                                {merchantPlan === 'SUPREME' && (
                                    <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center ${withdrawType === 'INSTANT' ? 'border-amber-600' : 'border-slate-300'}`}>
                                        {withdrawType === 'INSTANT' && <div className="w-2 h-2 rounded-full bg-amber-600"></div>}
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

                    <div className="space-y-4 mb-8 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
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
    )
}

{
    isDepositModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative">
                <div className="p-5 border-b border-slate-100 bg-emerald-50/50">
                    <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                        <ArrowDownToLine className="w-5 h-5 text-emerald-600" /> Isi Saldo Merchant
                    </h3>
                </div>
                <form onSubmit={handleDeposit} className="p-6">
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nominal Topup (Rp)</label>
                            <input type="number" required min="10000" placeholder="100000" value={depositForm.amount} onChange={e => setDepositForm({ ...depositForm, amount: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Metode Pembayaran</label>
                            <select value={depositForm.method} onChange={e => setDepositForm({ ...depositForm, method: e.target.value })} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-emerald-500">
                                <option value="BANK_TRANSFER">Transfer Bank</option>
                                <option value="EWALLET">E-Wallet</option>
                                <option value="QRIS">QRIS</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsDepositModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                        <button type="submit" className="flex-1 py-3 text-white font-bold bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors">Buat Tagihan</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
        </MerchantLayout >
    );
}
