"use client";
import { getApiUrl } from '@/lib/api';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from "@/components/merchant/MerchantLayout";
import { Send, Clock, Check, CheckCheck, Loader2, MessageSquare, Headphones, ShieldCheck } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantChatPage() {
    const baseUrl = getApiUrl();
    const { data: chatData, mutate, error } = useSWR(`${baseUrl}/chat/merchant`, fetcher, {
        refreshInterval: 5000 // Poll every 5s for new messages
    });

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatData]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`${baseUrl}/chat/merchant/send`, {
                message: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewMessage('');
            mutate(); // Refresh local data
        } catch (err: any) {
            console.error('Failed to send message', err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <MerchantLayout>
            <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] mt-4 flex flex-col bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                            <Headphones className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">Customer Service (Super Admin)</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-100 italic">Petugas Online • Siap Membantu</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-indigo-900/30 px-3 py-1.5 rounded-full border border-white/10">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Terenskripsi & Aman</span>
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 relative"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 0.7px, transparent 0.7px)',
                        backgroundSize: '20px 20px'
                    }}
                >
                    {error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="text-slate-800 font-bold">Koneksi Bermasalah</h3>
                            <p className="text-slate-500 text-sm mt-1">Gagal menyambung ke server bantuan. Silakan refresh halaman.</p>
                        </div>
                    ) : !chatData ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                        </div>
                    ) : chatData.messages?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200 m-8">
                            <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6 shadow-inner">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Ada yang bisa kami bantu?</h3>
                            <p className="text-slate-500 text-sm max-w-xs mt-2">
                                Silakan kirim pesan di bawah. Tim Super Admin akan membalas secepat mungkin.
                            </p>
                        </div>
                    ) : (
                        chatData.messages.map((msg: any) => (
                            <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative transition-all hover:shadow-md ${!msg.isAdmin
                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                                    }`}>
                                    {msg.isAdmin && (
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            Super Admin
                                        </p>
                                    )}
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                                        {msg.message}
                                    </p>
                                    <div className="flex items-center justify-end gap-1.5 mt-2 opacity-60">
                                        <span className="text-[9px] font-bold">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {!msg.isAdmin && (
                                            msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-200" /> : <Check className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Tulis pesan bantuan di sini..."
                                className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-5 py-4 text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
                                disabled={isSending}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${!newMessage.trim() || isSending
                                    ? 'bg-slate-100 text-slate-300'
                                    : 'bg-indigo-600 text-white hover:bg-slate-800 active:scale-95 shadow-indigo-200'
                                }`}
                        >
                            {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-0.5" />}
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-wider">
                        DagangPlay Chat Support • Kecepatan Balas: <span className="text-emerald-500">Sangat Cepat</span>
                    </p>
                </div>
            </div>
        </MerchantLayout>
    );
}
