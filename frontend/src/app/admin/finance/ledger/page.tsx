"use client";
import { getApiUrl } from '@/lib/api';
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Wallet,
    ArrowDownToLine,
    ArrowUpRight,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Download,
    Loader2
} from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function LedgerDashboardPage() {
    const baseUrl = getApiUrl();
    
    const { data: globalLedger, error, isLoading } = useSWR(`${baseUrl}/saas/admin/ledger/escrow`, fetcher);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (error || !globalLedger) {
        return (
            <AdminLayout>
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
                    Gagal memuat data Master Ledger.
                </div>
            </AdminLayout>
        );
    }
    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Sistem Two-Ledger: Realtime monitor dana mengendap (Escrow) vs Dana Tersedia (Available).</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[40px] px-5 inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl text-[13px] font-semibold transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                        Rekonsiliasi (Upload CSV)
                    </button>
                    <button className="h-[40px] px-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-semibold transition-all shadow-md shadow-indigo-200">
                        <ArrowUpRight className="w-4 h-4" />
                        Approve Bulk Payout
                    </button>
                </div>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Escrow Balance */}
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Clock className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest">Escrow / Pending Ledger</h3>
                            <p className="text-xs text-amber-700 font-medium">Tertahan di Payment Gateway</p>
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-amber-900 mt-6 tracking-tight">Rp {Number(globalLedger.totalEscrow || 0).toLocaleString('id-ID')}</h2>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-200/40 w-max px-3 py-1.5 rounded-lg border border-amber-300/30">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Estimasi Cair: Hari Ini 15:00 WIB (Rp 12.5M)
                    </div>
                </div>

                {/* Available Balance */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <CheckCircle2 className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Available Ledger</h3>
                            <p className="text-xs text-emerald-700 font-medium">Dana Bersih Merchant (Siap Tarik)</p>
                        </div>
                    </div>
                    <h2 className="text-4xl font-black text-emerald-900 mt-6 tracking-tight">Rp {Number(globalLedger.totalAvailable || 0).toLocaleString('id-ID')}</h2>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-200/40 w-max px-3 py-1.5 rounded-lg border border-emerald-300/30">
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        32 Merchant meminta Payout (Rp 8.5M)
                    </div>
                </div>
            </div>

            {/* Reconciliation Dispute List */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Settlement Disputes & Webhook Fails</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Transaksi sukses di sistem tapi gagal dicairkan oleh Gateway.</p>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari ID Trx..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100">
                                <th className="p-4 pl-6">ID Transaksi / Gateway</th>
                                <th className="p-4">Merchant</th>
                                <th className="p-4">Sistem Internal</th>
                                <th className="p-4">Data Gateway</th>
                                <th className="p-4">Selisih</th>
                                <th className="p-4 pr-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="font-mono text-xs text-indigo-600">TRX-0992381-AA</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">Tripay - QRIS</div>
                                </td>
                                <td className="p-4">TokoDewa</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        LUNAS (Rp 150.000)
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                        TIDAK DITEMUKAN
                                    </span>
                                </td>
                                <td className="p-4 text-red-600 font-bold">- Rp 150.000</td>
                                <td className="p-4 pr-6 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                        Investigasi
                                    </button>
                                </td>
                            </tr>
                            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="font-mono text-xs text-indigo-600">TRX-8231238-BB</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">Midtrans - VA BCA</div>
                                </td>
                                <td className="p-4">JuraganVoucher</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        LUNAS (Rp 50.000)
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded">
                                        EXPIRED (Rp 50.000)
                                    </span>
                                </td>
                                <td className="p-4 text-rose-600 font-bold">Status Beda</td>
                                <td className="p-4 pr-6 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                        Investigasi
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
