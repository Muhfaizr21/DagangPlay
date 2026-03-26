"use client";
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Webhook,
    ShieldCheck,
    AlertTriangle,
    Search,
    RefreshCw,
    ActivitySquare
} from 'lucide-react';

export default function WebhookGatewayPage() {
    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">API & Webhook Gateway</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Live traffic monitor interaksi server DagangPlay dengan sistem toko Merchant & Payment Gateway.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[40px] px-5 inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[13px] font-semibold transition-all shadow-sm">
                        <ActivitySquare className="w-4 h-4 text-indigo-600" />
                        Live Stream (Tail)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Stats */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Webhook className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Outbound Delivery (To Merchants)</h4>
                        <div className="flex items-end gap-3 tracking-tight">
                            <span className="text-3xl font-black text-slate-800">98.2%</span>
                            <span className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-1 bg-emerald-50 px-2 rounded-md">
                                Success Rate
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Inbound Payload (From Providers)</h4>
                        <div className="flex items-end gap-3 tracking-tight">
                            <span className="text-3xl font-black text-slate-800">100%</span>
                            <span className="text-sm font-bold text-indigo-500 mb-1 flex items-center gap-1 bg-indigo-50 px-2 rounded-md">
                                HMAC Validated
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex gap-4 border border-slate-200 p-1 rounded-xl bg-slate-50 shadow-sm">
                        <button className="px-5 py-1.5 text-xs font-bold bg-white text-indigo-600 rounded-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]">Outbound Logs</button>
                        <button className="px-5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Inbound Logs</button>
                    </div>
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari URL endpoint atau Trx ID..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors shadow-sm" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-white">
                                <th className="p-4 pl-6 font-bold">Timestamp</th>
                                <th className="p-4 font-bold">Target URL (Merchant)</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Latency</th>
                                <th className="p-4 pr-6 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-slate-600">
                            {[1, 2, 3].map((_, i) => (
                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6 whitespace-nowrap text-slate-500">
                                        Hari ini, 10:42:12
                                    </td>
                                    <td className="p-4 max-w-[200px] truncate">
                                        <div className="text-indigo-600 font-semibold mb-0.5">https://api.topupdewa.com/webhook</div>
                                        <div className="text-[10px] text-slate-400 font-mono">Event: order.paid</div>
                                    </td>
                                    <td className="p-4">
                                        {i === 1 ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-600 border border-rose-100 font-bold uppercase tracking-wider text-[10px]">
                                                500 Error
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold uppercase tracking-wider text-[10px]">
                                                200 OK
                                            </span>
                                        )}
                                    </td>
                                    <td className={`p-4 text-right font-mono ${i === 1 ? 'text-rose-500' : 'text-slate-500'}`}>
                                        {i === 1 ? '5020ms' : '124ms'}
                                    </td>
                                    <td className="p-4 pr-6 text-right space-x-2">
                                        <button className="text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors">
                                            View Body
                                        </button>
                                        {i === 1 && (
                                            <button className="text-white hover:text-white font-bold px-3 py-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm shadow-rose-200" title="Resend Webhook">
                                                <RefreshCw className="w-3.5 h-3.5 inline-block" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
