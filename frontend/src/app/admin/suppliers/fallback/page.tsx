"use client";
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Route,
    GripVertical,
    Zap,
    AlertCircle,
    ServerCrash,
    CheckCircle,
    Plus
} from 'lucide-react';

export default function SupplierRoutingPage() {
    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Supplier Routing & Fallback</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Konfigurasi visual rantai pemasok (Multi-Vendor Failover) untuk mengamankan 99.9% uptime fulfillment.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[40px] px-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-semibold transition-all shadow-md shadow-indigo-200">
                        Simpan Aturan Routing
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Fallback Rules Builder */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 leading-none">Primary Flow (Mobile Legends)</h2>
                        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Rule Baru
                        </button>
                    </div>

                    {/* Rule 1 */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm group">
                        <div className="cursor-grab text-slate-400 group-hover:text-slate-600">
                            <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                            1
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-sm">Coba Eksekusi ke: <span className="text-indigo-600">Digiflazz</span></h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Primary</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Prioritas harga termurah. Time-out limit: 15s.</p>
                        </div>
                    </div>

                    {/* Rule 2 */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm group relative">
                        {/* Connecting Line */}
                        <div className="absolute -top-4 left-10 w-0.5 h-4 bg-slate-200"></div>
                        <div className="cursor-grab text-slate-400 group-hover:text-slate-600">
                            <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black text-lg">
                            2
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-sm">Jika Timeout/Error, Otomatis ke: <span className="text-amber-600">VIP Reseller</span></h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded">Fallback #1</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Abaikan margin minus untuk mengamankan pesanan customer.</p>
                        </div>
                    </div>

                    {/* Rule 3 */}
                    <div className="bg-white border-2 border-dashed border-rose-200 rounded-2xl p-4 flex items-center gap-4 group relative">
                        <div className="absolute -top-4 left-10 w-0.5 h-4 bg-slate-200"></div>
                        <div className="w-8 h-8 opacity-0"></div>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-black text-lg">
                            <Route className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-rose-600 text-sm">Jika Semua Gagal (Last Resort)</h3>
                            <p className="text-xs text-rose-500 mt-1 font-medium">Refund otomatis ke saldo sistem Merchant & set transaksi "GAGAL".</p>
                        </div>
                    </div>
                </div>

                {/* Circuit Breaker Status */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 leading-none mb-4">Circuit Breaker Status</h2>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50"></div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800">Digiflazz</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">Latency: 450ms</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">HEALTHY</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-500">
                            <span>Error Rate (5m):</span>
                            <span className="font-bold text-slate-700">0.2%</span>
                        </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-200 shadow-[0_2px_15px_-5px_rgba(225,29,72,0.1)] rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-sm text-rose-900">VIP Reseller</h4>
                                    <p className="text-xs font-medium text-rose-600 mt-0.5">Latency: Timeout</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-black text-white bg-rose-600 px-2 py-1 rounded shadow-sm shadow-rose-200">OUTAGE BLOCKED</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-rose-200/50 flex justify-between text-xs font-medium text-rose-700 relative z-10">
                            <span>Error Rate (5m):</span>
                            <span className="font-bold text-rose-900">100%</span>
                        </div>
                        <AlertCircle className="w-24 h-24 text-rose-600 opacity-5 absolute -bottom-4 -right-4 pointer-events-none" />
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
