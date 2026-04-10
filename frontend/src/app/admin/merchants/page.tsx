"use client";
import { getApiUrl } from '@/lib/api';
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
    Trash2,
    Users,
    Mail,
    Phone,
    ShoppingCart,
    Calendar,
    ArrowRight,
    Tag
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function MerchantManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState<{ title: string, desc: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'settings' | 'resellers'>('settings');
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
        `${getApiUrl()}/admin/merchants?search=${debouncedSearch}&status=${statusFilter}`,
        fetcher
    );

    const { data: merchantDetail, error: detailError, isLoading: loadingDetail, mutate: mutateDetail } = useSWR(
        selectedMerchantId ? `${getApiUrl()}/admin/merchants/${selectedMerchantId}` : null,
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
                await axios.patch(`${getApiUrl()}/admin/merchants/${id}/status`,
                    { status: newStatus },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
                );
                mutate();
                if (selectedMerchantId === id) {
                    // Try to refresh detail if it's the current one
                    mutateDetail?.();
                }
                showToast('Status Diperbarui', `Status merchant [${id.slice(0, 8)}] menjadi ${newStatus}`);
            }
        } catch (err: any) {
            console.error("Update Status Error:", err.response?.data);
            showToast('Gagal', err.response?.data?.message || 'Gagal mengubah status merchant', 'error');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMerchantId) return;
        try {
            await axios.patch(`${getApiUrl()}/admin/merchants/${selectedMerchantId}/settings`,
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
            const res = await axios.post(`${getApiUrl()}/admin/merchants/${id}/reset-password`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            showToast('Berhasil', res.data.message);
        } catch (err: any) {
            showToast('Error', err.response?.data?.message || 'Gagal reset password', 'error');
        }
    }

    const handleExportCsv = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.get(`${getApiUrl()}/admin/merchants/export-csv`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'merchants-list.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Gagal mengekspor data merchant');
        }
    };

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
                    <div className="w-full max-w-3xl bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Detail <span className="text-indigo-600">Merchant</span></h2>
                                {merchantDetail && <p className="text-[13px] text-slate-500 font-medium mt-1">{merchantDetail.name} • {merchantDetail.domain}</p>}
                            </div>
                            <button onClick={() => setSelectedMerchantId(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-8 border-b border-slate-100 gap-8">
                            <button 
                                onClick={() => setActiveTab('settings')}
                                className={`py-4 text-[13px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Pengaturan & Override
                            </button>
                            <button 
                                onClick={() => setActiveTab('resellers')}
                                className={`py-4 text-[13px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'resellers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                List Reseller Aktif ({merchantDetail?.resellersCount || 0})
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {loadingDetail ? (
                                <div className="flex flex-col justify-center items-center py-20 opacity-40">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                                    <p className="text-sm font-bold">Synchronizing metadata...</p>
                                </div>
                            ) : merchantDetail ? (
                                <div className="space-y-8 animate-in fade-in duration-500">
                                    
                                    {activeTab === 'settings' ? (
                                        <div className="space-y-8">
                                            {/* Profil Owner */}
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Informasi Owner</h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl">
                                                            {merchantDetail.owner?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[15px] font-black text-slate-800 leading-tight">{merchantDetail.owner?.name}</p>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{merchantDetail.owner?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <button onClick={() => handleResetPassword(merchantDetail.id)} className="px-4 py-2 flex items-center gap-2 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all active:scale-95">
                                                            <KeyRound className="w-4 h-4" /> Force Reset Pass
                                                        </button>
                                                        <div className="flex gap-2">
                                                            {merchantDetail.status === 'PENDING_REVIEW' && (
                                                                <button onClick={() => handleUpdateStatus(merchantDetail.id, 'ACTIVE', 'Approve')} className="flex-1 px-3 py-2 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all">
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {merchantDetail.status === 'ACTIVE' && (
                                                                <button onClick={() => handleUpdateStatus(merchantDetail.id, 'SUSPENDED', 'Suspend')} className="flex-1 px-3 py-2 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all">
                                                                    Suspend
                                                                </button>
                                                            )}
                                                            {merchantDetail.status !== 'INACTIVE' && !merchantDetail.isOfficial && (
                                                                <button onClick={() => handleUpdateStatus(merchantDetail.id, 'INACTIVE', 'Ban')} className="flex-1 px-3 py-2 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all">
                                                                    Ban
                                                                </button>
                                                            )}
                                                            {merchantDetail.status === 'SUSPENDED' && (
                                                                <button onClick={() => handleUpdateStatus(merchantDetail.id, 'ACTIVE', 'Reactivate')} className="flex-1 px-3 py-2 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all">
                                                                    Activate
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statistik Kinerja Tenant */}
                                            <div>
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Kesehatan Bisnis Tenant</h3>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Omset</p>
                                                        <p className="text-lg font-black text-emerald-700">Rp {(merchantDetail.omset || 0).toLocaleString('id-ID')}</p>
                                                    </div>
                                                    <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Reseller</p>
                                                        <p className="text-lg font-black text-indigo-700">{merchantDetail.resellersCount || 0}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaksi</p>
                                                        <p className="text-lg font-black text-slate-700">{merchantDetail._count?.orders || 0}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Support</p>
                                                        <p className="text-lg font-black text-slate-700">{merchantDetail._count?.tickets || 0}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form Settings */}
                                            <form onSubmit={handleSaveSettings} className="bg-white border-2 border-slate-50 shadow-xl shadow-slate-200/20 rounded-3xl overflow-hidden p-6 space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                                                        <Settings className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-wider">Pengaturan Platform</h4>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1.5 col-span-2">
                                                        <label className="text-[11px] font-black text-slate-400 ml-1">PLATFORM FEE (%)</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number" min="0" max="100"
                                                                value={settingsForm.platformFee}
                                                                onChange={(e) => setSettingsForm({ ...settingsForm, platformFee: Number(e.target.value) })}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-5 pr-10 py-3.5 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                                            />
                                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 italic ml-1">* Potongan otomatis ke admin dari setiap order PAID.</p>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-black text-slate-400 ml-1">SAAS PLAN</label>
                                                        <select
                                                            value={settingsForm.plan}
                                                            onChange={(e) => setSettingsForm({ ...settingsForm, plan: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option value="FREE">FREE PLAN</option>
                                                            <option value="PRO">PAKET PRO</option>
                                                            <option value="LEGEND">PAKET LEGEND</option>
                                                            <option value="SUPREME">PAKET SUPREME</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-black text-slate-400 ml-1">EXPIRED AT</label>
                                                        <input
                                                            type="date"
                                                            value={settingsForm.planExpiredAt}
                                                            onChange={(e) => setSettingsForm({ ...settingsForm, planExpiredAt: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-10 h-6 p-1 rounded-full transition-all duration-300 ${settingsForm.allowCustomDomain ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settingsForm.allowCustomDomain ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={settingsForm.allowCustomDomain} onChange={e => setSettingsForm({...settingsForm, allowCustomDomain: e.target.checked})} />
                                                        <span className="text-[13px] font-black text-slate-700 group-hover:text-indigo-600 transition-colors">IZINKAN CUSTOM DOMAIN</span>
                                                    </label>

                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-10 h-6 p-1 rounded-full transition-all duration-300 ${settingsForm.isMaintenance ? 'bg-amber-500' : 'bg-slate-200'}`}>
                                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settingsForm.isMaintenance ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={settingsForm.isMaintenance} onChange={e => setSettingsForm({...settingsForm, isMaintenance: e.target.checked})} />
                                                        <span className="text-[13px] font-black text-amber-600 group-hover:text-amber-700 transition-colors uppercase">SIAGA MAINTENANCE</span>
                                                    </label>
                                                </div>

                                                {settingsForm.allowCustomDomain && (
                                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in slide-in-from-top-2">
                                                        <div className="space-y-1.5 flex-1">
                                                            <label className="text-[10px] font-black text-slate-400 ml-1">HOSTNAME (CNAME/A)</label>
                                                            <input
                                                                type="text"
                                                                value={settingsForm.domain}
                                                                onChange={e => setSettingsForm({ ...settingsForm, domain: e.target.value })}
                                                                placeholder="www.tokomerchant.com"
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-indigo-600"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-slate-400 ml-1">VERIFIKASI STATUS</label>
                                                            <select
                                                                value={settingsForm.customDomainStatus}
                                                                onChange={(e) => setSettingsForm({ ...settingsForm, customDomainStatus: e.target.value })}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700"
                                                            >
                                                                <option value="NONE">NO ACTIVATION</option>
                                                                <option value="PENDING">WAITING DNS PROPAGATION</option>
                                                                <option value="ACTIVE">LINK ESTABLISHED</option>
                                                                <option value="REJECTED">ERROR DETECTED</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}

                                                <button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all">
                                                    Simpan Configuration Override
                                                </button>
                                            </form>

                                            <MerchantPricingOverrides merchantId={merchantDetail.id} />
                                        </div>
                                    ) : (
                                        <MerchantResellersList merchantId={merchantDetail.id} />
                                    )}

                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen <span className="text-indigo-600">Merchant</span></h1>
                    <p className="text-[14px] text-slate-500 font-medium mt-1">Status pendaftaran, omset, dan integrasi tenant.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExportCsv}
                        className="h-[40px] px-5 inline-flex items-center justify-center gap-2 text-[13px] font-black rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        EXPORT CSV
                    </button>
                </div>
            </div>

            <div className="bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/20 rounded-[32px] overflow-hidden min-h-[500px]">
                {/* Table Controls */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Cari Merchant, Domain, atau ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-5 pr-10 py-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-[13px] font-black text-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer transition-all"
                        >
                            <option value="ALL">SEMUA STATUS</option>
                            <option value="ACTIVE">AKTIF SAJA</option>
                            <option value="PENDING_REVIEW">MENUNGGU REVIEW</option>
                            <option value="SUSPENDED">DIHENTIKAN</option>
                        </select>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex flex-col flex-1 items-center justify-center py-32 text-slate-400 opacity-50">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-black uppercase tracking-widest leading-none">Accessing Central Archive...</p>
                    </div>
                )}

                {/* Table Data */}
                {!isLoading && !error && merchants && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] leading-none">
                                    <th className="px-8 py-5">Merchant ID & Domain</th>
                                    <th className="px-8 py-5">SaaS Plan</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Reseller & Omset</th>
                                    <th className="px-8 py-5 text-center">Tgl Daftar</th>
                                    <th className="px-8 py-5 text-right">Interaksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(() => {
                                    const list = Array.isArray(merchants) ? merchants : (merchants?.data || []);
                                    return list.map((merchant: any) => (
                                        <tr key={merchant.id} className="hover:bg-indigo-50/20 transition-all group animate-in fade-in duration-300">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-50 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm group-hover:border-indigo-100 transition-all">
                                                        {merchant.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="text-[15px] font-black text-slate-800">{merchant.name}</p>
                                                            {merchant.isOfficial && <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-tighter">OFFICIAL</span>}
                                                        </div>
                                                        <a href={`https://${merchant.domain}`} className="text-[12px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 opacity-70 group-hover:opacity-100" target="_blank">
                                                            {merchant.domain} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <p className="text-[9px] text-slate-300 font-mono mt-1 font-bold group-hover:text-slate-400">{merchant.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {getPlanBadge(merchant.plan)}
                                            </td>
                                            <td className="px-8 py-5">
                                                {getStatusBadge(merchant.status)}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-[15px] font-black text-slate-800">Rp {Number(merchant.omset).toLocaleString('id-ID')}</p>
                                                <button onClick={() => { setSelectedMerchantId(merchant.id); setActiveTab('resellers'); }} className="text-[11px] text-slate-400 font-black hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                    {merchant.resellers} Reseller aktif <ArrowRight className="w-3 h-3 inline ml-0.5" />
                                                </button>
                                            </td>
                                            <td className="px-8 py-5 text-center text-[13px] text-slate-500 font-bold">
                                                {merchant.date}
                                            </td>
                                            <td className="px-8 py-5 text-right cursor-default">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setSelectedMerchantId(merchant.id); setActiveTab('settings'); }} className="p-2.5 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 rounded-xl transition-all active:scale-90" title="Detail & Atur">
                                                        <Eye className="w-4.5 h-4.5" />
                                                    </button>

                                                    {merchant.status === 'PENDING_REVIEW' && (
                                                        <button onClick={() => handleUpdateStatus(merchant.id, 'ACTIVE', 'Approve')} className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all" title="Approve">
                                                            <ShieldCheck className="w-4.5 h-4.5" />
                                                        </button>
                                                    )}
                                                    {merchant.status === 'ACTIVE' && (
                                                        <button onClick={() => handleUpdateStatus(merchant.id, 'SUSPENDED', 'Suspend')} className="p-2.5 text-amber-500 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all" title="Suspend">
                                                            <PauseCircle className="w-4.5 h-4.5" />
                                                        </button>
                                                    )}
                                                    {!merchant.isOfficial && (
                                                        <button onClick={() => handleUpdateStatus(merchant.id, 'INACTIVE', 'Ban')} className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all" title="Ban">
                                                            <Ban className="w-4.5 h-4.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                })()}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// ===========================================
// SUB-COMPONENT: MERCHANT RESELLERS LIST
// ===========================================
function MerchantResellersList({ merchantId }: { merchantId: string }) {
    const { data: users, isLoading } = useSWR(`${getApiUrl()}/admin/merchants/${merchantId}/resellers`, fetcher);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-[11px] font-black uppercase tracking-widest">Hydrating users data...</p>
        </div>
    );

    if (!users || users.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <Users className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-400">Merchant ini belum memiliki reseller terdaftar.</p>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between px-2">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Daftar Member Berstatus Reseller</h4>
                <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{users.length} TOTAL</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {users.map((user: any) => (
                    <div key={user.id} className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-100 shadow-sm transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h5 className="text-[14px] font-black text-slate-800 leading-tight">{user.name}</h5>
                                <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                    <span className="flex items-center gap-1 text-[11px] font-bold"><Mail className="w-3 h-3" /> {user.email}</span>
                                    <span className="flex items-center gap-1 text-[11px] font-bold"><Phone className="w-3 h-3" /> {user.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[13px] font-black text-slate-800 flex items-center justify-end gap-1.5 leading-none">
                                    <ShoppingCart className="w-3.5 h-3.5 text-indigo-500" /> {user._count.ordersAsCustomer} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Trx</span>
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1.5 flex items-center justify-end gap-1">
                                    <Calendar className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600'}`}>
                                {user.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ===========================================
// SUB-COMPONENT: PRICE OVERRIDES
// ===========================================
function MerchantPricingOverrides({ merchantId }: { merchantId: string }) {
    const { data: overrides, mutate } = useSWR(`${getApiUrl()}/admin/merchant-overrides/merchant/${merchantId}`, fetcher);
    const { data: skus } = useSWR((getApiUrl()) + '/admin/products/skus/pricing', fetcher);

    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ skuId: '', price: 0, reason: '', expiredAt: '' });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post((getApiUrl()) + '/admin/merchant-overrides', {
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
            await axios.delete(`${getApiUrl()}/admin/merchant-overrides/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
            });
            mutate();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm mt-8 transition-all">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                   <Tag className="w-4 h-4 text-indigo-600" /> Harga Khusus Merchant
                </h3>
                {!isAdding ? (
                    <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition active:scale-95">
                        + Tambah Override
                    </button>
                ) : (
                    <button onClick={() => setIsAdding(false)} className="text-[11px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest italic">Batal</button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-6 border-b border-slate-200 bg-white space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih SKU Produk</label>
                            <select
                                required
                                value={form.skuId}
                                onChange={e => setForm({ ...form, skuId: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            >
                                <option value="">-- PILIH PRODUK SKU --</option>
                                {skus?.map((sku: any) => (
                                    <option key={sku.id} value={sku.id}>{sku.product.category.name} - {sku.product.name} - {sku.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Nett Toko (IDR)</label>
                            <input
                                type="number" required
                                value={form.price}
                                onChange={e => setForm({ ...form, price: parseInt(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kadaluarsa (Opsional)</label>
                            <input
                                type="date"
                                value={form.expiredAt}
                                onChange={e => setForm({ ...form, expiredAt: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                        Simpan Harga Override Baru
                    </button>
                </form>
            )}

            <div className="p-6 space-y-3">
                {overrides?.length === 0 && <p className="text-center py-10 text-xs text-slate-400 font-bold uppercase tracking-widest italic opacity-50">Zero active override records.</p>}
                {overrides?.map((o: any) => (
                    <div key={o.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-100 transition-all group animate-in fade-in">
                        <div>
                            <p className="text-[14px] font-black text-slate-800 leading-tight">{o.productSku?.name}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black tracking-tight border border-indigo-100">Rp {Number(o.customPrice).toLocaleString('id-ID')}</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight flex items-center gap-1">
                                    <Calendar className="w-3 h-3 opacity-50" /> {o.expiredAt ? new Date(o.expiredAt).toLocaleDateString() : 'LIFETIME'}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(o.id)} className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-100">
                            <Trash2 className="w-4.5 h-4.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
