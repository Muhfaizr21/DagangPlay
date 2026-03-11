"use client";
import React, { useState, useEffect } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    TrendingUp, Users, Receipt, Activity, ArrowUpRight, ArrowDownRight,
    Wallet, PackageSearch, Clock, AlertTriangle, Crown, Lock
} from 'lucide-react';

export default function AdminDemoPage() {
    // Mock Data for Demo
    const merchant = { name: "Demo Store", plan: "SUPREME" };
    const revenue = { month: 45280000, trendPercentage: 14.2, today: 2850000 };
    const transactionsToday = { success: 124, failed: 2 };
    const users = { activeCustomers: 1420 };
    const alerts = ["Pengaturan domain belum diverifikasi (Simulasi)", "Metode pembayaran QRIS aktif (Simulasi)"];

    const recentOrders = [
        { customerName: "Budi Santoso", productName: "MLBB 148 Diamonds", status: 'PAID', amount: 42500, createdAt: new Date() },
        { customerName: "Andi Wijaya", productName: "Free Fire 70 Diamonds", status: 'PAID', amount: 11000, createdAt: new Date() },
        { customerName: "Siti Aminah", productName: "PUBG 60 UC", status: 'PENDING', amount: 14500, createdAt: new Date() },
        { customerName: "Joko Anwar", productName: "Genshin Welkin Moon", status: 'PAID', amount: 79000, createdAt: new Date() },
    ];

    const topCustomers = [
        { name: "Budi Santoso", email: "budi@gmail.com", totalOrders: 42, totalSpent: 1850000 },
        { name: "Andi Wijaya", email: "andi@work.com", totalOrders: 38, totalSpent: 1420000 },
        { name: "Siti Aminah", email: "siti@school.id", totalOrders: 25, totalSpent: 980000 },
    ];

    const chartData = Array.from({ length: 30 }).map((_, i) => ({
        date: `${i + 1} Mar`,
        value: 1000000 + Math.random() * 2000000
    }));

    const maxChartValue = Math.max(...chartData.map(d => d.value));

    const stats = [
        { title: 'Total Pendapatan (Bln Ini)', value: `Rp ${revenue.month.toLocaleString('id-ID')}`, trend: `+${revenue.trendPercentage}%`, isPositive: true, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-500' },
        { title: 'Pelanggan Aktif', value: users.activeCustomers.toLocaleString('id-ID'), trend: '', isPositive: true, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 text-indigo-500' },
        { title: 'Trx Hari Ini (Sukses)', value: transactionsToday.success.toLocaleString('id-ID'), trend: `${transactionsToday.failed} Gagal`, isPositive: false, icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50 text-amber-500' },
        { title: 'Pendapatan Hari Ini', value: `Rp ${revenue.today.toLocaleString('id-ID')}`, trend: '', isPositive: true, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 text-purple-500' },
    ];

    const demoUser = { name: "Demo Merchant", email: "demo@dagangplay.com", plan: "SUPREME", role: "MERCHANT" };

    return (
        <MerchantLayout demoUser={demoUser}>
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-gold text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-[.2em] shadow-2xl animate-bounce border-2 border-black flex items-center gap-3">
                <Lock size={14} /> MODE DEMO - VIEW ONLY
            </div>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 opacity-60 pointer-events-none">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
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
                    <button className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-[13px] rounded-xl shadow-lg cursor-not-allowed">
                        Download Laporan
                    </button>
                </div>
            </div>

            {alerts.length > 0 && (
                <div className="mb-6 flex flex-col gap-2 opacity-50">
                    {alerts.map((al, i) => (
                        <div key={i} className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
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
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm opacity-90 transition-all hover:scale-[1.02]">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {stat.trend && (
                                    <span className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {stat.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{stat.title}</h3>
                            <p className={`text-2xl font-black mt-2 tracking-tight ${stat.color}`}>{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col opacity-90">
                    <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-[16px] font-bold text-slate-800">Analitik Omset 30 Hari Terakhir</h3>
                            <p className="text-[12px] text-slate-500">Total Rp {revenue.month.toLocaleString('id-ID')}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gold bg-black px-2 py-1 rounded">Visualisasi Demo</span>
                    </div>
                    <div className="flex-1 p-6 relative min-h-[300px] flex items-end justify-center">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                        <div className="relative w-full h-48 flex items-end justify-between px-2 gap-1 sm:gap-2 opacity-80">
                            {chartData.map((d, i) => {
                                const hPercent = Math.max((d.value / maxChartValue) * 100, 5);
                                return (
                                    <div key={i} className="w-full bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t-sm hover:opacity-100 transition-opacity cursor-pointer group relative" style={{ height: `${hPercent}%` }}>
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                            {d.date}<br />
                                            Rp {(d.value / 1000).toLocaleString('id-ID')}K
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions list */}
                <div className="col-span-1 bg-white rounded-3xl border border-slate-200/60 flex flex-col opacity-90">
                    <div className="p-6 border-b border-slate-100/50 flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-slate-800">Transaksi Terbaru</h3>
                        <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 p-2">
                        <div className="space-y-1">
                            {recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 ${order.status === 'PAID' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                                        {order.customerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{order.productName}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[11px] font-bold text-slate-500 truncate">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-slate-800">Rp {order.amount.toLocaleString('id-ID')}</p>
                                        <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${order.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100/50">
                        <button className="w-full py-2.5 text-[13px] font-bold text-slate-400 bg-slate-50 rounded-xl cursor-not-allowed">
                            Lihat Semua Transaksi (Demo)
                        </button>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
