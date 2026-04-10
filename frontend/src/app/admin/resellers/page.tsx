"use client";
import { getApiUrl } from '@/lib/api';
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search, Filter, Users, Store, MoreVertical, Activity, Plus,
    ShieldAlert, CheckCircle2, DollarSign, X
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function ResellersPage() {
    const [search, setSearch] = useState('');
    const { data: usersData, error, isLoading, mutate } = useSWR((getApiUrl()) + '/admin/users?role=RESELLER&page=1&limit=50', fetcher);

    // Status Modal State
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [statusReason, setStatusReason] = useState('');
    const [newStatus, setNewStatus] = useState<string>('');

    // Balance Modal State
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceType, setBalanceType] = useState<'ADD' | 'DEDUCT'>('ADD');
    const [balanceAmount, setBalanceAmount] = useState<number>(0);
    const [balanceNote, setBalanceNote] = useState('');

    const [toastMsg, setToastMsg] = useState<{ title: string, desc: string, type: 'success' | 'error' } | null>(null);

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleOpenStatus = (user: any, status: string) => {
        setSelectedUser(user);
        setNewStatus(status);
        setStatusReason('');
        setShowStatusModal(true);
    };

    const handleUpdateStatus = async () => {
        try {
            await axios.patch(`${getApiUrl()}/admin/users/${selectedUser.id}/status`,
                { status: newStatus, reason: statusReason },
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            mutate();
            setShowStatusModal(false);
            showToast('Berhasil', `Status reseller ${selectedUser.name} diubah menjadi ${newStatus}`);
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
        }
    };

    const handleOpenBalance = (user: any) => {
        setSelectedUser(user);
        setBalanceType('ADD');
        setBalanceAmount(0);
        setBalanceNote('');
        setShowBalanceModal(true);
    };

    const handleAdjustBalance = async () => {
        if (balanceAmount <= 0) {
            showToast('Gagal', 'Nominal harus lebih dari 0', 'error');
            return;
        }
        try {
            await axios.post(`${getApiUrl()}/admin/users/${selectedUser.id}/balance/adjust`,
                { type: balanceType, amount: Number(balanceAmount), note: balanceNote },
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            mutate();
            setShowBalanceModal(false);
            showToast('Berhasil', `Saldo reseller ${selectedUser.name} berhasil disesuaikan`);
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
        }
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-[#fafafa]">
                {/* Toast Notification */}
                {toastMsg && (
                    <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 flex items-start gap-3 w-80 translate-y-0 transition-transform ${toastMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />}
                        <div>
                            <h4 className={`text-sm font-bold ${toastMsg.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>{toastMsg.title}</h4>
                            <p className={`text-[12px] mt-0.5 ${toastMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{toastMsg.desc}</p>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {showStatusModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Ubah Status Reseller</h3>
                                <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-5">
                                <p className="text-sm text-slate-600 mb-4">Anda akan mengubah status <span className="font-semibold text-slate-800">{selectedUser?.name}</span> menjadi <span className="font-bold">{newStatus}</span>.</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Alasan / Catatan</label>
                                        <textarea
                                            value={statusReason}
                                            onChange={(e) => setStatusReason(e.target.value)}
                                            placeholder="Opsional, misal: pelanggaran sistem"
                                            rows={3}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div className="pt-2 flex justify-end gap-3">
                                        <button onClick={() => setShowStatusModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                        <button onClick={handleUpdateStatus} className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors ${newStatus === 'SUSPENDED' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                            Ya, Ubah Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showBalanceModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Penyesuaian Saldo Pusat</h3>
                                <button onClick={() => setShowBalanceModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[12px] text-slate-500 font-medium">Saldo Saat Ini ({selectedUser?.name})</p>
                                        <p className="text-lg font-bold text-slate-800">Rp {Number(selectedUser?.balance || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Jenis Penyesuaian</label>
                                    <div className="flex gap-3">
                                        <button onClick={() => setBalanceType('ADD')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${balanceType === 'ADD' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>+ Tambah Saldo</button>
                                        <button onClick={() => setBalanceType('DEDUCT')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${balanceType === 'DEDUCT' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>- Kurangi Saldo</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.valueAsNumber || 0)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Catatan / Referensi</label>
                                    <input
                                        type="text"
                                        value={balanceNote}
                                        onChange={(e) => setBalanceNote(e.target.value)}
                                        placeholder="Misal: Koreksi transfer bank"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button onClick={() => setShowBalanceModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                    <button onClick={handleAdjustBalance} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">
                                        Proses Penyesuaian
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                                Manajemen Reseller
                            </h1>
                            <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-2">
                                Atur dan monitoring semua aktivitas Reseller
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={() => showToast('Info', 'Reseller dapat didaftarkan melalui halaman landing page utama atau via Invite Link tenant', 'success')} className="h-10 px-4 rounded-xl font-medium text-sm flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                <Plus className="w-4 h-4" />
                                Reseller Baru
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, hp..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <button className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Filter className="w-4 h-4 text-slate-400" />
                        Filter Lanjutan
                    </button>
                </div>

                {/* Table Data */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden pb-10">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Reseller Info</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Saldo Pusat</th>
                                    <th className="px-6 py-4 font-semibold text-center">Tindakan Cepat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Activity className="w-6 h-6 animate-pulse text-indigo-400" />
                                                <span className="text-sm">Memuat data reseller...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-red-500">
                                            Gagal memuat data reseller.
                                        </td>
                                    </tr>
                                ) : usersData?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                    <Users className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <h3 className="text-slate-800 font-semibold mb-1">Belum ada Reseller</h3>
                                                <p className="text-slate-500 text-sm">Data reseller akan muncul di sini</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    usersData?.data?.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                                        <Store className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                                                        <p className="text-[12px] text-slate-500 truncate w-48">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                        'bg-red-50 text-red-600 border border-red-200'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-slate-700 block">Rp {Number(user.balance).toLocaleString('id-ID')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleOpenBalance(user)} className="px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded border border-slate-200 transition-colors">
                                                        + Saldo
                                                    </button>
                                                    {user.status === 'ACTIVE' ? (
                                                        <button onClick={() => handleOpenStatus(user, 'SUSPENDED')} className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors">
                                                            Suspend
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleOpenStatus(user, 'ACTIVE')} className="px-3 py-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors">
                                                            Aktifkan
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
