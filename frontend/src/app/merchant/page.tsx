"use client";
import React from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    TrendingUp, Receipt, Activity, ArrowUpRight, ArrowDownRight,
    Wallet, Clock, AlertTriangle, Crown, ShoppingCart, Package
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

function StatCard({ title, value, trend, isPositive, icon: Icon, accent }: any) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{value}</p>
        </div>
    );
}

export default function MerchantDashboard() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: dashboard, error, isLoading } = useSWR(`${baseUrl}/merchant/dashboard`, fetcher, { refreshInterval: 30000 });

    if (isLoading) {
        return (
            <MerchantLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                </div>
            </MerchantLayout>
        );
    }

    if (error || !dashboard) {
        return (
            <MerchantLayout>
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-600">
                    <p className="font-semibold">Gagal memuat data Dashboard</p>
                    <p className="text-sm mt-1 text-red-400">{error?.response?.data?.message || 'Koneksi ke server bermasalah.'}</p>
                </div>
            </MerchantLayout>
        );
    }

    const { merchant, revenue, profit, transactionsToday, recentOrders, topCustomers, alerts, chartData } = dashboard;
    const maxChartValue = Math.max(...(chartData || []).map((d: any) => d.revenue), 100000);

    const stats = [
        { title: 'Omset Bulan Ini', value: `Rp ${(revenue?.month || 0).toLocaleString('id-ID')}`, trend: `${(revenue?.trendPercentage || 0) > 0 ? '+' : ''}${(revenue?.trendPercentage || 0).toFixed(1)}%`, isPositive: (revenue?.trendPercentage || 0) >= 0, icon: Wallet, accent: 'bg-gray-100 text-gray-600' },
        { title: 'Laba Bersih Bulan Ini', value: `Rp ${(profit?.month || 0).toLocaleString('id-ID')}`, trend: `${(profit?.trendPercentage || 0) > 0 ? '+' : ''}${(profit?.trendPercentage || 0).toFixed(1)}%`, isPositive: (profit?.trendPercentage || 0) >= 0, icon: TrendingUp, accent: 'bg-green-100 text-green-600' },
        { title: 'Transaksi Hari Ini', value: (transactionsToday?.success || 0).toString(), trend: `${transactionsToday?.failed || 0} gagal`, isPositive: (transactionsToday?.failed || 0) === 0, icon: Receipt, accent: 'bg-blue-50 text-blue-600' },
        { title: 'Laba Bersih Hari Ini', value: `Rp ${(profit?.today || 0).toLocaleString('id-ID')}`, trend: '', isPositive: true, icon: Activity, accent: 'bg-violet-50 text-violet-600' },
    ];

    return (
        <MerchantLayout>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <h1 className="text-xl font-bold text-gray-900">Performa Toko</h1>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider border ${merchant.plan === 'SUPREME' ? 'bg-amber-50 text-amber-700 border-amber-200' : merchant.plan === 'PRO' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            <Crown className="w-3 h-3" />
                            {merchant.plan}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">Pantau kinerja toko <span className="font-semibold text-gray-600">{merchant.name}</span> secara real-time.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors shadow-sm">
                    <Receipt className="w-4 h-4" />
                    Download Laporan
                </button>
            </div>

            {/* Alerts */}
            {alerts && alerts.length > 0 && (
                <div className="mb-5 space-y-2">
                    {alerts.map((al: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            {al}
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Chart + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">Laba & Omset (30 Hari)</h3>
                            <div className="flex items-center gap-4 mt-1.5">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-800" /><span className="text-[11px] text-gray-400 font-medium">Omset</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[11px] text-gray-400 font-medium">Laba</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="relative h-44 flex items-end justify-between gap-1">
                            {!chartData || chartData.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm font-medium">Belum ada data chart</div>
                            ) : (chartData || []).map((d: any, i: number) => {
                                const revH = Math.max((d.revenue / maxChartValue) * 100, 2);
                                const profH = Math.max((d.profit / maxChartValue) * 100, 2);
                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group relative cursor-pointer">
                                        <div className="w-full bg-gray-800 rounded-sm hover:bg-gray-600 transition-colors" style={{ height: `${revH}%` }} />
                                        <div className="w-full bg-green-500 rounded-sm hover:bg-green-400 transition-colors" style={{ height: `${profH}%` }} />
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2.5 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 shadow-xl pointer-events-none">
                                            <p className="font-bold text-gray-300 mb-1">{new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                            <p>Omset: <span className="font-bold text-white">Rp {d.revenue.toLocaleString()}</span></p>
                                            <p>Laba: <span className="font-bold text-green-400">Rp {d.profit.toLocaleString()}</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800">Transaksi Terbaru</h3>
                        <ShoppingCart className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1 divide-y divide-gray-50 overflow-y-auto">
                        {(!recentOrders || recentOrders.length === 0) ? (
                            <div className="flex items-center justify-center py-12 text-gray-300 text-sm">Belum ada transaksi</div>
                        ) : recentOrders.map((order: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${order.status === 'PAID' ? 'bg-green-500' : order.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-400'}`}>
                                    {order.customerName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-gray-800 truncate">{order.productName}</p>
                                    <p className="text-[11px] text-gray-400">{order.customerName} · <Clock className="w-2.5 h-2.5 inline" /> {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[13px] font-bold text-gray-900">Rp {Number(order.amount).toLocaleString('id-ID')}</p>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${order.status === 'PAID' ? 'text-green-600' : order.status === 'PENDING' ? 'text-amber-500' : 'text-red-500'}`}>{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100">
                        <button className="w-full text-[12px] font-semibold text-gray-500 hover:text-gray-800 py-1.5 hover:bg-gray-50 rounded-xl transition-colors">
                            Lihat semua transaksi →
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">Top Pelanggan Bulan Ini</h3>
                    <Package className="w-4 h-4 text-gray-300" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pelanggan</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Transaksi</th>
                                <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Total Belanja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(!topCustomers || topCustomers.length === 0) ? (
                                <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-300 text-sm">Belum ada data</td></tr>
                            ) : topCustomers.map((r: any, i: number) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{r.name}</p>
                                                <p className="text-[11px] text-gray-400">{r.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">{r.totalOrders}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-semibold text-green-700">
                                        Rp {Number(r.totalSpent).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MerchantLayout>
    );
}
