"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Server,
    ActivitySquare,
    RefreshCw,
    WalletCards,
    History,
    Settings2,
    AlertCircle,
    Loader2,
    CheckCircle2,
    ChevronRight,
    Plus
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function SupplierManagementPage() {
    const [isPinging, setIsPinging] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // States
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [topupAmount, setTopupAmount] = useState('');
    const [topupNote, setTopupNote] = useState('');

    const { data: suppliers, error, isLoading, mutate } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/suppliers', fetcher);

    const testConnection = async (id: string, code: string) => {
        setIsPinging(id);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/suppliers/${id}/test-connection`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            setToastMsg({
                title: 'Koneksi API Berhasil',
                desc: `Saldo API / ${code} saat ini: Rp ${Number(res.data.balance).toLocaleString('id-ID')}`,
                type: 'success'
            });
            mutate();
        } catch (err: any) {
            setToastMsg({
                title: 'Koneksi Gagal',
                desc: err.response?.data?.message || 'Server Error',
                type: 'error'
            });
        } finally {
            setIsPinging(null);
            setTimeout(() => setToastMsg(null), 5000);
        }
    };

    const handleTopupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplierId || !topupAmount) return;

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/suppliers/${selectedSupplierId}/topup`, {
                amount: Number(topupAmount),
                note: topupNote
            });
            setToastMsg({
                title: 'Topup Lokal Berhasil',
                desc: `Saldo supplier telah didepositkan sebesar Rp ${Number(topupAmount).toLocaleString('id-ID')}`,
                type: 'success'
            });
            setShowTopupModal(false);
            setTopupAmount('');
            setTopupNote('');
            mutate();
        } catch (err: any) {
            setToastMsg({
                title: 'Gagal Topup',
                desc: err.response?.data?.message || 'Server Error',
                type: 'error'
            });
        } finally {
            setTimeout(() => setToastMsg(null), 5000);
        }
    };

    const openTopup = (id: string) => {
        setSelectedSupplierId(id);
        setShowTopupModal(true);
    };

    return (
        <AdminLayout>
            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 border ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200/60 text-emerald-800' : 'bg-red-50 border-red-200/60 text-red-800'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                        <div>
                            <p className="font-bold text-sm">{toastMsg.title}</p>
                            <p className="text-[13px] opacity-90 mt-0.5">{toastMsg.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TOPUP */}
            {showTopupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800">Topup Saldo Master</h2>
                        <p className="text-sm text-slate-500 mt-1 mb-6">Tambah catatan saldo untuk supplier API yang terhubung.</p>

                        <form onSubmit={handleTopupSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        value={topupAmount}
                                        onChange={(e) => setTopupAmount(e.target.value)}
                                        required
                                        placeholder="Contoh: 5000000"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan</label>
                                    <input
                                        type="text"
                                        value={topupNote}
                                        onChange={(e) => setTopupNote(e.target.value)}
                                        placeholder="Transfer via BCA..."
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowTopupModal(false)} className="px-5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100">Batal</button>
                                <button type="submit" className="px-5 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700">Submit Topup</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Supplier</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Kelola koneksi API master (Digiflazz, VIP, dll), cek saldo, dan riwayat topup.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[38px] px-4 inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg bg-indigo-600 border border-transparent text-white hover:bg-indigo-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Tambah Integrasi API Baru
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading && (
                    <div className="flex flex-col flex-1 items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-medium">Memuat data supplier...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="p-8 text-center bg-white rounded-2xl border border-red-100 text-red-500 font-medium text-sm">
                        Koneksi Backend Gagal. Error Server.
                    </div>
                )}

                {!isLoading && !error && suppliers && suppliers.map((supplier: any) => (
                    <div key={supplier.id} className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-8 group">
                        {/* Left Info */}
                        <div className="flex items-center gap-5 w-full md:w-auto">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] flex items-center justify-center">
                                <Server className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-slate-800">{supplier.name}</h3>
                                    {supplier.status === 'ACTIVE' && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE</span>}
                                    {supplier.status === 'MAINTENANCE' && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/50 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> MT</span>}
                                </div>
                                <p className="text-sm text-slate-500 mt-1 font-mono uppercase tracking-wide">API CODE: {supplier.code}</p>
                                {supplier.lastSyncAt && (
                                    <p className="text-[12px] text-slate-400 mt-1 flex items-center gap-1">
                                        Terakhir daping: {new Date(supplier.lastSyncAt).toLocaleString('id-ID')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Stats & Actions */}
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                            <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-100 flex-1 w-full md:min-w-[200px] text-right">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Master API</p>
                                <p className="text-2xl font-bold text-slate-800">Rp {Number(supplier.balance || 0).toLocaleString('id-ID')}</p>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => testConnection(supplier.id, supplier.code)}
                                    disabled={isPinging === supplier.id}
                                    className="flex-1 md:flex-none h-11 px-4 text-[13px] font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200/60 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <ActivitySquare className={`w-4 h-4 ${isPinging === supplier.id ? 'animate-pulse' : ''}`} />
                                    Ping Saldo API
                                </button>
                                <button
                                    onClick={() => openTopup(supplier.id)}
                                    className="flex-1 md:flex-none h-11 px-4 text-[13px] font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <WalletCards className="w-4 h-4" />
                                    Deposit
                                </button>
                                <button className="h-11 w-11 flex items-center justify-center bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm">
                                    <Settings2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
