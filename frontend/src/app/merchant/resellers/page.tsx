"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Users, Search, Ban, CheckCircle, ShieldCheck, Wallet, Activity, Download, Plus, Minus, X } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantResellersPage() {
    const [search, setSearch] = useState('');
    const [selectedReseller, setSelectedReseller] = useState<any>(null);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [balanceForm, setBalanceForm] = useState({ type: 'ADD', amount: '', notes: '' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', password: '' });

    const { data: resellers, error, isLoading, mutate } = useSWR(
        `http://localhost:3001/merchant/resellers?search=${search}`,
        fetcher
    );

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Konfirmasi mengubah status reseller menjadi ${newStatus}?`)) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`http://localhost:3001/merchant/resellers/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah status');
        }
    };

    const handleBalanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://localhost:3001/merchant/resellers/${selectedReseller.id}/balance`, {
                type: balanceForm.type,
                amount: Number(balanceForm.amount),
                notes: balanceForm.notes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsBalanceModalOpen(false);
            setBalanceForm({ type: 'ADD', amount: '', notes: '' });
            setSelectedReseller(null);
            mutate();
            alert('Sukses mengubah saldo reseller');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyetel saldo');
        }
    };

    const handleAddReseller = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://localhost:3001/merchant/resellers', addForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAddModalOpen(false);
            setAddForm({ name: '', email: '', phone: '', password: '' });
            mutate();
            alert('Sukses mendaftarkan reseller baru!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mendaftar. Data mungkin sudah terpakai.');
        }
    };

    const openBalanceModal = (r: any, type: 'ADD' | 'SUBTRACT') => {
        setSelectedReseller(r);
        setBalanceForm({ ...balanceForm, type, amount: '' });
        setIsBalanceModalOpen(true);
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Reseller</h1>
                    <p className="text-[14px] text-slate-500 mt-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        Kelola data, saldo, dan status para reseller di jaringan toko Anda.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] transition-all hover:-translate-y-0.5 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Undang Reseller
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, hp reseller..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                    ) : error ? (
                        <div className="p-10 text-center text-red-500 font-bold">Gagal memuat data reseller.</div>
                    ) : !resellers || resellers.length === 0 ? (
                        <div className="p-20 text-center">
                            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">Tidak ada reseller ditemukan</h3>
                            <p className="text-slate-500 mt-1">Belum ada reseller yang mendaftar ke toko Anda.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Profil Reseller</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Saldo</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Pesanan</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status / Waktu</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi Manual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {resellers.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {r.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-slate-800">{r.name}</p>
                                                    <p className="text-[12px] text-slate-500">{r.email} • {r.phone || 'No HP'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="text-[14px] font-black text-slate-700">Rp {Number(r.balance).toLocaleString('id-ID')}</span>
                                                <div className="flex gap-1 mt-1">
                                                    <button onClick={() => openBalanceModal(r, 'ADD')} className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-[10px] font-bold flex items-center gap-1 group relative">
                                                        <Plus className="w-3 h-3" /> Topup
                                                    </button>
                                                    <button onClick={() => openBalanceModal(r, 'SUBTRACT')} className="p-1 bg-red-50 text-red-500 hover:bg-red-100 rounded text-[10px] font-bold flex items-center gap-1 group relative">
                                                        <Minus className="w-3 h-3" /> Potong
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">{r.totalOrders}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.status === 'ACTIVE' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100 mb-1">
                                                    <CheckCircle className="w-3 h-3" /> Aktif
                                                </span>
                                            ) : r.status === 'SUSPENDED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold border border-red-100 mb-1">
                                                    <Ban className="w-3 h-3" /> Suspended
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold border border-amber-100 mb-1">
                                                    <Activity className="w-3 h-3" /> {r.status}
                                                </span>
                                            )}
                                            <p className="text-[11px] text-slate-400 mt-1">Gabung: {new Date(r.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {r.status === 'ACTIVE' ? (
                                                    <button onClick={() => handleUpdateStatus(r.id, 'SUSPENDED')} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Suspend Reseller">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleUpdateStatus(r.id, 'ACTIVE')} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Aktifkan Uang">
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-bold rounded-lg transition-all">
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Balance Modal */}
            {isBalanceModalOpen && selectedReseller && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative transform transition-all">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Wallet className={`w-5 h-5 ${balanceForm.type === 'ADD' ? 'text-emerald-500' : 'text-red-500'}`} />
                                {balanceForm.type === 'ADD' ? 'Topup Saldo Reseller' : 'Potong Saldo Reseller'}
                            </h3>
                            <button onClick={() => setIsBalanceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleBalanceSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-[12px] font-bold text-slate-500 mb-1">Reseller Tujuan</label>
                                <p className="font-bold text-slate-800">{selectedReseller.name} <span className="text-slate-400 font-normal">({selectedReseller.email})</span></p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-[12px] font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    value={balanceForm.amount}
                                    onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="0"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-[12px] font-bold text-slate-500 mb-1">Catatan / Alasan</label>
                                <input
                                    type="text"
                                    required
                                    value={balanceForm.notes}
                                    onChange={(e) => setBalanceForm({ ...balanceForm, notes: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="Misal: Topup manual via transfer BCA"
                                />
                            </div>

                            <button type="submit" className={`w-full py-3.5 rounded-xl font-bold text-white shadow-md transition-all hover:-translate-y-0.5 ${balanceForm.type === 'ADD' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}>
                                Konfirmasi {balanceForm.type === 'ADD' ? 'Topup' : 'Potong'} Saldo
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Reseller Manual */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative transform transition-all">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-500" />
                                Undang / Tambah Reseller
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAddReseller} className="p-6">
                            <div className="mb-4">
                                <label className="block text-[12px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="Nama Reseller"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[12px] font-bold text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={addForm.email}
                                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="email@contoh.com"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[12px] font-bold text-slate-500 mb-1">Nomor WhatsApp / HP</label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.phone}
                                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="08123456789"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-[12px] font-bold text-slate-500 mb-1">Password Awal</label>
                                <input
                                    type="password"
                                    required
                                    value={addForm.password}
                                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button type="submit" className={`w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5`}>
                                Daftarkan Reseller
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
