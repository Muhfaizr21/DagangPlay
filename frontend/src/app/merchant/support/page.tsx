"use client";
import { getApiUrl } from '@/lib/api';

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import {
    LifeBuoy, MessageSquare, Send, AlertCircle, CheckCircle2,
    Clock, User, Loader2, Plus, X
} from 'lucide-react';

const BASE = getApiUrl();

const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('merchant_token') || localStorage.getItem('admin_token')) : null;

const fetcher = (url: string) => axios.get(url, {
    headers: { Authorization: `Bearer ${getToken()}` }
}).then(r => r.data);

export default function MerchantSupportPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', category: 'ORDER', priority: 'MEDIUM' });

    const { data: tickets, isLoading, mutate } = useSWR(
        `${BASE}/merchant/support${statusFilter ? `?status=${statusFilter}` : ''}`, fetcher,
        { refreshInterval: 15000 }
    );

    const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSelect = async (id: string) => {
        try {
            const res = await axios.get(`${BASE}/merchant/support/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setSelectedTicket(res.data);
        } catch {
            showToast('Gagal memuat detail tiket.', 'err');
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        try {
            await axios.post(`${BASE}/merchant/support/${selectedTicket.id}/reply`,
                { message: replyText },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            setReplyText('');
            handleSelect(selectedTicket.id);
            showToast('Pesan terkirim!');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal mengirim pesan.', 'err');
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE}/merchant/support`,
                newTicket,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            setShowNewTicket(false);
            setNewTicket({ subject: '', description: '', category: 'ORDER', priority: 'MEDIUM' });
            mutate();
            showToast('Tiket berhasil dibuat!');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal membuat tiket.', 'err');
        }
    };

    const priorityColor: Record<string, string> = {
        URGENT: 'text-red-600 bg-red-50 border-red-200',
        HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
        MEDIUM: 'text-blue-600 bg-blue-50 border-blue-200',
        LOW: 'text-slate-500 bg-slate-50 border-slate-200',
    };
    const statusColor: Record<string, string> = {
        OPEN: 'bg-orange-100 text-orange-700',
        IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
        RESOLVED: 'bg-emerald-100 text-emerald-700',
        CLOSED: 'bg-slate-100 text-slate-500',
        WAITING_REPLY: 'bg-yellow-100 text-yellow-700',
    };

    return (
        <MerchantLayout>
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50">
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold ${toast.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {toast.msg}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Support & Tiket</h1>
                    <p className="text-slate-500 text-sm mt-1">Komunikasi langsung dengan tim DagangPlay untuk bantuan & sengketa.</p>
                </div>
                <button
                    onClick={() => setShowNewTicket(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Buat Tiket Baru
                </button>
            </div>

            {/* New Ticket Modal */}
            {showNewTicket && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Buat Tiket Bantuan Baru</h3>
                            <button onClick={() => setShowNewTicket(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <input required value={newTicket.subject} onChange={e => setNewTicket(v => ({ ...v, subject: e.target.value }))}
                                placeholder="Judul masalah Anda..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 placeholder:text-slate-400 placeholder:font-normal" />
                            <textarea required value={newTicket.description} onChange={e => setNewTicket(v => ({ ...v, description: e.target.value }))}
                                placeholder="Jelaskan masalah secara detail..." rows={4}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 placeholder:text-slate-400 placeholder:font-normal resize-none" />
                            <div className="flex gap-3">
                                <select value={newTicket.category} onChange={e => setNewTicket(v => ({ ...v, category: e.target.value }))}
                                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 outline-none">
                                    <option value="ORDER">Pesanan</option>
                                    <option value="PAYMENT">Pembayaran</option>
                                    <option value="REFUND">Refund</option>
                                    <option value="ACCOUNT">Akun</option>
                                    <option value="OTHER">Lainnya</option>
                                </select>
                                <select value={newTicket.priority} onChange={e => setNewTicket(v => ({ ...v, priority: e.target.value }))}
                                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 outline-none">
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowNewTicket(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
                                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">Kirim Tiket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Chat Panel */}
            <div className="flex bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[600px] overflow-hidden">
                {/* Left: Ticket List */}
                <div className="w-full md:w-[340px] flex flex-col border-r border-slate-100 shrink-0">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/30">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-xs font-bold p-2.5 rounded-xl text-slate-700">
                            <option value="">Semua Status</option>
                            <option value="OPEN">Menunggu (OPEN)</option>
                            <option value="IN_PROGRESS">Diproses</option>
                            <option value="WAITING_REPLY">Menunggu Balasan</option>
                            <option value="RESOLVED">Selesai</option>
                        </select>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading && <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></div>}
                        {!isLoading && tickets?.length === 0 && (
                            <div className="p-10 text-center">
                                <LifeBuoy className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-slate-400 font-medium">Belum ada tiket bantuan.</p>
                            </div>
                        )}
                        {tickets?.map((tk: any) => (
                            <div key={tk.id} onClick={() => handleSelect(tk.id)}
                                className={`p-4 border-b border-slate-100 cursor-pointer transition border-l-4 ${selectedTicket?.id === tk.id ? 'bg-indigo-50/60 border-l-indigo-500' : 'bg-white border-l-transparent hover:bg-slate-50'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${statusColor[tk.status] || 'bg-slate-100 text-slate-500'}`}>{tk.status}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(tk.createdAt).toLocaleDateString('id-ID')}</span>
                                </div>
                                <p className="font-bold text-sm text-slate-800 line-clamp-1 mt-1">{tk.subject}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className={`text-[10px] font-black border rounded px-1.5 py-0.5 uppercase ${priorityColor[tk.priority] || ''}`}>{tk.priority}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{tk.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Chat Detail */}
                {selectedTicket ? (
                    <div className="flex-1 flex flex-col">
                        {/* Ticket Header */}
                        <div className="p-5 bg-white border-b border-slate-100">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                    #{selectedTicket.id.slice(-8).toUpperCase()}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${priorityColor[selectedTicket.priority] || ''}`}>{selectedTicket.priority}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${statusColor[selectedTicket.status] || ''}`}>{selectedTicket.status}</span>
                            </div>
                            <h2 className="text-lg font-black text-slate-800">{selectedTicket.subject}</h2>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <User className="w-3 h-3" /> {selectedTicket.user?.name}
                                <Clock className="w-3 h-3 ml-2" /> {new Date(selectedTicket.createdAt).toLocaleString('id-ID')}
                            </p>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
                            {/* Original description */}
                            <div className="flex justify-start">
                                <div className="max-w-[78%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2">{selectedTicket.user?.name} • {new Date(selectedTicket.createdAt).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies?.map((rp: any) => {
                                const isStaff = rp.isFromStaff === true;
                                return (
                                    <div key={rp.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[78%] rounded-2xl p-4 shadow-sm ${isStaff ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{rp.message}</p>
                                            <p className={`text-[10px] mt-2 font-bold flex justify-between ${isStaff ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                <span>{new Date(rp.createdAt).toLocaleString('id-ID')}</span>
                                                <span>{isStaff ? '🛡️ DagangPlay Staff' : rp.user?.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedTicket.replies?.length === 0 && (
                                <p className="text-center text-slate-400 text-sm font-medium py-8 italic">Belum ada balasan dari tim kami.</p>
                            )}
                        </div>

                        {/* Reply Input */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            {selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? (
                                <div className="text-center py-3 bg-slate-50 rounded-xl text-slate-500 text-sm font-bold border border-slate-200">
                                    ⛔ Tiket ini sudah ditutup.
                                </div>
                            ) : (
                                <form onSubmit={handleReply} className="flex gap-3">
                                    <textarea
                                        required
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Ketik balasan Anda kepada tim DagangPlay..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm resize-none h-14 min-h-[56px] focus:bg-white focus:border-indigo-400 outline-none transition"
                                    />
                                    <button type="submit" disabled={!replyText.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl flex items-center gap-2 font-bold transition disabled:opacity-50">
                                        <Send className="w-4 h-4" />
                                        <span className="hidden sm:inline text-sm">KIRIM</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50/40">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">Pilih Percakapan</h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-xs">Klik salah satu tiket di kiri untuk melihat riwayat percakapan dengan tim DagangPlay.</p>
                    </div>
                )}
            </div>
        </MerchantLayout>
    );
}
