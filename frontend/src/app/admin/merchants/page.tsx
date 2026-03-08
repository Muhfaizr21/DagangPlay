"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    Plus,
    ShieldCheck,
    Ban,
    PauseCircle,
    PlayCircle,
    Download,
    ExternalLink,
    Crown,
    Loader2,
    CheckCircle2,
    Eye,
    Settings,
    KeyRound
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function MerchantManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState<{ title: string, desc: string, type: 'success' | 'error' } | null>(null);

    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [settingsForm, setSettingsForm] = useState<any>({
        platformFee: 0,
        allowCustomDomain: false,
        isMaintenance: false,
        customDomainStatus: 'PENDING'
    });

    const { data: merchants, error, isLoading, mutate } = useSWR(
        `http://localhost:3001/admin/merchants?search=${searchTerm}&status=${statusFilter}`,
        fetcher
    );

    const { data: merchantDetail, error: detailError, isLoading: loadingDetail, mutate: mutateDetail } = useSWR(
        selectedMerchantId ? `http://localhost:3001/admin/merchants/${selectedMerchantId}` : null,
        fetcher,
        {
            onSuccess: (data) => {
                const sets = data.settings || {};
                setSettingsForm({
                    platformFee: sets.platformFee || 0,
                    allowCustomDomain: sets.allowCustomDomain || false,
                    isMaintenance: sets.isMaintenance || false,
                    customDomainStatus: sets.customDomainStatus || 'NONE'
                });
            }
        }
    );

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    }

    const handleUpdateStatus = async (id: string, newStatus: string, actionName: string) => {
        try {
            if (confirm(`Apakah Anda yakin ingin melakukan aksi "${actionName}" pada toko ini?`)) {
                await axios.patch(`http://localhost:3001/admin/merchants/${id}/status`, { status: newStatus });
                mutate();
                if (selectedMerchantId === id) mutateDetail();
                showToast('Status Diperbarui', `Status merchant menjadi ${newStatus}`);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah status');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMerchantId) return;
        try {
            await axios.patch(`http://localhost:3001/admin/merchants/${selectedMerchantId}/settings`, settingsForm);
            mutateDetail();
            showToast('Tersimpan', `Pengaturan Merchant sukses diubah.`);
        } catch (err: any) {
            showToast('Error', err.response?.data?.message || 'Server Error', 'error');
        }
    };

    const handleResetPassword = async (id: string) => {
        if (!confirm('Reset password Owner menjadi "DagangPlay123!" ?')) return;
        try {
            const res = await axios.post(`http://localhost:3001/admin/merchants/${id}/reset-password`);
            showToast('Berhasil', res.data.message);
        } catch (err: any) {
            showToast('Error', err.response?.data?.message || 'Gagal reset password', 'error');
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-bold tracking-wider">ACTIVE</span>;
            case 'PENDING_REVIEW': return <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200/60 text-[10px] font-bold tracking-wider">PENDING REVIEW</span>;
            case 'SUSPENDED': return <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200/60 text-[10px] font-bold tracking-wider">SUSPENDED</span>;
            case 'INACTIVE': return <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-500 border border-slate-300/60 text-[10px] font-bold tracking-wider">INACTIVE</span>;
            default: return null;
        }
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'ENTERPRISE': return <span className="text-indigo-600 font-bold text-[11px] flex items-center gap-1"><Crown className="w-3 h-3" /> Enterprise</span>;
            case 'PROFESSIONAL': return <span className="text-blue-600 font-bold text-[11px]">Professional</span>;
            case 'STARTER': return <span className="text-emerald-600 font-bold text-[11px]">Starter</span>;
            case 'FREE': return <span className="text-slate-500 font-bold text-[11px]">Free Plan</span>;
            default: return <span className="text-slate-500 font-bold text-[11px]">{plan}</span>;
        }
    };

    return (
        <AdminLayout>
            {toastMsg && (
                <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700' : 'bg-red-50 border-red-200/60 text-red-700'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                        <div>
                            <p className="font-bold text-sm">{toastMsg.title}</p>
                            <p className="text-[13px] opacity-90">{toastMsg.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL DRAWER */}
            {selectedMerchantId && (
                <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm flex justify-end">
                    <div className="w-full max-w-2xl bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right-8">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Detail Merchant</h2>
                                {merchantDetail && <p className="text-xs text-indigo-600 font-mono mt-1 font-bold">{merchantDetail.name} • {merchantDetail.domain}</p>}
                            </div>
                            <button onClick={() => setSelectedMerchantId(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetail ? (
                                <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : merchantDetail ? (
                                <div className="space-y-8">
                                    {/* Profil Owner */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Informasi Owner</h3>
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{merchantDetail.owner?.name}</p>
                                                <p className="text-xs text-slate-500">{merchantDetail.owner?.email}</p>
                                            </div>
                                            <button onClick={() => handleResetPassword(merchantDetail.id)} className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                                                <KeyRound className="w-3.5 h-3.5" /> Force Reset Pass
                                            </button>
                                        </div>
                                    </div>

                                    {/* Statistik Omset & Reseller */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Kinerja Tenant</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Omset</p>
                                                <p className="text-lg font-bold text-emerald-600">Rp {(merchantDetail.omset || 0).toLocaleString('id-ID')}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reseller Aktif</p>
                                                <p className="text-lg font-bold text-indigo-600">{merchantDetail.resellersCount || 0}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Transaksi</p>
                                                <p className="text-lg font-bold text-slate-700">{merchantDetail._count?.orders || 0}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiket Support</p>
                                                <p className="text-lg font-bold text-slate-700">{merchantDetail._count?.tickets || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Settings (Platform Fee, Custom Domain, dll) */}
                                    <form onSubmit={handleSaveSettings} className="bg-white border text-sm border-indigo-100 shadow-sm rounded-xl overflow-hidden p-5">
                                        <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-4"><Settings className="w-4 h-4" /> Pengaturan Sistem (Override)</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Platform Fee (%)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number" min="0" max="100"
                                                        value={settingsForm.platformFee}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, platformFee: Number(e.target.value) })}
                                                        className="w-full border border-slate-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1">Potongan bagi hasil untuk Super Admin dari setiap trx berhasil merchant ini.</p>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100">
                                                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settingsForm.allowCustomDomain}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, allowCustomDomain: e.target.checked })}
                                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className="font-bold text-slate-700">Izinkan Custom Domain</span>
                                                </label>
                                                {settingsForm.allowCustomDomain && (
                                                    <select
                                                        value={settingsForm.customDomainStatus}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, customDomainStatus: e.target.value })}
                                                        className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2"
                                                    >
                                                        <option value="NONE">Belum Setup</option>
                                                        <option value="PENDING">Menunggu Verifikasi DNS</option>
                                                        <option value="ACTIVE">Domain Aktif (SSL Issued)</option>
                                                        <option value="REJECTED">Ditolak / Gagal DNS</option>
                                                    </select>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-slate-100">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={settingsForm.isMaintenance}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, isMaintenance: e.target.checked })}
                                                        className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                                                    />
                                                    <span className="font-bold text-amber-700">Paksa Mode Maintenance Tenant Tertentu</span>
                                                </label>
                                            </div>

                                            <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-bold text-[13px] py-2.5 rounded-lg hover:bg-indigo-700 transition">
                                                Simpan Pengaturan
                                            </button>
                                        </div>
                                    </form>

                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Merchant</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Kelola pendaftaran, status, dan langganan tenant (toko reseller).</p>
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
                            placeholder="Cari ID, Nama Toko, atau Domain..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="ACTIVE">Aktif Saja</option>
                                <option value="PENDING_REVIEW">Menunggu Review</option>
                                <option value="SUSPENDED">Suspended / Banned</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading / Error States */}
                {isLoading && (
                    <div className="flex flex-col flex-1 items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-medium">Memuat data dari database...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="p-8 text-center text-red-500 font-medium text-sm">
                        Koneksi Backend Gagal. Error Server.
                    </div>
                )}

                {/* Table Data */}
                {!isLoading && !error && merchants && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Data Toko / Domain</th>
                                    <th className="px-6 py-4">SaaS Plan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Reseller & Omset</th>
                                    <th className="px-6 py-4 text-center">Tgl Daftar</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {merchants.map((merchant: any) => (
                                    <tr key={merchant.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                                                    {merchant.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-semibold text-slate-800 flex items-center gap-2">
                                                        {merchant.name}
                                                        {merchant.isOfficial && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[9px] border border-amber-200 uppercase font-bold tracking-wider">Official</span>}
                                                    </p>
                                                    <a href={`https://${merchant.domain}`} className="text-[12px] font-medium text-indigo-500 hover:text-indigo-700 hover:underline underline-offset-4 flex items-center gap-1 mt-0.5 opacity-80" target="_blank">
                                                        {merchant.domain} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5" title={merchant.id}>{merchant.id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPlanBadge(merchant.plan)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(merchant.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-[14px] font-bold text-slate-800">Rp {Number(merchant.omset).toLocaleString('id-ID')}</p>
                                            <p className="text-[11px] text-slate-500 font-medium">{merchant.resellers} Reseller aktif</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-[13px] text-slate-600 font-medium">
                                            {merchant.date}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setSelectedMerchantId(merchant.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg transition-all" title="Detail & Atur">
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {merchant.status === 'PENDING_REVIEW' && (
                                                    <button onClick={() => handleUpdateStatus(merchant.id, 'ACTIVE', 'Approve')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-all" title="Setujui Pendaftaran">
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {merchant.status === 'ACTIVE' && (
                                                    <button onClick={() => handleUpdateStatus(merchant.id, 'SUSPENDED', 'Suspend')} className="p-1.5 text-amber-500 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition-all" title="Suspend Sementara">
                                                        <PauseCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {merchant.status === 'SUSPENDED' && (
                                                    <button onClick={() => handleUpdateStatus(merchant.id, 'ACTIVE', 'Unsuspend')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-all" title="Aktifkan Kembali">
                                                        <PlayCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {!merchant.isOfficial && (
                                                    <button onClick={() => handleUpdateStatus(merchant.id, 'INACTIVE', 'Ban')} className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all" title="Ban Permanen">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {merchants.length === 0 && (
                            <div className="p-10 text-center text-slate-500 font-medium text-sm">
                                Tidak ada merchant yang ditemukan dengan filter tersebut.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
