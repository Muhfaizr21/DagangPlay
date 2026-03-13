"use client";
import React, { useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    TrendingUp,
    Users,
    Receipt,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PackageSearch,
    Clock,
    AlertTriangle,
    Crown
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantDashboard() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: dashboard, error, isLoading } = useSWR(`${baseUrl}/merchant/dashboard`, fetcher);

    if (isLoading) {
        return (
            <MerchantLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            </MerchantLayout>
        );
    }

    if (error || !dashboard) {
        return (
            <MerchantLayout>
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
                    <p className="font-bold">Gagal memuat data Dashboard.</p>
                    <p className="text-sm mt-1">{error?.response?.data?.message || 'Koneksi ke server bermasalah.'}</p>
                </div>
            </MerchantLayout>
        );
    }

    const { merchant, revenue, profit, transactionsToday, users, recentOrders, topCustomers, alerts, chartData } = dashboard;

    const stats = [
        { title: 'Total Omset (Bln Ini)', value: `Rp ${(revenue?.month || 0).toLocaleString('id-ID')}`, trend: `${(revenue?.trendPercentage || 0) > 0 ? '+' : ''}${(revenue?.trendPercentage || 0).toFixed(1)}%`, isPositive: (revenue?.trendPercentage || 0) >= 0, icon: Wallet, color: 'text-slate-900', bg: 'bg-slate-50 text-slate-500' },
        { title: 'Laba Bersih (Bln Ini)', value: `Rp ${(profit?.month || 0).toLocaleString('id-ID')}`, trend: `${(profit?.trendPercentage || 0) > 0 ? '+' : ''}${(profit?.trendPercentage || 0).toFixed(1)}%`, isPositive: (profit?.trendPercentage || 0) >= 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-500' },
        { title: 'Trx Hari Ini (Sukses)', value: (transactionsToday?.success || 0).toLocaleString('id-ID'), trend: `${transactionsToday?.failed || 0} Gagal`, isPositive: (transactionsToday?.failed || 0) === 0, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50 text-amber-500' },
        { title: 'Laba Bersih Hari Ini', value: `Rp ${(profit?.today || 0).toLocaleString('id-ID')}`, trend: '', isPositive: true, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50 text-indigo-500' },
    ];

    // Find max value for chart scaling
    const maxChartValue = Math.max(...(chartData || []).map((d: any) => d.revenue), 100000);

    return (
        <MerchantLayout>
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performa Toko</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-[14px] text-slate-500 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Pantau kinerja toko <span className="font-bold text-slate-700">{merchant.name}</span> secara real-time.
                        </p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase tracking-widest flex items-center gap-1">
                            <Crown className="w-3 h-3" /> {merchant.plan} Plan
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-[13px] rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
                        Download Laporan
                    </button>
                </div>
            </div>

            {alerts && alerts.length > 0 && (
                <div className="mb-6 flex flex-col gap-2">
                    {alerts.map((al: string, i: number) => (
                        <div key={i} className="px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            {al}
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {stat.trend && (
                                    <span className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {stat.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.title}</h3>
                            <p className={`text-2xl font-black mt-3 tracking-tight ${stat.color}`}>{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-[16px] font-bold text-slate-800 tracking-tight">Analisa Laba & Omset (30 Hari)</h3>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Omset</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laba</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-1 rounded-xl flex gap-1">
                             <button className="px-3 py-1.5 text-[11px] font-bold bg-white text-slate-800 rounded-lg shadow-sm">30D</button>
                             <button className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600">7D</button>
                        </div>
                    </div>
                    <div className="flex-1 p-6 relative min-h-[300px] flex items-end justify-center">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                        <div className="relative w-full h-48 flex items-end justify-between px-2 gap-1.5 opacity-90 overflow-hidden">
                            {(chartData || []).map((d: any, i: number) => {
                                const revH = Math.max((d.revenue / maxChartValue) * 100, 2); 
                                const profH = Math.max((d.profit / maxChartValue) * 100, 4);
                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group relative">
                                        <div className="w-full bg-indigo-500/80 rounded-t-[2px] hover:bg-indigo-500 transition-all cursor-pointer" style={{ height: `${revH}%` }}></div>
                                        <div className="w-full bg-emerald-500/80 rounded-t-[2px] hover:bg-emerald-500 transition-all cursor-pointer" style={{ height: `${profH}%` }}></div>
                                        
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white text-[10px] p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10 whitespace-nowrap shadow-xl border border-white/10">
                                            <p className="font-black text-indigo-300 mb-1">{new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                            <p className="flex justify-between gap-4"><span>Omset:</span> <span className="font-bold">Rp {d.revenue.toLocaleString()}</span></p>
                                            <p className="flex justify-between gap-4"><span>Laba:</span> <span className="font-bold text-emerald-400">Rp {d.profit.toLocaleString()}</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions list */}
                <div className="col-span-1 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col">
                    <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-slate-800">Transaksi Terbaru</h3>
                        <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 p-2">
                        {(!recentOrders || recentOrders.length === 0) ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium py-10">Belum ada transaksi</div>
                        ) : (
                            <div className="space-y-1">
                                {recentOrders.map((order: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 ${order.status === 'PAID' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                                            order.status === 'PENDING' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                                'bg-gradient-to-br from-red-400 to-rose-500'
                                            }`}>
                                            {order.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{order.productName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[11px] font-bold text-slate-500 truncate">{order.customerName}</p>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-slate-800">Rp {Number(order.amount).toLocaleString('id-ID')}</p>
                                            <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${order.status === 'PAID' ? 'text-emerald-500' :
                                                order.status === 'PENDING' ? 'text-amber-500' :
                                                    'text-red-500'
                                                }`}>{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100/50">
                        <button className="w-full py-2.5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors">
                            Lihat Semua Transaksi →
                        </button>
                    </div>
                </div>

                {/* Top Customers Table */}
                <div className="col-span-1 lg:col-span-3 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col mb-10 overflow-hidden">
                    <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-slate-800">Top Pelanggan Bulan Ini</h3>
                        <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Peringkat & Nama</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Total Transaksi</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Volume Omset</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(!topCustomers || topCustomers.length === 0) ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-medium text-sm">Belum ada data pelanggan</td>
                                    </tr>
                                ) : topCustomers.map((r: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                                    i === 1 ? 'bg-slate-200 text-slate-600' :
                                                        i === 2 ? 'bg-orange-100 text-orange-600' :
                                                            'bg-indigo-50 text-indigo-500'
                                                    }`}>
                                                    #{i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{r.name}</p>
                                                    <p className="text-[11px] text-slate-500">{r.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{r.totalOrders} Pesanan</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">Rp {Number(r.totalSpent).toLocaleString('id-ID')}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
