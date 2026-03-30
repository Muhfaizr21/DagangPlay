"use client";
import React from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Download,
    TrendingUp,
    TrendingDown,
    Store,
    ReceiptText,
    Wallet,
    ArrowRight,
    Activity,
    ChevronDown,
    Loader2,
    ShieldAlert,
    AlertCircle,
    UserCheck,
    Clock,
    CreditCard,
    ArrowUpRight
} from 'lucide-react';

const fetcher = async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/admin/login';
        }
        throw error;
    }
};

export default function AdminDashboardPage() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data, error, isLoading } = useSWR(`${baseUrl}/admin/dashboard/summary`, fetcher, {
        refreshInterval: 30000 // auto-refresh every 30s
    });

    return (
        <AdminLayout>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Selamat Datang, <span className="text-indigo-600">Super Admin</span></h1>
                    <p className="text-[14px] text-slate-500 mt-1">Ringkasan performa platform DagangPlay real-time.</p>
                </div>
                <div className="hidden md:flex gap-3">
                    <button className="h-[38px] px-4 inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer">
                        <Download className="w-4 h-4" />
                        Download Laporan
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                    <p className="text-sm font-medium text-slate-500">Memuat data analytic real-time...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
                    Gagal mengambil data dari server. Pastikan backend (API) berjalan di port 3001.
                </div>
            )}

            {data && !isLoading && (
                <>
                    {/* FINANCIAL COMMAND CENTER BAR */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Digiflazz Status */}
                        <div className={`col-span-1 md:col-span-2 p-4 rounded-2xl border flex items-center justify-between transition-all ${data.systemHealth?.isLow ? 'bg-red-50 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-slate-50 border-slate-100'
                            }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.systemHealth?.isLow ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
                                    }`}>
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Saldo Digiflazz</h4>
                                    <p className={`text-xl font-black ${data.systemHealth?.isLow ? 'text-red-700' : 'text-slate-800'}`}>
                                        Rp {Number(data.systemHealth?.supplierBalance || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${data.systemHealth?.isLow ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {data.systemHealth?.isLow ? 'REFILL REQUIRED' : 'HEALTHY'}
                                </span>
                            </div>
                        </div>

                        {/* Escrow Balance */}
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Escrow</h4>
                                <p className="text-lg font-black text-slate-800">Rp {Number(data.systemHealth?.totalEscrow || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        {/* SaaS Revenue */}
                        <div className="bg-indigo-600 p-4 rounded-2xl flex items-center gap-4 text-white shadow-lg overflow-hidden relative">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div className="flex-1 relative z-10">
                                <h4 className="text-[10px] font-black opacity-70 uppercase tracking-widest">SaaS Revenue</h4>
                                <p className="text-lg font-black leading-tight">Rp {Number(data.systemHealth?.totalSaasRevenue || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <Activity className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10 text-white" />
                        </div>
                    </div>

                    {/* Main Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {data.stats.map((stat: any, i: number) => {
                            const icons = [Wallet, Store, ReceiptText, Activity];
                            const colors = ["text-indigo-600", "text-emerald-600", "text-blue-600", "text-amber-500"];
                            const bgs = ["bg-indigo-50", "bg-emerald-50", "bg-blue-50", "bg-amber-50"];
                            const Icon = icons[i % icons.length];

                            return (
                                <div key={i} className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-200/60 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-lg ${bgs[i]}`}>
                                            <Icon className={`w-5 h-5 ${colors[i]}`} strokeWidth={2} />
                                        </div>
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* UNIFIED DISPUTE CENTER */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-500" />
                                    <h3 className="font-bold text-slate-800">Pusat Sengketa (Dispute)</h3>
                                    <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        {data.disputes?.pending?.length || 0} Open Cases
                                    </span>
                                </div>
                                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
                            </div>
                            <div className="flex-1 overflow-auto max-h-[400px]">
                                {data.disputes?.pending?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 opacity-40">
                                        <UserCheck className="w-10 h-10 mb-2" />
                                        <p className="text-sm font-medium">Semua Pesanan Lancar Jaya</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3">Order No</th>
                                                <th className="px-6 py-3">Alasan / Issue</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.disputes.pending.map((dispute: any) => (
                                                <tr key={dispute.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{dispute.order.orderNumber}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-[13px] text-slate-800 font-medium line-clamp-1">{dispute.reason}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/50 uppercase">
                                                            <Clock className="w-3 h-3" /> OPEN
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-indigo-600 font-bold hover:underline text-xs">Handle</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* MERCHANT HEALTH MONITOR */}
                        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-indigo-500" />
                                    <h3 className="font-bold text-slate-800">Merchant Expiring</h3>
                                </div>
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">7 Days</span>
                            </div>
                            <div className="p-2 space-y-2 flex-1 overflow-auto max-h-[400px]">
                                {data.merchants?.expiring?.length === 0 ? (
                                    <p className="text-center py-10 text-slate-400 text-xs font-medium italic">Tidak ada merchant expiring minggu ini.</p>
                                ) : (
                                    data.merchants.expiring.map((merchant: any) => (
                                        <div key={merchant.id} className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 leading-tight">{merchant.name}</h4>
                                                <p className="text-[11px] text-red-500 font-medium mt-0.5">
                                                    Expires: {new Date(merchant.planExpiredAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 mt-auto">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Top Performance Merchant</h4>
                                <div className="space-y-3">
                                    {data.merchants.top.map((m: any, i: number) => (
                                        <div key={m.id} className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center text-slate-500 border border-slate-200">
                                                    {i + 1}
                                                </div>
                                                <span className="text-[13px] font-semibold text-slate-700">{m.name}</span>
                                            </div>
                                            <span className="text-[12px] font-mono font-bold text-slate-400">{m.orders} Trx</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* REVENUE ANALYTICS */}
                        <div className="lg:col-span-2 bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-6 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg text-slate-800">Analisa Pendapatan</h3>
                                <div className="relative">
                                    <select className="appearance-none bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer transition-colors">
                                        <option>Minggu Ini</option>
                                        <option>Bulan Ini</option>
                                        <option>Tahun Ini</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="h-[280px] flex items-end gap-[10%] justify-between mt-8 border-b border-slate-100 pb-6 pt-2">
                                {data.weeklyChart.map((item: any, i: number) => (
                                    <div key={i} className="flex-1 w-full max-w-[48px] flex flex-col justify-end group cursor-pointer relative h-full">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-20">
                                            Rp {item.value} JT
                                        </div>
                                        <div className="w-full rounded-t-md bg-indigo-50 group-hover:bg-indigo-500 transition-colors duration-300" style={{ height: `${Math.max(5, item.value)}%` }}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between flex-wrap text-[12px] font-medium text-slate-400 mt-4 px-1">
                                <span>Senin</span><span>Selasa</span><span>Rabu</span><span>Kamis</span><span>Jumat</span><span>Sabtu</span><span>Minggu</span>
                            </div>
                        </div>

                        {/* RECENT TRANSACTIONS */}
                        <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-6 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg text-slate-800">Transaksi Terbaru</h3>
                                <button className="text-indigo-600 font-medium text-[13px] hover:text-indigo-700 hover:underline underline-offset-4 inline-flex items-center gap-1 transition-colors">
                                    Semua <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-4 flex-1">
                                {data.recentTransactions.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center mt-10 italic">Belum ada aktivitas.</p>
                                )}
                                {data.recentTransactions.map((trx: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center group cursor-pointer border-b border-transparent hover:border-slate-100 pb-2 transition-all">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-slate-800 text-[14px] font-bold group-hover:text-indigo-600 transition-colors leading-tight">{trx.game}</p>
                                            <p className="text-slate-400 text-[11px] font-mono tracking-tight uppercase">{trx.id}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-slate-800 text-[14px] font-bold leading-tight">Rp {Number(trx.amount).toLocaleString('id-ID')}</p>
                                            <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-[9px] font-black tracking-widest uppercase 
                                                ${trx.status === 'SUCCESS' ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60' :
                                                                                    trx.status === 'PENDING' || trx.status === 'PROCESSING' ? 'text-amber-700 bg-amber-50 border-amber-200/60' :
                                                                                        'text-red-700 bg-red-50 border-red-200/60'}`}
                                                                            >
                                                {trx.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
