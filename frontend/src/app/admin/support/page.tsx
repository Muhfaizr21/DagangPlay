"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    LifeBuoy,
    Search,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    User,
    Store,
    Send,
    AlertCircle,
    MoreHorizontal
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function SupportManagementPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    const { data: tickets, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/tickets?status=${statusFilter}&priority=${priorityFilter}`,
        fetcher
    );
    const { data: stats } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/tickets/stats', fetcher);

    // Selected Ticket State
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState('');

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleSelectTicket = async (id: string) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/tickets/${id}`);
            setSelectedTicket(res.data);
            mutate(); // Refresh the list naturally, maybe state changed
        } catch (err) {
            showToast('Gagal', 'Gagal memuat detail tiket.', 'error');
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/tickets/${selectedTicket.id}/reply`, {
                message: replyText
            });
            setReplyText('');
            handleSelectTicket(selectedTicket.id); // Reload replies
            showToast('Terkirim', 'Pesan balasan sudah ditambahkan.');
        } catch (err: any) {
            showToast('Gagal', 'Terjadi masalah jaringan', 'error');
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/tickets/${selectedTicket.id}`, { status: newStatus });
            handleSelectTicket(selectedTicket.id);
            mutate();
            showToast('Sukses', `Status tiket diubah menjadi ${newStatus}`);
        } catch (err) {
            showToast('Gagal', 'Gagal mengubah status', 'error');
        }
    };

    return (
        <AdminLayout>
            {/* TTD: TOAST MSG */}
            {toastMsg && (
                <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-start gap-3 ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                        <div>
                            <p className="font-bold text-sm">{toastMsg.title}</p>
                            <p className="text-[13px] opacity-90 mt-0.5">{toastMsg.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Support Ticket Center</h1>
                <p className="text-[14px] text-slate-500 mt-1">Sistem keluhan dan bantuan (Helpdesk) untuk pengguna dan Merchant.</p>
            </div>

            {/* OVERVIEW STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Tiket</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{stats?.total || 0}</p>
                    <LifeBuoy className="w-12 h-12 absolute -bottom-2 -right-2 text-slate-100 opacity-50" />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-orange-400">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Membutuhkan Balasan (OPEN)</p>
                    <p className="text-3xl font-black text-orange-600 mt-1">{stats?.open || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-400">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telah Selesai (RESOLVED)</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">{stats?.resolved || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rata-rata Respon</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{stats?.avgResponseTimeHours || 0} Jam</p>
                </div>
            </div>

            <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[600px] overflow-hidden">
                {/* LIST KIRI */}
                <div className="w-full md:w-1/3 flex flex-col border-r border-slate-100 bg-slate-50/30">
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <div className="flex gap-2 mb-3">
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-xl text-slate-700">
                                <option value="">Semua Status</option>
                                <option value="OPEN">Menunggu (OPEN)</option>
                                <option value="IN_PROGRESS">Diproses (IN_PROGRESS)</option>
                                <option value="RESOLVED">Selesai (RESOLVED)</option>
                            </select>
                            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-xl text-slate-700">
                                <option value="">Semua Prioritas</option>
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full">
                        {isLoading ? <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div> :
                            tickets?.length === 0 ? <p className="text-xs text-center p-8 text-slate-500 font-medium">Bagus! Tidak ada tiket yang perlu ditinjau.</p>
                                : tickets?.map((tk: any) => (
                                    <div key={tk.id} onClick={() => handleSelectTicket(tk.id)} className={`p-4 border-b border-slate-100 cursor-pointer transition ${selectedTicket?.id === tk.id ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 bg-white border-l-4 border-l-transparent'}`}>
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${tk.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : tk.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{tk.status}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(tk.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{tk.subject}</h3>
                                        <div className="flex justify-between mt-2 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1 font-medium"><User className="w-3.5 h-3.5" /> {tk.user?.name}</span>
                                            <span className={`font-black uppercase tracking-wider ${tk.priority === 'CRITICAL' ? 'text-red-600' : tk.priority === 'HIGH' ? 'text-orange-500' : 'text-slate-400'}`}>{tk.priority}</span>
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>

                {/* AREA DISKUSI KANAN */}
                {selectedTicket ? (
                    <div className="flex-1 flex flex-col bg-slate-50/50">
                        {/* HEADER TIKET */}
                        <div className="p-6 bg-white border-b border-slate-100 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-slate-100 px-2.5 py-1 rounded text-xs font-mono font-bold text-slate-500">#{selectedTicket.id.substring(selectedTicket.id.length - 8).toUpperCase()}</span>
                                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{selectedTicket.category}</span>
                                    <span className="text-[11px] font-black text-white px-2 rounded-full shadow-sm bg-slate-400">{selectedTicket.priority}</span>
                                </div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedTicket.subject}</h2>
                                <p className="text-[12px] mt-1 text-slate-500 flex items-center gap-2">
                                    Dari: <span className="font-bold text-slate-700">{selectedTicket.user?.name}</span> ({selectedTicket.user?.role})
                                    {selectedTicket.merchant && <><Store className="w-3 h-3 ml-2" /> Toko: <span className="font-bold text-slate-700">{selectedTicket.merchant.name}</span></>}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedTicket.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border 
                                         ${selectedTicket.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            selectedTicket.status === 'OPEN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-indigo-50 text-indigo-700 border-indigo-200'}`}
                                >
                                    <option value="OPEN">Mark OPEN</option>
                                    <option value="IN_PROGRESS">Mark IN PROGRESS</option>
                                    <option value="RESOLVED">Mark RESOLVED (Selesai)</option>
                                </select>
                            </div>
                        </div>

                        {/* LIST REPLIES */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {selectedTicket.replies?.map((rp: any) => {
                                const isAdmin = rp.user?.role === 'SUPER_ADMIN';
                                return (
                                    <div key={rp.id} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm relative ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border text-slate-700 border-slate-200 rounded-tl-sm'}`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{rp.message}</p>

                                            {/* Attachment if exists */}
                                            {rp.attachments && typeof rp.attachments === 'string' && rp.attachments !== "[]" && (
                                                <div className="mt-3 bg-white/10 p-2 rounded border border-white/20">
                                                    <a href="#" className={`text-[11px] font-bold ${isAdmin ? 'text-indigo-100 hover:text-white' : 'text-indigo-600 hover:text-indigo-800'} flex items-center gap-1`}>
                                                        <MoreHorizontal className="w-3 h-3" /> View Attachments Available
                                                    </a>
                                                </div>
                                            )}

                                            <p className={`text-[10px] mt-2 font-bold flex justify-between items-center ${isAdmin ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                <span>{new Date(rp.createdAt).toLocaleString()}</span>
                                                <span className="uppercase">{rp.user?.name} {isAdmin ? '(STAFF)' : ''}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedTicket.replies?.length === 0 && <p className="text-center text-slate-400 font-medium py-10 italic">Belum ada diskusi pada tiket ini.</p>}
                        </div>

                        {/* INPUT BALASAN */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            {selectedTicket.status === 'RESOLVED' ? (
                                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm">⛔ Tiket telah ditutup (Resolved). Anda bisa membukanya kembali via dropdown status.</div>
                            ) : (
                                <form onSubmit={handleSendReply} className="flex gap-3">
                                    <textarea
                                        required
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Ketik balasan untuk pelanggan ini..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 resize-none h-14 min-h-[56px] py-3.5"
                                    />
                                    <button type="submit" disabled={!replyText.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 w-14 lg:w-32 rounded-xl flex items-center justify-center gap-2 font-black transition disabled:opacity-50">
                                        <Send className="w-4 h-4" /> <span className="hidden lg:inline">BALAS</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 bg-slate-50/50 flex flex-col items-center justify-center p-10 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 animate-pulse"><MessageSquare className="w-10 h-10" /></div>
                        <h3 className="text-xl font-bold text-slate-700">Pilih Tiket Bantuan</h3>
                        <p className="text-sm text-slate-500 max-w-sm mt-1">Pilih salah satu keluhan dari daftar di sebelah kiri untuk melihat detail percakapan dan membalas tiket masuk.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
