"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Network,
    Users,
    Trophy,
    Wallet,
    ArrowRight,
    TrendingDown,
    Layers,
    Award,
    Plus
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function CommissionsManagementPage() {
    const [activeTab, setActiveTab] = useState<'PENDING' | 'LEVELS' | 'TREE'>('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    const [showLevelModal, setShowLevelModal] = useState(false);
    const [levelForm, setLevelForm] = useState({ name: '', minTransaction: 0, minRevenue: 0, commissionBonus: 0, badge: 'Silver' });

    // SWR Calls
    const { data: pendingComms, isLoading: loadingPending, mutate: mutatePending } = useSWR(
        activeTab === 'PENDING' ? `http://localhost:3001/admin/commissions/pending?search=${searchTerm}` : null,
        fetcher
    );

    const { data: levels, isLoading: loadingLevels, mutate: mutateLevels } = useSWR(
        activeTab === 'LEVELS' ? 'http://localhost:3001/admin/commissions/levels' : null,
        fetcher
    );

    const { data: tree, isLoading: loadingTree } = useSWR(
        activeTab === 'TREE' ? 'http://localhost:3001/admin/commissions/tree' : null,
        fetcher
    );

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleSettleSingle = async (id: string) => {
        if (!confirm('Pencairan komisi ini ke saldo dompet User?')) return;
        try {
            await axios.post(`http://localhost:3001/admin/commissions/${id}/settle`);
            mutatePending();
            showToast('Selesai', 'Komisi telah dicairkan ke dompet User.');
        } catch (err: any) {
            showToast('Error', err.response?.data?.message || 'Gagal', 'error');
        }
    };

    const handleBulkSettle = async () => {
        if (!confirm('Proses SEMUA komisi berstatus PENDING sekaligus ke saldo masing-masing user? Pastikan cashflow tersedia.')) return;
        try {
            const res = await axios.post(`http://localhost:3001/admin/commissions/bulk-settle`);
            mutatePending();
            showToast('Bulk Settle', res.data.message);
        } catch (err: any) {
            showToast('Error', err.response?.data?.message || 'Gagal multi-settle', 'error');
        }
    };

    const submitCreateLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/admin/commissions/levels', levelForm);
            mutateLevels();
            setShowLevelModal(false);
            showToast('Berhasil', 'Level Reseller Baru ditambahkan.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    return (
        <AdminLayout>
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

            {/* CREATE LEVEL MODAL */}
            {showLevelModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Tambah Level Reseller</h3>
                        <p className="text-sm text-slate-500 mb-4">Pengaturan tingkatan komisi. Pastikan nama ID unik (Misal: PLATINUM_MEMBER)</p>
                        <form onSubmit={submitCreateLevel}>
                            <div className="space-y-4 mb-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-600">Kode Nama Level</label>
                                    <input required value={levelForm.name} onChange={e => setLevelForm({ ...levelForm, name: e.target.value })} className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" placeholder="DIAMOND" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600">Min Trx (Syarat)</label>
                                        <input type="number" required value={levelForm.minTransaction} onChange={e => setLevelForm({ ...levelForm, minTransaction: Number(e.target.value) })} className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600">Bonus Komisi %</label>
                                        <input type="number" step="0.01" required value={levelForm.commissionBonus} onChange={e => setLevelForm({ ...levelForm, commissionBonus: Number(e.target.value) })} className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowLevelModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg">Batal</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Komisi & Reseller</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Kelola Multi-Level Marketing (MLM), penarikan saldo, & tingkatan rank Reseller.</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-1 border-b border-slate-200 mb-6 bg-white shrink-0 scrollbar-hide overflow-x-auto">
                <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`px-5 py-3 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'PENDING' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    <Wallet className="w-4 h-4" /> Distribusi Komisi
                </button>
                <button
                    onClick={() => setActiveTab('LEVELS')}
                    className={`px-5 py-3 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'LEVELS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    <Trophy className="w-4 h-4" /> Pengaturan Rank / Leveling
                </button>
                <button
                    onClick={() => setActiveTab('TREE')}
                    className={`px-5 py-3 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'TREE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    <Network className="w-4 h-4" /> Jaringan Downline (MLM)
                </button>
            </div>

            {/* TAB PENDING COMMISSIONS */}
            {activeTab === 'PENDING' && (
                <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari user pencari untung..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:border-indigo-400"
                            />
                        </div>
                        <button onClick={handleBulkSettle} className="px-4 py-2 font-bold text-[13px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Cairkan Bulk Seluruhnya
                        </button>
                    </div>

                    {loadingPending && <div className="flex py-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}

                    {!loadingPending && pendingComms && (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Penerima Komisi</th>
                                    <th className="px-6 py-4">Sumber Pesanan</th>
                                    <th className="px-6 py-4 text-right">Nominal Rp</th>
                                    <th className="px-6 py-4 text-center">Status Dompet</th>
                                    <th className="px-6 py-4 text-right">Aksi Manual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingComms.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800 text-[13px]">{c.user.name}</p>
                                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">{c.user.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[12px] text-slate-600">{c.order.productName}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">Invoice: {c.order.orderNumber}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[14px] font-bold text-emerald-600">
                                            Rp {Number(c.amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] px-2 py-1 rounded bg-amber-50 text-amber-600 font-bold border border-amber-200">HOLD PENDING</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleSettleSingle(c.id)} className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md transition-colors">
                                                Settle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingComms.length === 0 && (
                                    <tr><td colSpan={5} className="py-10 text-center text-slate-500 text-sm">Tidak ada komisi PENDING. Keuangan Sehat.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TAB LEVELS */}
            {activeTab === 'LEVELS' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                        <div>
                            <h3 className="font-bold text-indigo-900 text-lg">Struktur Penjenjangan (Rank)</h3>
                            <p className="text-sm text-indigo-700 mt-1 max-w-lg">Atur syarat Reseller bisa naik level (Bronze ke Silver, dst) dan atur berapa ekstra komisi tambahan yang mereka dapatkan per penjualan.</p>
                        </div>
                        <button onClick={() => setShowLevelModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg flex gap-2"><Plus className="w-4 h-4" /> Buat Rank Baru</button>
                    </div>

                    {loadingLevels ? (
                        <div className="flex items-center justify-center p-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
                    ) : levels ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {levels.map((lvl: any, idx: number) => (
                                <div key={lvl.id} className="bg-white border text-center border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                    <Award className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase">{lvl.name}</h4>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tier Level {idx + 1}</p>

                                    <div className="mt-6 space-y-3">
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-left">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Syarat Minimum Trx</p>
                                            <p className="text-sm font-bold text-slate-700">{lvl.minTransaction} Pesanan Sukses</p>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-left bg-emerald-50/50">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Benefit Tambahan Komisi</p>
                                            <p className="text-sm font-bold text-emerald-700">+{Number(lvl.commissionBonus)}% per Transaksi</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}

            {/* TAB TREE MLM */}
            {activeTab === 'TREE' && (
                <div className="bg-slate-50 min-h-[500px] border border-slate-200 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
                        <Network className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Visualisasi Node Jaringan</h2>
                    <p className="text-slate-500 max-w-md mx-auto mt-2 text-sm leading-relaxed block">
                        Struktur multi-level Downline-Upline saat ini berjalan di latar belakang API, dan teralokasi otomatis setiap pesanan. Untuk mendraw Tree berbasis D3.js atau library kanvas, diperlukan render *client-side* visual.
                    </p>

                    <div className="mt-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-left w-full max-w-lg">
                        <h4 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-500" /> Log Relasi Upline {'>'} Downline (Data Raw)</h4>
                        {loadingTree ? <Loader2 className="animate-spin text-slate-400 mx-auto my-4" /> : null}
                        {tree && tree.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {tree.map((t: any) => (
                                    <div key={t.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100 text-sm">
                                        <span className="font-bold text-indigo-700 w-32 truncate">{t.parent.name}</span>
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                        <span className="font-bold text-emerald-600 truncate flex-1">{t.child.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : !loadingTree && (
                            <p className="text-xs text-slate-500 text-center py-4">Sistem MLM belum memiliki record node user (Kosong).</p>
                        )}
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
