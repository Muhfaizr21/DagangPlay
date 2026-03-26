"use client";
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Globe,
    Lock,
    Unlock,
    Server,
    ExternalLink,
    RefreshCw,
    Search
} from 'lucide-react';

export default function DomainManagerPage() {
    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Whitelabel Domain & SSL</h1>
                    <p className="text-[14px] text-slate-500 mt-1">SaaS Provisioning checker: Monitor custom domain merchant (CNAME/A Record) dan Auto-SSL Generator.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[40px] px-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-semibold transition-all shadow-md shadow-indigo-200">
                        <RefreshCw className="w-4 h-4" />
                        Sync All Records
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Cari domain atau merchant..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors" />
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer">
                            <option>Semua Status SSL</option>
                            <option>Aktif (Valid)</option>
                            <option>Pending DNS</option>
                            <option>Error / Expired</option>
                        </select>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <th className="p-4 pl-6 font-bold">Custom Domain</th>
                                <th className="p-4 font-bold">Merchant Owner</th>
                                <th className="p-4 font-bold">DNS Status (CNAME/A)</th>
                                <th className="p-4 font-bold">Auto-SSL Status</th>
                                <th className="p-4 pr-6 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700">
                            {/* Record 1 */}
                            <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <a href="https://topupdewa.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline decoration-indigo-300 underline-offset-4">
                                        <Globe className="w-4 h-4" />
                                        topupdewa.com
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </a>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] uppercase font-black tracking-tighter text-slate-600">TD</div>
                                        <span className="font-semibold text-slate-800">TokoDewa VIP</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                                        <Server className="w-3 h-3" /> Pointing Valid
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                                        <Lock className="w-3 h-3" /> Secure (Let's Encrypt)
                                    </span>
                                </td>
                                <td className="p-4 pr-6 text-right space-x-2">
                                    <button className="text-slate-500 hover:text-indigo-600 font-bold px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors text-xs">
                                        Manage
                                    </button>
                                </td>
                            </tr>

                            {/* Record 2 */}
                            <tr className="border-b border-slate-100 bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        juragankuota.id
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] uppercase font-black tracking-tighter text-slate-600">JK</div>
                                        <span className="font-semibold text-slate-800">Juragan Kuota</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase tracking-wider">
                                        <Server className="w-3 h-3" /> Not Configured
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                                        <Unlock className="w-3 h-3" /> Waiting DNS
                                    </span>
                                </td>
                                <td className="p-4 pr-6 text-right space-x-2">
                                    <button className="text-slate-500 hover:text-indigo-600 font-bold px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors text-xs">
                                        Ping DNS
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
