"use client";
import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
    Shield, 
    Zap, 
    Megaphone, 
    Tag, 
    ArrowRight, 
    AlertTriangle, 
    CheckCircle2, 
    Loader2,
    RefreshCw
} from 'lucide-react';

const fetcher = async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
};

export default function ControlCenterPage() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    // --- State for Forms ---
    const [marginAmount, setMarginAmount] = useState(0);
    const [marginTier, setMarginTier] = useState('ALL');
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(''); // 'margin', 'broadcast', 'mapping'
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // --- Fetch Mappings ---
    const { data: mappings, isLoading: mapsLoading } = useSWR(`${baseUrl}/admin/subscriptions/plans/mappings`, fetcher);

    const handleMarginAdjust = async () => {
        if (!confirm(`Yakin ingin mengubah margin seluruh produk sebesar Rp ${marginAmount}?`)) return;
        setIsSubmitting('margin');
        try {
            await axios.post(`${baseUrl}/admin/digiflazz/margin-adjust`, {
                amount: marginAmount,
                type: marginTier
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setStatus({ type: 'success', msg: `Berhasil menyesuaikan margin untuk tier ${marginTier}.` });
            setMarginAmount(0);
        } catch (e: any) {
            setStatus({ type: 'error', msg: e.response?.data?.message || 'Gagal mengubah margin.' });
        } finally {
            setIsSubmitting('');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg) return;
        if (!confirm('Kirim pesan ini ke SELURUH merchant aktif?')) return;
        setIsSubmitting('broadcast');
        try {
            const res = await axios.post(`${baseUrl}/admin/marketing/broadcast`, {
                message: broadcastMsg
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setStatus({ type: 'success', msg: `Broadcast terkirim ke ${res.data.sent}/${res.data.total} merchant.` });
            setBroadcastMsg('');
        } catch (e: any) {
            setStatus({ type: 'error', msg: e.response?.data?.message || 'Gagal mengirim broadcast.' });
        } finally {
            setIsSubmitting('');
        }
    };

    const handleUpdateMapping = async (id: string, newTier: string) => {
        setIsSubmitting(`map-${id}`);
        try {
            await axios.patch(`${baseUrl}/admin/subscriptions/plans/mappings/${id}`, {
                tier: newTier
            }, { headers: { Authorization: `Bearer ${token}` } });
            mutate(`${baseUrl}/admin/subscriptions/plans/mappings`);
            setStatus({ type: 'success', msg: 'Mapping plan berhasil diperbarui.' });
        } catch (e: any) {
            setStatus({ type: 'error', msg: 'Gagal update mapping.' });
        } finally {
            setIsSubmitting('');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight transition-all">Control Room <span className="text-indigo-600">Sistem</span></h1>
                </div>
                <p className="text-sm text-slate-500 font-medium">Alat pemeliharaan global untuk manajemen harga dan komunikasi merchant.</p>
            </div>

            {status && (
                <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <p className="text-sm font-bold flex-1">{status.msg}</p>
                    <button onClick={() => setStatus(null)} className="text-[10px] uppercase font-black opacity-50 hover:opacity-100 italic">Tutup</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. PRICING CONTROL ROOM */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-slate-800">Global Pricing Strategy</h3>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Pricing Adjuster</span>
                    </div>
                    <div className="p-8 space-y-8 flex-1">
                        <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Bulk Margin Adjuster</label>
                            <p className="text-xs text-slate-500 mb-6 bg-amber-50 p-3 rounded-lg border border-amber-100 leading-relaxed italic">
                                Gunakan fitur ini untuk menaikkan/menurunkan margin seluruh produk secara massal jika supplier (Digiflazz) menaikkan harga modal.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                    <label className="text-[11px] font-bold ml-1">Nominal (Rp)</label>
                                    <input 
                                        type="number" 
                                        value={marginAmount}
                                        onChange={(e) => setMarginAmount(parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Contoh: 100"
                                    />
                                </div>
                                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                    <label className="text-[11px] font-bold ml-1">Target Tier</label>
                                    <select 
                                        value={marginTier}
                                        onChange={(e) => setMarginTier(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="ALL">Seluruh Tier</option>
                                        <option value="PRO">Hanya PRO</option>
                                        <option value="LEGEND">Hanya LEGEND</option>
                                        <option value="SUPREME">Hanya SUPREME</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                onClick={handleMarginAdjust}
                                disabled={isSubmitting === 'margin' || marginAmount === 0}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                            >
                                {isSubmitting === 'margin' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                Eksekusi Penyesuaian Massal
                            </button>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Tier Mapping Interface</label>
                            {mapsLoading ? <div className="animate-pulse h-40 bg-slate-50 rounded-xl" /> : (
                                <div className="space-y-3">
                                    {mappings?.map((m: any) => (
                                        <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-indigo-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm">
                                                    {m.plan.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-800 leading-none">{m.plan}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">SaaS Plan Level</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="w-4 h-4 text-slate-300 mr-2" />
                                                <select 
                                                    value={m.tier}
                                                    disabled={isSubmitting.startsWith('map')}
                                                    onChange={(e) => handleUpdateMapping(m.id, e.target.value)}
                                                    className="bg-white border border-slate-200 text-xs font-black text-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm group-hover:border-indigo-300"
                                                >
                                                    <option value="PRO">Tier: PRO</option>
                                                    <option value="LEGEND">Tier: LEGEND</option>
                                                    <option value="SUPREME">Tier: SUPREME</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. ANNOUNCEMENT CENTER */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-fit">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <Megaphone className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-slate-800">Broadcast Center</h3>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">WhatsApp Global</span>
                    </div>
                    <div className="p-8">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">WhatsApp Global Announcement</label>
                        <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">
                            Kirim pesan instan ke seluruh merchant aktif. Gunakan fitur ini untuk info maintenance, gangguan supplier, atau promo admin.
                        </p>
                        <div className="relative mb-6">
                            <textarea 
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                rows={8}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-300 placeholder:italic"
                                placeholder="Contoh: Halo para Merchant, mohon perhatiannya. Kami akan melakukan maintenance pada pukul 00.00 WIB..."
                            ></textarea>
                            <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-md border border-slate-100">
                                {broadcastMsg.length} Karakter
                            </div>
                        </div>
                        <button 
                            onClick={handleBroadcast}
                            disabled={isSubmitting === 'broadcast' || !broadcastMsg}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer group"
                        >
                            {isSubmitting === 'broadcast' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                            Sebarkan Pengumuman ke All Merchants
                        </button>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
