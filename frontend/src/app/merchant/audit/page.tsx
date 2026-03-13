"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    ShieldCheck,
    Search,
    Calendar,
    User,
    ChevronLeft,
    ChevronRight,
    Activity,
    Info,
    ArrowUpDown
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function AuditLogPage() {
    const [page, setPage] = useState(1);
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const { data: logsData, error, isLoading } = useSWR(
        `${baseUrl}/merchant/audit?page=${page}&limit=20`,
        fetcher
    );

    if (error) {
        return (
            <MerchantLayout>
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
                    <p className="font-bold">Gagal memuat data Audit Logs.</p>
                </div>
            </MerchantLayout>
        );
    }

    const { data: logs, meta } = logsData || { data: [], meta: { total: 0, lastPage: 1 } };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" /> Audit Log Staff
                    </h1>
                    <p className="text-[14px] text-slate-500 mt-2">
                        Pantau seluruh aktivitas perubahan sistem dan tindakan staff secara transparan.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">Total {meta.total} Records</span>
                    </div>
                    <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input type="text" placeholder="Filter log..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-100 outline-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Waktu</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Staff / User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Aksi</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Entitas</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-4 animate-pulse"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Info size={40} />
                                            <p className="font-bold uppercase tracking-[0.2em] text-sm">Belum ada log tercatat</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-[12px] font-medium text-slate-600">
                                                {new Date(log.createdAt).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                {log.user?.name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-800 leading-none">{log.user?.name || 'System'}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{log.user?.role || 'SYSTEM'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            log.action.includes('UPDATE') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                            log.action.includes('DELETE') ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tighter">{log.entity}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-[11px] font-bold text-indigo-600 hover:underline underline-offset-4 decoration-2">
                                            Lihat JSON Data
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Page {page} of {meta.lastPage}</p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all hover:shadow-md"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            disabled={page === meta.lastPage}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-all hover:shadow-md"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-200 text-indigo-600">
                      <ShieldCheck size={20} />
                 </div>
                 <div>
                      <p className="text-sm font-bold text-indigo-900 uppercase tracking-tight">System Security Guaranteed</p>
                      <p className="text-xs text-indigo-600/70 mt-1 leading-relaxed">
                          Audit logs bersifat immutable (tidak dapat diubah) dan disimpan secara aman. Gunakan data ini untuk melakukan investigasi jika terdapat anomali pada harga produk atau pemrosesan pesanan oleh staff.
                      </p>
                 </div>
            </div>
        </MerchantLayout>
    );
}
