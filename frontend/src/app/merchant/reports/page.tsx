"use client";

import React from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { BarChart2, TrendingUp, PieChart, Download, Map, DollarSign, ShoppingCart } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantReportsPage() {
    const { data: sales, mutate } = useSWR('http://localhost:3001/merchant/reports/sales', fetcher);

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Laporan & Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Pantau performa penjualan dan pendapatan toko harian Anda.</p>
                </div>

                <button className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[13px] rounded-xl shadow-sm transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Excel
                </button>
            </div>

            {!sales ? (
                <div className="py-20 text-center"><p className="text-slate-500">Memuat analisis...</p></div>
            ) : (
                <div className="space-y-6">
                    {/* Ringkasan Kilat */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><DollarSign className="w-5 h-5" /></div>
                                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">+12.5%</span>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pendapatan Sukses</p>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">Rp {Number(sales.summary.totalRevenue || 0).toLocaleString('id-ID')}</h3>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-sky-50 rounded-xl text-sky-600"><ShoppingCart className="w-5 h-5" /></div>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pesanan Sukses</p>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">{sales.summary.successOrders} <span className="text-sm font-medium text-slate-400">/ {sales.summary.totalOrders} total</span></h3>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><TrendingUp className="w-5 h-5" /></div>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tingkat Kesuksesan</p>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">
                                {sales.summary.totalOrders > 0 ? ((sales.summary.successOrders / sales.summary.totalOrders) * 100).toFixed(1) : 0}%
                            </h3>
                        </div>
                    </div>

                    {/* Chart Mockup */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500" /> Penjualan 7 Hari Terakhir</h3>
                        </div>
                        <div className="h-64 flex items-end gap-3 justify-between p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            {/* Very simple visual chart representation */}
                            {sales.chart.map((c: any, i: number) => {
                                // Max height normalization
                                const maxRev = Math.max(...sales.chart.map((x: any) => x.revenue));
                                const h = maxRev > 0 ? (c.revenue / maxRev) * 100 : 0;
                                return (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                        <div className="w-full bg-indigo-100 rounded-md relative flex items-end justify-center overflow-hidden transition-all group-hover:bg-indigo-200" style={{ height: '200px' }}>
                                            <div className="w-full bg-indigo-500 rounded-md transition-all group-hover:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ height: `${h}%` }}></div>

                                            <div className="absolute top-2 opacity-0 group-hover:opacity-100 bg-white shadow-lg rounded p-1 text-[10px] font-bold text-slate-800 whitespace-nowrap transition-opacity">
                                                Rp {(c.revenue / 1000000).toFixed(1)}M
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500">{c.date}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
