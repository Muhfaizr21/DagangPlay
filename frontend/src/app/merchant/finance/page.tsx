"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpToLine, Gift, RefreshCcw } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantFinancePage() {
    const { data: financeData, mutate: mutateFinance } = useSWR('http://localhost:3001/merchant/finance', fetcher, { refreshInterval: 10000 });
    const { data: commissionData, mutate: mutateCommission } = useSWR('http://localhost:3001/merchant/commissions', fetcher, { refreshInterval: 10000 });

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', bankName: '', bankAccountNumber: '', bankAccountName: '' });

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [depositForm, setDepositForm] = useState({ amount: '', method: 'BANK_TRANSFER', provider: 'MANUAL' });

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://localhost:3001/merchant/finance/withdraw', {
                ...withdrawForm, amount: Number(withdrawForm.amount)
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Permintaan penarikan dana berhasil dikirim!');
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
            await axios.post('http://localhost:3001/merchant/finance/deposit', {
                ...depositForm, amount: Number(depositForm.amount)
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Request topup deposit berhasil dibuat, silakan lakukan pembayaran!');
            setIsDepositModalOpen(false);
            setDepositForm({ amount: '', method: 'BANK_TRANSFER', provider: 'MANUAL' });
            mutateFinance();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal membuat deposit request');
        }
    };

    const handleSettleCommissions = async (resellerId?: string) => {
        if (!confirm('Anda yakin ingin mencairkan komisi ini? Dana akan masuk ke saldo reseller.')) return;
        try {
            const token = localStorage.getItem('admin_token');
            const url = resellerId ? `http://localhost:3001/merchant/commissions/settle/${resellerId}` : `http://localhost:3001/merchant/commissions/settle`;
            await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert('Komisi berhasil dicairkan!');
            mutateCommission();
            mutateFinance();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mencairkan komisi');
        }
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Keuangan & Saldo</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola pendapatan, deposit, penarikan, dan komisi reseller.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => setIsDepositModalOpen(true)} className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowDownToLine className="w-4 h-4 text-emerald-600" /> Isi Saldo
                    </button>
                    <button onClick={() => setIsWithdrawModalOpen(true)} className="flex-1 md:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <ArrowUpToLine className="w-4 h-4" /> Tarik Dana
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Revenue Overview */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <CreditCard className="w-32 h-32 transform rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 opacity-80 mb-2">
                            <Wallet className="w-4 h-4" />
                            <span className="text-sm font-bold tracking-wider">TOTAL PENDAPATAN TOKO</span>
                        </div>
                        <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Rp {Number(financeData?.balance || 0).toLocaleString('id-ID')}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                                <p className="text-xs font-semibold opacity-70 mb-1">Total Withdrawal</p>
                                <p className="text-lg font-bold">...</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                                <p className="text-xs font-semibold opacity-70 mb-1">Perkiraan Bulan Ini</p>
                                <p className="text-lg font-bold">...</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commissions Overview */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Total Komisi Reseller Pending</h3>
                                <p className="text-xs text-slate-500">Komisi belum dicairkan ke saldo reseller</p>
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-6 tracking-tight">Rp {Number(commissionData?.totalPending || 0).toLocaleString('id-ID')}</h2>
                    </div>
                    <button onClick={() => handleSettleCommissions()} className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4 text-orange-500" /> Cairkan Semua Komisi
                    </button>
                </div>
            </div>

            {/* List Reseller Commissions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Daftar Komisi Pending Reseller</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase">Reseller</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase">Total Transaksi</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase text-right">Nominal Komisi</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {commissionData?.resellerCommissions?.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Tidak ada komisi tertunda</td></tr>
                            ) : (
                                commissionData?.resellerCommissions?.map((rc: any) => (
                                    <tr key={rc.userId} className="hover:bg-slate-50/50">
                                        <td className="p-4">
                                            <p className="font-bold text-sm text-slate-700">{rc.name}</p>
                                            <p className="text-xs text-slate-500">{rc.email}</p>
                                        </td>
                                        <td className="p-4" align="center">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">{rc.totalOrders} Transaksi</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <p className="font-bold text-sm text-emerald-600">Rp {Number(rc.totalPendingAmount).toLocaleString('id-ID')}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleSettleCommissions(rc.userId)} className="text-xs font-bold px-3 py-1.5 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors">
                                                Cairkan Reseller Ini
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* History Table (Withdrawal & Deposits) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deposit History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Riwayat Deposit (Isi Saldo)</h3>
                    </div>
                    <div className="p-0 max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-100">
                                {financeData?.deposits?.length === 0 ? (
                                    <tr><td className="p-6 text-center text-slate-400 text-sm">Belum ada deposit</td></tr>
                                ) : (
                                    financeData?.deposits?.map((d: any) => (
                                        <tr key={d.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <p className="font-bold text-sm text-slate-700">Rp {Number(d.amount).toLocaleString('id-ID')}</p>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${d.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                                                        d.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Withdrawal History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                </div>
            </div>

            {/* Modals Here... */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <ArrowUpToLine className="w-5 h-5 text-indigo-600" /> Tarik Dana (Withdraw)
                            </h3>
                        </div>
                        <form onSubmit={handleWithdraw} className="p-6">
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nominal Penarikan (Rp)</label>
                                    <input type="number" required min="10000" placeholder="50000" value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Bank Asal</label>
                                    <input type="text" required placeholder="BCA / Mandiri / BNI" value={withdrawForm.bankName} onChange={e => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Rekening</label>
                                    <input type="text" required placeholder="1234567890" value={withdrawForm.bankAccountNumber} onChange={e => setWithdrawForm({ ...withdrawForm, bankAccountNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pemilik Rekening</label>
                                    <input type="text" required placeholder="A.n John Doe" value={withdrawForm.bankAccountName} onChange={e => setWithdrawForm({ ...withdrawForm, bankAccountName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                                <button type="submit" className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">Ajukan Tari</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDepositModalOpen && (
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
            )}
        </MerchantLayout>
    );
}
