"use client";
import React, { useEffect, useState } from 'react';
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
    Clock
} from 'lucide-react';

export default function MerchantDashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Mock data for the dashboard
    const stats = [
        { title: 'Total Pendapatan', value: 'Rp 14.500.000', trend: '+12.5%', isPositive: true, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-500' },
        { title: 'Reseller Aktif', value: '1,248', trend: '+5.2%', isPositive: true, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 text-indigo-500' },
        { title: 'Transaksi Hari Ini', value: '384', trend: '-2.1%', isPositive: false, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50 text-amber-500' },
        { title: 'Produk Terjual', value: '1,492', trend: '+18.4%', isPositive: true, icon: PackageSearch, color: 'text-purple-600', bg: 'bg-purple-50 text-purple-500' },
    ];

    const recentOrders = [
        { id: '#INV-2023-001', reseller: 'Budi Gaming', amount: 'Rp 250.000', status: 'Sukses', time: '10 menit yang lalu', logo: 'B' },
        { id: '#INV-2023-002', reseller: 'Store XYZ', amount: 'Rp 1.500.000', status: 'Sukses', time: '1 jam yang lalu', logo: 'S' },
        { id: '#INV-2023-003', reseller: 'Gamer Pro ID', amount: 'Rp 75.000', status: 'Pending', time: '2 jam yang lalu', logo: 'G' },
        { id: '#INV-2023-004', reseller: 'Juragan Diamond', amount: 'Rp 500.000', status: 'Gagal', time: '5 jam yang lalu', logo: 'J' },
    ];

    return (
        <MerchantLayout>
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
                    <p className="text-[14px] text-slate-500 mt-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Pantau kinerja toko Anda secara real-time.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-4 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 cursor-pointer">
                        <option>Hari Ini</option>
                        <option>7 Hari Terakhir</option>
                        <option>Bulan Ini</option>
                    </select>
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5">
                        Download Laporan
                    </button>
                </div>
            </div>

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
                                <span className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{stat.title}</h3>
                            <p className={`text-2xl font-black mt-2 tracking-tight ${stat.color}`}>{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area Placeholder */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-[16px] font-bold text-slate-800">Analitik Pendapatan</h3>
                            <p className="text-[12px] text-slate-500">Pertumbuhan omset bulan berjalan</p>
                        </div>
                        <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg">Lihat Detail</button>
                    </div>
                    <div className="flex-1 p-6 relative min-h-[300px] flex items-end justify-center">
                        {/* Mock Chart Visualization using divs */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                        <div className="relative w-full h-48 flex items-end justify-between px-4 gap-2 opacity-80">
                            {[30, 50, 40, 70, 60, 90, 80, 100, 85, 110].map((h, i) => (
                                <div key={i} className="w-full bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t-md hover:opacity-100 transition-opacity cursor-pointer group relative" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Rp {h}K
                                    </div>
                                </div>
                            ))}
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
                        <div className="space-y-1">
                            {recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${order.status === 'Sukses' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                                            order.status === 'Pending' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                                'bg-gradient-to-br from-red-400 to-rose-500'
                                        }`}>
                                        {order.logo}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{order.reseller}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[11px] font-bold text-slate-500 truncate">{order.id}</p>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-slate-800">{order.amount}</p>
                                        <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${order.status === 'Sukses' ? 'text-emerald-500' :
                                                order.status === 'Pending' ? 'text-amber-500' :
                                                    'text-red-500'
                                            }`}>{order.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100/50">
                        <button className="w-full py-2.5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors">
                            Lihat Semua Transaksi →
                        </button>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
