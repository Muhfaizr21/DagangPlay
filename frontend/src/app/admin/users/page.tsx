"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    ShieldCheck,
    Ban,
    PauseCircle,
    PlayCircle,
    Download,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Wallet,
    LogOut,
    UserCog
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // States for Balance Modal
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [balanceType, setBalanceType] = useState<'ADD' | 'DEDUCT'>('ADD');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceNote, setBalanceNote] = useState('');

    // Fetch Data
    const { data: fetchResult, error, isLoading, mutate } = useSWR(
        `http://localhost:3001/admin/users?search=${searchTerm}&role=${roleFilter}&status=${statusFilter}&page=${page}&limit=20`,
        fetcher
    );
    const users = fetchResult?.data || [];
    const meta = fetchResult?.meta;

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            if (!confirm(`Ubah status user menjadi ${newStatus}?`)) return;
            await axios.patch(`http://localhost:3001/admin/users/${id}/status`, { status: newStatus });
            mutate();
            setToastMsg({ title: 'Berhasil', desc: `Status diubah menjadi ${newStatus}`, type: 'success' });
        } catch (err: any) {
            setToastMsg({ title: 'Error', desc: err.response?.data?.message || 'Gagal update status', type: 'error' });
        } finally {
            setTimeout(() => setToastMsg(null), 3000);
        }
    };

    const handleForceLogout = async (id: string) => {
        try {
            if (!confirm(`Paksa logout semua sesi aktif user ini?`)) return;
            const res = await axios.post(`http://localhost:3001/admin/users/${id}/sessions/force-logout`, {}, { headers: { Authorization: `Bearer \${localStorage.getItem('admin_token')}` } });
            setToastMsg({ title: 'Berhasil Logout', desc: `${res.data.revoked} Sesi aktif dihapus`, type: 'success' });
        } catch (err: any) {
            setToastMsg({ title: 'Error', desc: err.response?.data?.message || 'Gagal force logout', type: 'error' });
        } finally {
            setTimeout(() => setToastMsg(null), 3000);
        }
    };

    const handleBalanceAdjustSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !balanceAmount || !balanceNote) return;

        try {
            await axios.post(`http://localhost:3001/admin/users/${selectedUserId}/balance/adjust`, {
                type: balanceType,
                amount: Number(balanceAmount),
                note: balanceNote
            });
            mutate();
            setToastMsg({ title: 'Saldo Diupdate', desc: `Berhasil mengubah saldo user secara manual`, type: 'success' });
            setShowBalanceModal(false);
            setBalanceAmount('');
            setBalanceNote('');
        } catch (err: any) {
            setToastMsg({ title: 'Gagal', desc: err.response?.data?.message || 'Error update saldo', type: 'error' });
        } finally {
            setTimeout(() => setToastMsg(null), 3000);
        }
    };

    const openBalanceModal = (id: string) => {
        setSelectedUserId(id);
        setShowBalanceModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-bold tracking-wider">ACTIVE</span>;
            case 'PENDING_VERIFICATION': return <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200/60 text-[10px] font-bold tracking-wider">PENDING VERIF</span>;
            case 'SUSPENDED': return <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-red-200/60 text-[10px] font-bold tracking-wider">SUSPENDED</span>;
            case 'BANNED': return <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 border border-slate-300/60 text-[10px] font-bold tracking-wider">BANNED</span>;
            default: return null;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return <span className="text-purple-600 font-bold text-[11px] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Super Admin</span>;
            case 'MERCHANT': return <span className="text-indigo-600 font-bold text-[11px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Merchant</span>;
            case 'RESELLER': return <span className="text-blue-600 font-bold text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Reseller</span>;
            case 'CUSTOMER': return <span className="text-slate-500 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Customer</span>;
            default: return <span className="text-slate-500 font-bold text-[11px]">{role}</span>;
        }
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

            {/* MODAL BALANCE ADJUSTMENT */}
            {showBalanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800">Ubah Saldo Manual</h2>
                        <p className="text-sm text-slate-500 mt-1 mb-6">Penambahan atau pengurangan saldo ini akan tercatat di Audit Log.</p>

                        <form onSubmit={handleBalanceAdjustSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tipe Mutasi</label>
                                    <select
                                        value={balanceType}
                                        onChange={(e: any) => setBalanceType(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="ADD">Tambah Saldo (+)</option>
                                        <option value="DEDUCT">Kurangi Saldo (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.value)}
                                        required
                                        placeholder="Contoh: 50000"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Alasan / Catatan wajib</label>
                                    <input
                                        type="text"
                                        required
                                        value={balanceNote}
                                        onChange={(e) => setBalanceNote(e.target.value)}
                                        placeholder="Salah transfer deposit / refund otomatis gagal..."
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowBalanceModal(false)} className="px-5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100">Batal</button>
                                <button type="submit" className={`px-5 py-2 rounded-lg font-medium text-white ${balanceType === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                    Proses Eksekusi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen User</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Kelola data seluruh role user (Customer, Reseller, Merchant, Super Admin).</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[38px] px-4 inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden min-h-[400px]">
                {/* Table Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Cari Nama atau Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">Semua Role</option>
                                <option value="CUSTOMER">Customer</option>
                                <option value="RESELLER">Reseller</option>
                                <option value="MERCHANT">Merchant</option>
                            </select>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="ACTIVE">Aktif</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="BANNED">Banned</option>
                        </select>
                    </div>
                </div>

                {/* Loading / Error States */}
                {isLoading && (
                    <div className="flex flex-col flex-1 items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-medium">Memuat data user...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="p-8 text-center text-red-500 font-medium text-sm">
                        Koneksi Backend Gagal. Error Server.
                    </div>
                )}

                {/* Table Data */}
                {!isLoading && !error && users && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Data Pengguna</th>
                                    <th className="px-6 py-4">Role & Status</th>
                                    <th className="px-6 py-4 text-right">Saldo & Transaksi</th>
                                    <th className="px-6 py-4 text-center">Bergabung</th>
                                    <th className="px-6 py-4 text-right">Aksi Cepat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm overflow-hidden">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-slate-800 tracking-tight gap-2 flex items-center">
                                                        {user.name}
                                                        {user.isVerified && (
                                                            <span title="Akun Terverifikasi">
                                                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-[12px] font-medium text-indigo-500 mt-0.5" title={user.email}>{user.email}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 px-1 py-0.5 bg-slate-100 inline-block rounded">{user.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1.5">
                                                {getRoleBadge(user.role)}
                                                {getStatusBadge(user.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-[14px] font-bold text-emerald-600">Rp {Number(user.balance).toLocaleString('id-ID')}</p>
                                            <p className="text-[11px] text-slate-500 font-medium">{user._count?.ordersAsCustomer + user._count?.ordersAsReseller} Trx total</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-[12px] text-slate-500 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                {/* Wallet Adjustment */}
                                                <button onClick={() => openBalanceModal(user.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all" title="Atur Saldo Manual">
                                                    <Wallet className="w-4 h-4" />
                                                </button>

                                                {/* Force Logout */}
                                                <button onClick={() => handleForceLogout(user.id)} className="p-1.5 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-all" title="Force Logout Semua Device">
                                                    <LogOut className="w-4 h-4" />
                                                </button>

                                                {/* Status Toggles */}
                                                {user.status === 'ACTIVE' && (
                                                    <button onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')} className="p-1.5 text-amber-500 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-all" title="Suspend Sementara">
                                                        <PauseCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {user.status === 'SUSPENDED' && (
                                                    <button onClick={() => handleUpdateStatus(user.id, 'ACTIVE')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-all" title="Aktifkan Kembali">
                                                        <PlayCircle className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="p-10 text-center text-slate-500 font-medium text-sm">
                                Tidak ada user yang ditemukan dengan filter tersebut.
                            </div>
                        )}

                        {meta && meta.totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-sm text-slate-500 font-medium">
                                    Hal {meta.currentPage} dari {meta.totalPages} <span className="text-slate-400">({meta.totalItems} user)</span>
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="px-4 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:hover:text-slate-600"
                                    >Prev</button>
                                    <button
                                        disabled={page === meta.totalPages}
                                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                        className="px-4 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:hover:text-slate-600"
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
