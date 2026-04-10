"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Settings,
    Shield,
    Terminal,
    Save,
    CheckCircle2,
    XCircle,
    UserPlus,
    Edit,
    Trash2,
    RotateCw,
    AlertTriangle,
    Loader2,
    ToggleLeft,
    ToggleRight,
    TrendingUp,
    ArrowRight,
    Search,
    Server,
    CreditCard,
    Lock,
    ArrowUpRight
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function SettingsManagementPage() {
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'STAFF' | 'JOBS' | 'PLANS'>('GLOBAL');
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // ===================================
    // GLOBAL SETTINGS STATE
    // ===================================
    const { data: initialSettings, isLoading: loadingSettings, mutate: mutateSettings } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/settings/global', fetcher);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    useEffect(() => {
        if (initialSettings) setSettings(initialSettings);
    }, [initialSettings]);

    // ===================================
    // ADMIN STAFF STATE
    // ===================================
    const { data: staffList, isLoading: loadingStaff, mutate: mutateStaff } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/settings/staff', fetcher);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', status: 'ACTIVE', permissions: [] as string[] });

    const availablePermissions = [
        'manage_dashboard',
        'manage_finance',
        'manage_merchants',
        'manage_products',
        'manage_subscriptions',
        'manage_settings',
        'manage_transactions',
        'manage_users',
        'manage_marketing',
        'manage_content',
        'manage_tickets',
        'manage_suppliers',
        'manage_security',
        'manage_saas'
    ];

    const togglePermission = (perm: string) => {
        setStaffForm(prev => {
            if (prev.permissions.includes(perm)) return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
            return { ...prev, permissions: [...prev.permissions, perm] };
        });
    };

    // ===================================
    // JOB QUEUE STATE
    // ===================================
    const [jobStatusFilter, setJobStatusFilter] = useState('');
    const { data: jobQueues, isLoading: loadingJobs, mutate: mutateJobs } = useSWR(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/settings/jobs?status=${jobStatusFilter}`, fetcher);

    // ===================================
    // HANDLERS
    // ===================================
    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleUpdateSettingsField = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveGlobalSettings = async () => {
        setIsSavingSettings(true);
        const token = localStorage.getItem('admin_token');
        try {
            await axios.put((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/settings/global', settings, { headers: { Authorization: `Bearer ${token}` } });
            mutateSettings();
            showToast('Tersimpan', 'Pengaturan global berhasil diperbarui.');
        } catch (err: any) {
            showToast('Gagal', 'Gagal menyimpan pengaturan.', 'error');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleSaveStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('admin_token');
        try {
            if (editingStaffId) {
                // Format clean payload for UPDATE (No email, no password)
                const updatePayload = {
                    name: staffForm.name,
                    status: staffForm.status,
                    permissions: staffForm.permissions
                };
                await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/settings/staff/${editingStaffId}`, updatePayload, { headers: { Authorization: `Bearer ${token}` } });
                showToast('Sukses', 'Data admin staff diperbarui');
            } else {
                await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/settings/staff', staffForm, { headers: { Authorization: `Bearer ${token}` } });
                showToast('Sukses', 'Admin staff baru ditambahkan');
            }
            mutateStaff();
            setShowStaffModal(false);
            setStaffForm({ name: '', email: '', password: '', status: 'ACTIVE', permissions: [] });
            setEditingStaffId(null);
        } catch (err) {
            showToast('Gagal', 'Gagal memproses staff', 'error');
        }
    };

    const handleDeleteStaff = async (id: string, name: string) => {
        if (!confirm(`Hapus permanen akses staff ${name}?`)) return;
         const token = localStorage.getItem('admin_token');
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/settings/staff/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutateStaff();
            showToast('Terhapus', 'Akses staff telah dicabut.');
        } catch (err) {
            showToast('Gagal', 'Terjadi kesalahan sistem.', 'error');
        }
    };

    const handleRetryJob = async (id: string) => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/settings/jobs/${id}/retry`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutateJobs();
            showToast('Diproses', 'Job background telah dijadwalkan ulang.');
        } catch (err) {
            showToast('Gagal', 'Gagal me-retry job.', 'error');
        }
    };

    // ===================================
    // PLAN MAPPING STATE
    // ===================================
    const { data: planMappings, mutate: mutatePlans } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/plan-tier-mappings', fetcher);

    const handleUpdatePlanMapping = async (plan: string, tier: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/plan-tier-mappings', { plan, tier }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutatePlans();
            showToast('Tersimpan', `Mapping plan ${plan} diperbarui ke ${tier}.`);
        } catch (err) {
            showToast('Gagal', 'Gagal memperbarui mapping plan.', 'error');
        }
    };

    return (
        <AdminLayout>
            {toastMsg && (
                <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-start gap-3 ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertTriangle className="w-5 h-5 mt-0.5" />}
                        <div>
                            <p className="font-bold text-sm">{toastMsg.title}</p>
                            <p className="text-[13px] opacity-90 mt-0.5">{toastMsg.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Konfigurasi pusat, otorisasi jaringan, dan antrian sistem background.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
                    <button onClick={() => setActiveTab('GLOBAL')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${activeTab === 'GLOBAL' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Settings className="w-4 h-4" /> Global Config
                    </button>
                    <button onClick={() => setActiveTab('PLANS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${activeTab === 'PLANS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <TrendingUp className="w-4 h-4" /> Plan Tier Mapping
                    </button>
                    <button onClick={() => setActiveTab('STAFF')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${activeTab === 'STAFF' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Shield className="w-4 h-4" /> Admin Roles
                    </button>
                    <button onClick={() => setActiveTab('JOBS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${activeTab === 'JOBS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Terminal className="w-4 h-4" /> Background Jobs
                    </button>
                </div>
            </div>

            {/* TAB: PLAN MAPPING */}
            {activeTab === 'PLANS' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 tracking-tight tracking-tight">Mapping Plan ke Tier Harga</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Tentukan tier harga mana yang didapat oleh masing-masing Merchant Plan.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    const token = localStorage.getItem('admin_token');
                                    await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/plan-tier-mappings/sync', {}, { headers: { Authorization: `Bearer ${token}` } });
                                    mutatePlans();
                                    showToast('Selesai', 'Mapping default telah dipulihkan.');
                                }}
                                className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100"
                            >
                                Reset to Default
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {['FREE', 'PRO', 'LEGEND', 'SUPREME'].map((plan) => {
                                const currentMapping = planMappings?.find((m: any) => m.plan === plan);
                                return (
                                    <div key={plan} className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Merchant Plan</p>
                                            <p className="text-lg font-black text-slate-800">{plan}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                            <select
                                                value={currentMapping?.tier || 'NORMAL'}
                                                onChange={(e) => handleUpdatePlanMapping(plan, e.target.value)}
                                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            >
                                                <option value="NORMAL">NORMAL TIER</option>
                                                <option value="PRO">PRO TIER</option>
                                                <option value="LEGEND">LEGEND TIER</option>
                                                <option value="SUPREME">SUPREME TIER</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-900">Penting: Perubahan Tier Bersifat Instant</p>
                            <p className="text-[13px] text-amber-800 mt-1 opacity-90">
                                Jika Anda mengubah mapping plan, maka seluruh merchant dengan plan tersebut akan langsung mendapatkan harga baru saat melakukan transaksi atau melihat katalog. Gunakan fitur ini untuk promo sementara atau penyesuaian model bisnis.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 1: GLOBAL SETTINGS */}
            {activeTab === 'GLOBAL' && (
                <div className="space-y-6 animate-in fade-in">
                    {loadingSettings ? (
                        <div className="flex justify-center p-10 bg-white rounded-2xl border border-slate-200"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <>
                            {/* PLATFORM CONFIG */}
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
                                <h2 className="text-lg font-black text-slate-800 tracking-tight border-b border-slate-100 pb-4 mb-6">Identitas Platform</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Nama Platform</label>
                                        <input type="text" value={settings.PLATFORM_NAME || ''} onChange={e => handleUpdateSettingsField('PLATFORM_NAME', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm" placeholder="DagangPlay" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Kontak CS Default (WA/Telp)</label>
                                        <input type="text" value={settings.PLATFORM_CS_PHONE || ''} onChange={e => handleUpdateSettingsField('PLATFORM_CS_PHONE', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono" placeholder="62812345678" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Maintenance Mode (Platform Break)</label>
                                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                                            <div>
                                                <p className="font-bold text-orange-900 text-sm">Aktifkan Mode Maintenance</p>
                                                <p className="text-[11px] text-orange-700 mt-1">Hanya Super Admin yang dapat login. Client / Tenant akan melihat layar perawatan server.</p>
                                            </div>
                                            <button onClick={() => handleUpdateSettingsField('MAINTENANCE_MODE', settings.MAINTENANCE_MODE === 'true' ? 'false' : 'true')} className={`text-2xl ${settings.MAINTENANCE_MODE === 'true' ? 'text-orange-600' : 'text-slate-300'}`}>
                                                {settings.MAINTENANCE_MODE === 'true' ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                            </button>
                                        </div>
                                    </div>
                                    {settings.MAINTENANCE_MODE === 'true' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Pesan Maintenance</label>
                                            <textarea rows={2} value={settings.MAINTENANCE_MESSAGE || ''} onChange={e => handleUpdateSettingsField('MAINTENANCE_MESSAGE', e.target.value)} className="w-full mt-1 p-3 border border-orange-200 rounded-xl text-sm bg-orange-50/50" placeholder="Kami sedang meningkatkan kualitas server, harap kembali dalam 30 menit."></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PAYMENT & FINANCIAL CONFIG */}
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
                                <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                                    <CreditCard className="w-5 h-5 text-indigo-500" /> Gateway Pembayaran & Batas Mutasi
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Gateway Utama</label>
                                        <select value={settings.PRIMARY_PAYMENT_GATEWAY || 'MIDTRANS'} onChange={e => handleUpdateSettingsField('PRIMARY_PAYMENT_GATEWAY', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50">
                                            <option value="MIDTRANS">Midtrans</option>
                                            <option value="XENDIT">Xendit</option>
                                            <option value="TRIPAY">Tripay</option>
                                        </select>
                                    </div>
                                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">API Key Gateway Utama <Lock className="w-3 h-3 text-red-400" /></label>
                                            <input type="password" value={settings.PAYMENT_GATEWAY_KEY || ''} onChange={e => handleUpdateSettingsField('PAYMENT_GATEWAY_KEY', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono" placeholder="Server Key..." />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Biaya Withdrawal Flat (IDR)</label>
                                            <input type="number" value={settings.WITHDRAWAL_FLAT_FEE || '0'} onChange={e => handleUpdateSettingsField('WITHDRAWAL_FLAT_FEE', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono text-red-600 font-bold" placeholder="Misal: 4500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Minimum Deposit Saldo (IDR)</label>
                                        <input type="number" value={settings.MIN_DEPOSIT || '10000'} onChange={e => handleUpdateSettingsField('MIN_DEPOSIT', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono font-bold text-emerald-600" />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Metode Deposit Tersedia</label>
                                        <p className="text-[11px] text-slate-400 mb-2">Gunakan pemisah koma [,]. Contoh: QRIS,BCA_VA,MANDIRI_VA,OVO</p>
                                        <input type="text" value={settings.ACTIVE_DEPOSIT_CHANNELS || ''} onChange={e => handleUpdateSettingsField('ACTIVE_DEPOSIT_CHANNELS', e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* NOTIFICATIONS & SUPP CONFIG */}
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
                                <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
                                    <Server className="w-5 h-5 text-indigo-500" /> Webhook API & Provider Konfigurasi
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Digiflazz Username (Supplier Utama)</label>
                                        <input type="text" value={settings.DIGIFLAZZ_USERNAME || ''} onChange={e => handleUpdateSettingsField('DIGIFLAZZ_USERNAME', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">Digiflazz Prod Key <Lock className="w-3 h-3 text-red-400" /></label>
                                        <input type="password" value={settings.DIGIFLAZZ_KEY || ''} onChange={e => handleUpdateSettingsField('DIGIFLAZZ_KEY', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">WhatsApp API Token / Gateway URL</label>
                                        <input type="text" value={settings.WA_API_URL || ''} onChange={e => handleUpdateSettingsField('WA_API_URL', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">SMTP Email Service URL</label>
                                        <input type="text" value={settings.SMTP_URL || ''} onChange={e => handleUpdateSettingsField('SMTP_URL', e.target.value)} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono" placeholder="smtp://user:pass@smtp.host.com:587" />
                                    </div>
                                </div>
                            </div>

                            {/* ACTION BUTTON */}
                            <div className="flex justify-end sticky bottom-6 z-10">
                                <button onClick={handleSaveGlobalSettings} disabled={isSavingSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-black text-sm shadow-xl shadow-indigo-200/50 flex items-center gap-2 transition disabled:opacity-50">
                                    {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan Konfigurasi Platform
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* TAB 2: STAFF ADMIN */}
            {activeTab === 'STAFF' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Tim (Admin)</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Berikan akses panel admin Anda kepada staff kepercayaan dengan otorisasi terbatas.</p>
                        </div>
                        <button onClick={() => { setEditingStaffId(null); setStaffForm({ name: '', email: '', password: '', status: 'ACTIVE', permissions: [] }); setShowStaffModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Tambah Staff
                        </button>
                    </div>

                    {loadingStaff ? (
                        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] tracking-widest text-slate-400 font-bold">
                                    <tr>
                                        <th className="px-5 py-4 rounded-tl-xl">Pegawai / Staff</th>
                                        <th className="px-5 py-4">Status & Waktu Gabung</th>
                                        <th className="px-5 py-4">Tingkat Izin (Permissions)</th>
                                        <th className="px-5 py-4 text-right rounded-tr-xl">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {staffList?.length === 0 && <tr><td colSpan={4} className="text-center text-slate-400 p-8 font-medium">Belum ada staff admin terdaftar. Platform murni milik Anda.</td></tr>}
                                    {staffList?.map((admin: any) => (
                                        <tr key={admin.id} className="hover:bg-slate-50/50 transition">
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-slate-800">{admin.name}</p>
                                                <p className="text-xs text-slate-500">{admin.email}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${admin.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {admin.status}
                                                </span>
                                                <p className="text-[11px] text-slate-400 mt-1">Sejak {new Date(admin.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {admin.adminPermissions?.map((p: string) => (
                                                        <span key={p} className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${p === 'all_access' || p === 'ALL_ACCESS' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                            {p.toLowerCase().replace('manage_', '').replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                    {(!admin.adminPermissions || admin.adminPermissions.length === 0) && <span className="text-xs text-slate-400 italic">No specific permissions</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => {
                                                        setEditingStaffId(admin.id);
                                                        setStaffForm({ name: admin.name, email: admin.email, password: '', status: admin.status, permissions: admin.adminPermissions || [] });
                                                        setShowStaffModal(true);
                                                    }} className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteStaff(admin.id, admin.name)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: BACKGROUND JOBS */}
            {activeTab === 'JOBS' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Monitoring Task (Job Queues)</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Lihat dan atur ulang proses berjalan di latar belakang (seperti hit API digiflazz, Webhook, dll).</p>
                        </div>
                        <select value={jobStatusFilter} onChange={e => setJobStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-xs font-bold p-2.5 rounded-xl text-slate-700">
                            <option value="">Semua Antrian</option>
                            <option value="FAILED">Gagal (Minta Retry)</option>
                            <option value="PENDING">Menunggu (Pending)</option>
                            <option value="PROCESSING">Sedang Jalan (Processing)</option>
                            <option value="COMPLETED">Selesai (Completed)</option>
                        </select>
                    </div>

                    {loadingJobs ? (
                        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100">
                                    {jobQueues?.length === 0 && <tr><td className="text-center font-medium py-10 text-slate-400">Memory Job Queue kosong sempurna.</td></tr>}
                                    {jobQueues?.map((j: any) => (
                                        <tr key={j.id} className={`hover:bg-slate-50 transition border-l-4 ${j.status === 'FAILED' ? 'border-l-red-500' : j.status === 'COMPLETED' ? 'border-l-emerald-500' : 'border-l-orange-400'}`}>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-sm text-slate-800 uppercase tracking-wide">{j.type}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-1 line-clamp-1 max-w-sm">{JSON.stringify(j.payload)}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest 
                                                      ${j.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                        j.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                            'bg-orange-100 text-orange-700'}`}>{j.status}
                                                </span>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">Att: {j.retryCount}/{j.maxRetry}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1"><Terminal className="w-3 h-3" /> {new Date(j.scheduledAt).toLocaleString()}</p>
                                                {j.status === 'FAILED' && (
                                                    <button onClick={() => handleRetryJob(j.id)} className="mt-2 text-[10px] inline-flex font-bold items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-slate-200 transition border border-indigo-200">
                                                        <RotateCw className="w-3 h-3" /> Forceline (Retry)
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: STAFF */}
            {showStaffModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in text-left">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-indigo-50/50 shrink-0">
                            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                {editingStaffId ? <Edit className="w-5 h-5 text-indigo-600" /> : <UserPlus className="w-5 h-5 text-indigo-600" />}
                                {editingStaffId ? 'Edit Akses Staff' : 'Registrasi Admin Staff Baru'}
                            </h3>
                            <button onClick={() => setShowStaffModal(false)}><XCircle className="w-5 h-5 text-indigo-400 hover:text-indigo-900" /></button>
                        </div>
                        <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto flex-1 space-y-5">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Email Address</label>
                                    <input required type="email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold" placeholder="staff@dagangplay.com" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                                    <input required type="text" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Status Aktif</label>
                                <select value={staffForm.status} onChange={e => setStaffForm({ ...staffForm, status: e.target.value })} className={`w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold text-center ${staffForm.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                                    <option value="ACTIVE">ACTIVE (Akses Dibuka)</option>
                                    <option value="SUSPENDED">SUSPEND (Cabut Sementara)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Buku Sandi (Password) {!editingStaffId ? '(Wajib)' : '(Kosongkan jika tidak diganti)'}</label>
                                <input type="password" required={!editingStaffId} value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono" placeholder="**********" />
                            </div>
                            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-3 text-center border-b border-slate-200 pb-2">Atur Kewenangan / Izin Modul Sistem</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {availablePermissions.map(p => {
                                        const isChecked = staffForm.permissions.includes(p);
                                        return (
                                            <div key={p} onClick={() => togglePermission(p)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${isChecked ? 'border-indigo-400 bg-indigo-50/80 shadow-sm' : 'border-slate-200 bg-white opacity-70 hover:opacity-100 hover:border-slate-300'}`}>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                                                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className={`text-xs font-bold leading-tight ${isChecked ? 'text-indigo-900' : 'text-slate-600'}`}>{p.replace('_', ' ')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition">
                                {editingStaffId ? 'Simpan Perubahan Akses' : 'Buat Kredensial Staff'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
