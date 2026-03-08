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
    Loader2
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function AdminDashboardPage() {
    const { data, error, isLoading } = useSWR('http://localhost:3001/admin/dashboard/summary', fetcher, {
        refreshInterval: 30000 // auto-refresh every 30s
    });

    return (
        <AdminLayout>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Selamat Datang, <span className="text-indigo-600">Super Admin</span></h1>
                    <p className="text-[14px] text-slate-500 mt-1">Ringkasan performa platform DagangPlay minggu ini.</p>
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
                    {/* Stats Cards */}
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

                        {/* Revenue Analytics */}
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
                            <div className="h-[280px] flex items-end gap-[10%] justify-between mt-8 border-b border-t border-slate-100 py-6">
                                {data.weeklyChart.map((item: any, i: number) => (
                                    <div key={i} className="flex-1 w-full max-w-[48px] flex flex-col justify-end group cursor-pointer relative h-full">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                                            Rp {item.value} JT
                                        </div>
                                        <div className="w-full rounded-t-md bg-indigo-100 group-hover:bg-indigo-500 transition-colors" style={{ height: `${item.value}%` }}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between flex-wrap text-[12px] font-medium text-slate-500 mt-4 px-1">
                                <span>Senin</span><span>Selasa</span><span>Rabu</span><span>Kamis</span><span>Jumat</span><span>Sabtu</span><span>Minggu</span>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-6 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg text-slate-800">Transaksi Terbaru</h3>
                                <button className="text-indigo-600 font-medium text-[13px] hover:text-indigo-700 hover:underline underline-offset-4 inline-flex items-center gap-1 transition-colors">
                                    Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="space-y-4 flex-1">
                                {data.recentTransactions.length === 0 && (
                                    <p className="text-sm text-slate-400 text-center mt-10">Belum ada transaksi</p>
                                )}
                                {data.recentTransactions.map((trx: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center group cursor-pointer border-b border-transparent hover:border-slate-100 pb-2 transition-all">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-slate-800 text-[14px] font-semibold group-hover:text-indigo-600 transition-colors leading-tight">{trx.game}</p>
                                            <p className="text-slate-400 text-[11px] font-mono tracking-tight">{trx.id}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-slate-800 text-[14px] font-bold leading-tight">Rp {Number(trx.amount).toLocaleString('id-ID')}</p>
                                            <div className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold tracking-wider 
                        ${trx.status === 'SUCCESS' ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60' :
                                                    trx.status === 'PENDING' ? 'text-amber-700 bg-amber-50 border-amber-200/60' :
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
