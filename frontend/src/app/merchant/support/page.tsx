"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { Ticket, Search, Filter, MessageSquare, Plus, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantSupportPage() {
    const { data: tickets, mutate } = useSWR('http://localhost:3001/merchant/support', fetcher);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`http://localhost:3001/merchant/support/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            mutate();
        } catch (err: any) {
            alert('Gagal update tiket');
        }
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Support & Tiket</h1>
                    <p className="text-slate-500 text-sm mt-1">Bantu pelanggan dan reseller Anda menjawab kendala transaksi.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex bg-slate-100/50 p-1 rounded-lg w-fit">
                        {['ALL', 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 text-[13px] font-bold rounded-md transition-all ${statusFilter === status ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {status === 'ALL' ? 'Semua' : status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-[250px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Cari ID tiket atau user..."
                            className="pl-9 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Info Tiket</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Pengirim</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status & Prioritas</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!tickets ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Memuat tiket...</td></tr>
                            ) : tickets.filter((t: any) => statusFilter === 'ALL' || t.status === statusFilter).length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-slate-500">
                                    <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    Belum ada tiket support.
                                </td></tr>
                            ) : (
                                tickets.filter((t: any) => statusFilter === 'ALL' || t.status === statusFilter).map((t: any) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{t.subject}</p>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                ID: {t.id.substring(t.id.length - 6).toUpperCase()} •
                                                <Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-700 text-sm">{t.user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{t.user.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5 w-fit">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'OPEN' ? 'bg-indigo-100 text-indigo-700' : t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {t.status}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${t.priority === 'HIGH' || t.priority === 'URGENT' ? 'text-red-600 bg-red-100' : 'text-slate-500 bg-white border border-slate-200'}`}>
                                                    <AlertCircle className="w-2 h-2" /> {t.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 flex gap-2 justify-end items-center">
                                            {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                                                <button onClick={() => handleUpdateStatus(t.id, 'RESOLVED')} className="px-3 py-1.5 text-xs font-bold border border-emerald-200 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                                    Resolve
                                                </button>
                                            )}
                                            {/* In a real app we'd have a detail page: /merchant/support/[id] */}
                                            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all shadow-sm">
                                                Balas
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MerchantLayout>
    );
}
