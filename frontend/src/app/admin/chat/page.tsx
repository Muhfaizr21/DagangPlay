"use client";
import { getApiUrl } from '@/lib/api';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, MessageSquare, Send, User, Clock, Check, CheckCheck, Loader2, Store } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function AdminChatDashboard() {
    const baseUrl = getApiUrl();
    const { data: rooms, error: roomsError, mutate: mutateRooms } = useSWR(`${baseUrl}/chat/admin/rooms`, fetcher, {
        refreshInterval: 10000 // Every 10s for rooms list
    });

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const { data: activeRoom, mutate: mutateMessages } = useSWR(
        selectedRoomId ? `${baseUrl}/chat/admin/rooms/${selectedRoomId}` : null,
        fetcher,
        { refreshInterval: 5000 }
    );

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [search, setSearch] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeRoom]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoomId || !newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`${baseUrl}/chat/admin/rooms/${selectedRoomId}/send`, {
                message: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewMessage('');
            mutateMessages();
            mutateRooms();
        } catch (err: any) {
            console.error('Failed to send message', err);
        } finally {
            setIsSending(false);
        }
    };

    const [totalUnread, setTotalUnread] = useState(0);

    useEffect(() => {
        const newTotal = rooms?.reduce((acc: number, r: any) => acc + (r._count?.messages || 0), 0) || 0;
        if (newTotal > totalUnread) {
            // Play notification sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => { });

            // Notification title flash
            const originalTitle = document.title;
            document.title = `(1) Pesan Baru! - DagangPlay`;
            setTimeout(() => { document.title = originalTitle; }, 3000);
        }
        setTotalUnread(newTotal);
    }, [rooms, totalUnread]);

    const filteredRooms = rooms?.filter((room: any) =>
        room.merchant.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    // Prioritize unread rooms, then by date
    const sortedRooms = [...filteredRooms].sort((a: any, b: any) => {
        const aUnread = a._count?.messages || 0;
        const bUnread = b._count?.messages || 0;
        if (aUnread > 0 && bUnread === 0) return -1;
        if (aUnread === 0 && bUnread > 0) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return (
        <AdminLayout>
            <div className="flex bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden h-[calc(100vh-180px)] min-h-[500px] max-h-[850px] relative">
                {/* Left Side: Merchant List */}
                <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
                    <div className="p-4 bg-white">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Live Chat
                        </h2>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                placeholder="Cari merchant..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-white">
                        {roomsError ? (
                            <div className="p-8 text-center">
                                <p className="text-red-500 text-[11px] font-bold">Gagal memuat chat</p>
                                <p className="text-slate-400 text-[9px] mt-1">Cek koneksi backend Bos.</p>
                            </div>
                        ) : !rooms ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs font-medium">Tidak ada chat ditemukan.</div>
                        ) : (
                            filteredRooms.map((room: any) => (
                                <button
                                    key={room.id}
                                    onClick={() => setSelectedRoomId(room.id)}
                                    className={`w-full p-4 flex items-start gap-3 transition-all text-left ${selectedRoomId === room.id ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : 'bg-transparent border-l-4 border-transparent hover:bg-white'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                        {room.merchant.logo ? (
                                            <img src={room.merchant.logo} alt={room.merchant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h3 className={`text-[13px] font-bold truncate ${room._count?.messages > 0 ? 'text-slate-900 underline decoration-indigo-500 decoration-2 underline-offset-4' : 'text-slate-800'}`}>
                                                {room.merchant.name}
                                            </h3>
                                            {room._count?.messages > 0 && (
                                                <span className="flex-shrink-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                                    {room._count?.messages}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className={`text-[11px] truncate flex-1 ${room._count?.messages > 0 ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
                                                {room.lastMessage || 'Belum ada pesan...'}
                                            </p>
                                            <span className="text-[9px] text-slate-400 font-medium ml-2">
                                                {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side: Conversation Area */}
                <div className="hidden md:flex flex-1 flex-col bg-white">
                    {selectedRoomId ? (
                        <>
                            {/* Inner Header */}
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                                        {activeRoom?.merchant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-slate-800 leading-none">{activeRoom?.merchant.name}</h2>
                                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Merchant Online
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Chat View */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
                                style={{ backgroundImage: 'radial-gradient(#e2e8f0 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}
                            >
                                {!activeRoom ? (
                                    <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                                ) : activeRoom.messages.map((msg: any) => (
                                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl p-3 px-4 shadow-sm relative ${msg.isAdmin
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                                            }`}>
                                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                            <div className={`flex items-center justify-end gap-1.5 mt-1 opacity-70`}>
                                                <span className="text-[9px] font-bold uppercase">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.isAdmin && (
                                                    msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-200" /> : <Check className="w-3 h-3" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Form */}
                            <div className="p-4 bg-white border-t border-slate-100">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Kirim jawaban ke merchant..."
                                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSending}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${!newMessage.trim() || isSending ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-slate-800 active:scale-95 shadow-lg shadow-indigo-100'
                                            }`}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                            <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
                                <MessageSquare className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Pilih Merchant</h3>
                            <p className="text-slate-400 text-sm max-w-[280px] mt-2">
                                Klik salah satu merchant di samping untuk mulai membalas pesan bantuan mereka.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
