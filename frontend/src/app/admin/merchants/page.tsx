"use client";
import React, { useState, useEffect } from 'react';
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
    KeyRound,
    Trash2
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};
export default function MerchantManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState<{ title: string, desc: string, type: 'success' | 'error' } | null>(null);

    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [settingsForm, setSettingsForm] = useState({
        domain: '',
        platformFee: 0,
        allowCustomDomain: false,
        customDomainStatus: 'NONE',
        isMaintenance: false,
        plan: 'FREE',
        planExpiredAt: ''
    });

    const { data: merchants, error, isLoading, mutate } = useSWR(
        `http://localhost:3001/admin/merchants?search=${searchTerm}&status=${statusFilter}`,
        fetcher
    );

    const { data: merchantDetail, error: detailError, isLoading: loadingDetail, mutate: mutateDetail } = useSWR(
        selectedMerchantId ? `http://localhost:3001/admin/merchants/${selectedMerchantId}` : null,
        fetcher
    );

    useEffect(() => {
        if (merchantDetail) {
            setSettingsForm({
                domain: merchantDetail.domain || '',
                platformFee: merchantDetail.settings?.platformFee || 0,
                allowCustomDomain: merchantDetail.settings?.allowCustomDomain || false,
                customDomainStatus: merchantDetail.settings?.customDomainStatus || 'NONE',
                isMaintenance: merchantDetail.settings?.isMaintenance || false,
                plan: merchantDetail.plan || 'FREE',
                planExpiredAt: merchantDetail.planExpiredAt
                    ? merchantDetail.planExpiredAt.split('T')[0]
                    : ''
            });
        }
    }, [merchantDetail]);

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    }

    const handleUpdateStatus = async (id: string, newStatus: string, actionName: string) => {
        try {
            if (confirm(`Apakah Anda yakin ingin melakukan aksi "${actionName}" pada toko ini?`)) {
                await axios.patch(`http://localhost:3001/admin/merchants/${id}/status`,
                    { status: newStatus },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
                );
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
            await axios.patch(`http://localhost:3001/admin/merchants/${selectedMerchantId}/settings`,
                settingsForm,
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            mutateDetail();
            showToast('Tersimpan', `Pengaturan Merchant sukses diubah.`);
        } catch (err: any) {
            showToast('Error', err.response?.data?.message || 'Server Error', 'error');
        }
    };

    const handleResetPassword = async (id: string) => {
        if (!confirm('Reset password Owner menjadi "DagangPlay123!" ?')) return;
        try {
            const res = await axios.post(`http://localhost:3001/admin/merchants/${id}/reset-password`, {}, { headers: { Authorization: `Bearer \${localStorage.getItem('admin_token')}` } });
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
            case 'SUPREME': return <span className="text-orange-600 font-bold text-[11px] flex items-center gap-1"><Crown className="w-3 h-3" /> Supreme</span>;
            case 'LEGEND': return <span className="text-purple-600 font-bold text-[11px]">Legend</span>;
            case 'PRO': return <span className="text-blue-600 font-bold text-[11px]">Pro</span>;
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

                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Paket Berlangganan (Plan)</label>
                                                    <select
                                                        value={settingsForm.plan}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, plan: e.target.value })}
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[13px] bg-slate-50"
                                                    >
                                                        <option value="FREE">Toko Gratis (FREE)</option>
                                                        <option value="PRO">SaaS Paket PRO</option>
                                                        <option value="LEGEND">SaaS Paket LEGEND</option>
                                                        <option value="SUPREME">SaaS Paket SUPREME</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Masa Aktif (Expired At)</label>
                                                    <input
                                                        type="date"
                                                        value={settingsForm.planExpiredAt}
                                                        onChange={(e) => setSettingsForm({ ...settingsForm, planExpiredAt: e.target.value })}
                                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-[13px] bg-slate-50"
                                                    />
                                                </div>
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
                                                    <div className="space-y-2 mt-3">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hostname Domain</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.domain}
                                                                onChange={e => setSettingsForm({ ...settingsForm, domain: e.target.value })}
                                                                placeholder="contoh: www.budigaming.com"
                                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-indigo-500 bg-slate-50"
                                                            />
                                                            <p className="text-[10px] text-slate-500 mt-1">Kosongkan jika store belum setup domain tujuan.</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status CNAME/A Record</label>
                                                            <select
                                                                value={settingsForm.customDomainStatus}
                                                                onChange={(e) => setSettingsForm({ ...settingsForm, customDomainStatus: e.target.value })}
                                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
                                                            >
                                                                <option value="NONE">Belum Setup Domain</option>
                                                                <option value="PENDING">Menunggu Resolve DNS</option>
                                                                <option value="ACTIVE">Domain Tersambung Aktif</option>
                                                                <option value="REJECTED">Koneksi Error / Ditolak</option>
                                                            </select>
                                                        </div>
                                                    </div>
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
                                                    <span className="font-bold text-amber-700 text-xs">Paksa Mode Maintenance Tenant Tertentu</span>
                                                </label>
                                            </div>

                                            <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-bold text-[13px] py-2.5 rounded-lg hover:bg-indigo-700 transition">
                                                Simpan Pengaturan
                                            </button>
                                        </div>
                                    </form>

                                    {/* PRICE OVERRIDES */}
                                    <MerchantPricingOverrides merchantId={merchantDetail.id} />

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
                                {(() => {
                                    const list = Array.isArray(merchants) ? merchants : (merchants?.data || []);
                                    return list.map((merchant: any) => (
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
                                    ))
                                })()}
                            </tbody>
                        </table>

                        {(() => {
                            const list = Array.isArray(merchants) ? merchants : (merchants?.data || []);
                            return list.length === 0 && (
                                <div className="p-10 text-center text-slate-500 font-medium text-sm">
                                    Tidak ada merchant yang ditemukan dengan filter tersebut.
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// ===========================================
// SUB-COMPONENT: PRICE OVERRIDES
// ===========================================
function MerchantPricingOverrides({ merchantId }: { merchantId: string }) {
    const { data: overrides, mutate } = useSWR(`http://localhost:3001/admin/merchant-overrides/merchant/${merchantId}`, fetcher);
    const { data: skus } = useSWR('http://localhost:3001/admin/products/skus/pricing', fetcher);

    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ skuId: '', price: 0, reason: '', expiredAt: '' });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://localhost:3001/admin/merchant-overrides', {
                merchantId,
                productSkuId: form.skuId,
                customPrice: form.price,
                reason: form.reason || 'Manual Super Admin Override',
                expiredAt: form.expiredAt || null
            }, { headers: { Authorization: `Bearer ${token}` } });

            mutate();
            setIsAdding(false);
            setForm({ skuId: '', price: 0, reason: '', expiredAt: '' });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan override');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus harga khusus ini?')) return;
        try {
            await axios.delete(`http://localhost:3001/admin/merchant-overrides/${id}`);
            mutate();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-8">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="text-sm font-bold text-slate-800">Harga Khusus Merchant (Override)</h3>
                {!isAdding ? (
                    <button onClick={() => setIsAdding(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 shadow-sm transition">
                        + Tambah Override
                    </button>
                ) : (
                    <button onClick={() => setIsAdding(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700">Tutup Form</button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-5 border-b border-slate-200 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pilih SKU Produk</label>
                            <select
                                required
                                value={form.skuId}
                                onChange={e => setForm({ ...form, skuId: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500"
                            >
                                <option value="">-- Pilih Produk SKU --</option>
                                {skus?.map((sku: any) => (
                                    <option key={sku.id} value={sku.id}>{sku.product.category.name} - {sku.product.name} - {sku.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Harga Nett Toko (IDR)</label>
                            <input
                                type="number" required
                                value={form.price}
                                onChange={e => setForm({ ...form, price: parseInt(e.target.value) })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tgl Kadaluarsa (Opsional)</label>
                            <input
                                type="date"
                                value={form.expiredAt}
                                onChange={e => setForm({ ...form, expiredAt: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition active:scale-95">
                        Simpan Harga Khusus
                    </button>
                </form>
            )}

            <div className="p-4 space-y-2">
                {overrides?.length === 0 && <p className="text-center py-6 text-xs text-slate-400 font-medium italic">Tidak ada harga khusus aktif untuk merchant ini.</p>}
                {overrides?.map((o: any) => (
                    <div key={o.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs hover:border-indigo-100 transition">
                        <div>
                            <p className="text-[12.5px] font-bold text-slate-800 leading-none">{o.productSku?.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold tracking-tight">Rp {Number(o.customPrice).toLocaleString('id-ID')}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400 font-medium">Exp: {o.expiredAt ? new Date(o.expiredAt).toLocaleDateString() : 'Tanpa Expired'}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(o.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
