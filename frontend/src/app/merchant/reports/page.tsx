"use client";
import { getApiUrl } from '@/lib/api';

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { BarChart2, TrendingUp, PieChart, Download, Map, DollarSign, ShoppingCart } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantReportsPage() {
    const baseUrl = getApiUrl();
    const [timeRange, setTimeRange] = useState('7d');
    const { data: sales, mutate } = useSWR(`${baseUrl}/merchant/reports/sales?range=${timeRange}`, fetcher, {
        refreshInterval: 5000,
        revalidateOnFocus: true
    });

    const getLabelText = () => {
        if (timeRange === '7d') return '7 Hari';
        if (timeRange === '1m') return '1 Bulan';
        if (timeRange === '1y') return '1 Tahun';
        return 'Semua Waktu';
    };

    const getChartTitle = () => {
        if (timeRange === '7d') return 'Penjualan 7 Hari Terakhir';
        if (timeRange === '1m') return 'Penjualan 30 Hari Terakhir';
        if (timeRange === '1y') return 'Penjualan 12 Bulan Terakhir';
        return 'Penjualan 5 Tahun Terakhir';
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Laporan & Analytics</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Pantau performa penjualan dan wawasan pendapatan harian Anda.</p>
                </div>

                <div className="flex gap-3 items-center">
                    {/* Time Range Toggle */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center shadow-inner">
                        <button 
                            onClick={() => setTimeRange('7d')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === '7d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            7 Hari
                        </button>
                        <button 
                            onClick={() => setTimeRange('1m')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === '1m' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            1 Bulan
                        </button>
                        <button 
                            onClick={() => setTimeRange('1y')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === '1y' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            1 Tahun
                        </button>
                        <button 
                            onClick={() => setTimeRange('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Semua
                        </button>
                    </div>

                    <button className="px-5 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-indigo-600 font-semibold text-[13px] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {!sales ? (
                <div className="py-24 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500 font-medium animate-pulse">Memuat analitik mendalam...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Premium Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primary Stat Card with Gradient */}
                        <div className="rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-[0_8px_30px_rgb(99,102,241,0.2)]">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
                                        <DollarSign className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20 text-white">+0.0%</span>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1">Pendapatan ({getLabelText()})</p>
                                    <h3 className="text-3xl font-black tracking-tight font-mono">Rp {Number(sales.summary.totalRevenue || 0).toLocaleString('id-ID')}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Stat Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 hover:border-sky-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                                        <ShoppingCart className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pesanan ({getLabelText()})</p>
                                    <h3 className="text-3xl font-black tracking-tight text-slate-900 font-mono">
                                        {sales.summary.successOrders} 
                                        <span className="text-sm font-medium text-slate-400 ml-2">/ {sales.summary.totalOrders}</span>
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Tertiary Stat Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 hover:border-emerald-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rasio Sukses ({getLabelText()})</p>
                                    <h3 className="text-3xl font-black tracking-tight text-slate-900 font-mono">
                                        {sales.summary.totalOrders > 0 ? ((sales.summary.successOrders / sales.summary.totalOrders) * 100).toFixed(1) : 0}%
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Highly Aesthetic Chart Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{getChartTitle()}</h3>
                                <p className="text-[12px] font-medium text-slate-400 mt-1">Tren volume transaksi kotor</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-xs font-semibold text-slate-600">Pendapatan</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className={`h-72 w-full flex items-end justify-between ${timeRange === '1m' ? 'gap-1' : 'gap-4 md:gap-8'} relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-20`}>
                                
                                {/* Background Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                                    {[1, 2, 3, 4, 5].map(line => (
                                        <div key={line} className="w-full border-t border-dashed border-slate-200"></div>
                                    ))}
                                </div>
                                
                                {sales.chart.map((c: any, i: number) => {
                                    const rawMaxRev = Math.max(...sales.chart.map((x: any) => x.revenue));
                                    const maxRev = rawMaxRev === 0 ? 1 : rawMaxRev;
                                    const hPercentage = (c.revenue / maxRev) * 100;
                                    const displayHeight = hPercentage > 0 ? hPercentage : 2;

                                    return (
                                        <div key={i} className={`relative flex flex-col items-center flex-1 h-full justify-end group z-10 w-full`}>
                                            {/* Hover Tooltip */}
                                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 z-20 pointer-events-none">
                                                <div className="bg-slate-900/95 backdrop-blur-md shadow-xl rounded-xl py-2 px-3 text-white border border-slate-700/50 flex flex-col items-center">
                                                    <span className="text-[10px] text-slate-400 font-semibold mb-0.5">{c.date}</span>
                                                    <span className="text-sm font-bold font-mono whitespace-nowrap">
                                                        Rp {(c.revenue / 1000).toLocaleString('id-ID')}K
                                                    </span>
                                                </div>
                                                <div className="w-2 h-2 bg-slate-900/95 rotate-45 mx-auto -mt-1 border-b border-r border-slate-700/50"></div>
                                            </div>

                                            {/* Bar */}
                                            <div className={`w-full ${timeRange === '1m' ? 'max-w-[12px] md:max-w-[20px]' : 'max-w-[48px]'} relative flex flex-col justify-end group-hover:scale-105 transition-transform duration-300 origin-bottom`}>
                                                <div 
                                                    className={`w-full rounded-t-xl transition-all duration-700 ease-out flex justify-center items-start shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] ${c.revenue > 0 ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 group-hover:from-indigo-500 group-hover:to-purple-400' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                                                    style={{ height: `${displayHeight}%` }}
                                                >
                                                    {c.revenue > 0 && <div className="w-1/2 h-1 bg-white/30 rounded-full mt-1"></div>}
                                                </div>
                                            </div>
                                            
                                            {/* Only show date text if not congested, or show every nth item if 1m */}
                                            <p className={`text-[10px] font-bold text-slate-400 mt-4 text-center group-hover:text-indigo-600 transition-colors uppercase tracking-wider ${timeRange === '1m' && i % 3 !== 0 ? 'hidden md:block opacity-30 group-hover:opacity-100 text-[8px]' : ''}`}>
                                                {c.date.split(' ')[0]} 
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
