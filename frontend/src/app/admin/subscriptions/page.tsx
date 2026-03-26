"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Plus,
    Search,
    CreditCard,
    Calendar,
    Users,
    TrendingDown,
    TrendingUp,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    LayoutGrid,
    ArrowRight,
    X,
    Clock,
    DollarSign,
    Shield,
    Zap,
    Download,
    Eye,
    Settings,
    FileText
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function SaaSManagementPage() {
    const [activeTab, setActiveTab] = useState<'INVOICES' | 'PLANS'>('INVOICES');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
    const [adjustForm, setAdjustForm] = useState({ merchantId: '', merchantName: '', plan: 'PRO', days: 30 });
    const [createInvoiceForm, setCreateInvoiceForm] = useState({ merchantId: '', plan: 'PRO', amount: 0, dueDate: '' });
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // Plan Features State
    const [plansConfig, setPlansConfig] = useState<any>(null);
    const [isSavingPlans, setIsSavingPlans] = useState(false);

    const { data: invoices, isLoading, mutate } = useSWR(
        `http://localhost:3001/admin/subscriptions/invoices?search=${searchTerm}&status=${statusFilter}`,
        fetcher
    );

    const { data: perf } = useSWR('http://localhost:3001/admin/subscriptions/performance', fetcher);
    const { data: merchantsList } = useSWR('http://localhost:3001/admin/merchants', fetcher); // Use existing merchants API for dropdown

    // Fetch Plan Features
    useEffect(() => {
        if (activeTab === 'PLANS') {
            axios.get('http://localhost:3001/admin/subscriptions/plans/features', { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } })
                .then(res => {
                    setPlansConfig(res.data);
                })
                .catch(err => {
                    console.error("Gagal memuat konfigurasi features", err);
                });
        }
    }, [activeTab]);

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleConfirm = async (id: string) => {
        if (!confirm('Konfirmasi pembayaran invoice ini dan perpanjang langganan merchant?')) return;
        try {
            await axios.post(`http://localhost:3001/admin/subscriptions/invoices/${id}/confirm`, {}, { headers: { Authorization: `Bearer \${localStorage.getItem('admin_token')}` } });
            mutate();
            setSelectedInvoice(null);
            showToast('Berhasil', 'Invoice telah terbayar & Langganan diperbarui.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Alasan penolakan:');
        if (reason === null) return;
        try {
            await axios.post(`http://localhost:3001/admin/subscriptions/invoices/${id}/reject`, { notes: reason }, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutate();
            setSelectedInvoice(null);
            showToast('Ditolak', 'Pembayaran invoice telah ditolak.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleAdjust = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:3001/admin/subscriptions/merchants/${adjustForm.merchantId}/adjust`, {
                plan: adjustForm.plan,
                days: adjustForm.days
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutate();
            setShowAdjustModal(false);
            showToast('Selesai', 'Plan merchant telah disesuaikan manual.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/admin/subscriptions/invoices/manual', createInvoiceForm, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutate();
            setShowCreateInvoiceModal(false);
            setCreateInvoiceForm({ merchantId: '', plan: 'PRO', amount: 0, dueDate: '' });
            showToast('Sukses', 'Invoice langganan berhasil dibuat secara manual.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleSavePlansConfig = async () => {
        setIsSavingPlans(true);
        try {
            await axios.post('http://localhost:3001/admin/subscriptions/plans/features', plansConfig, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            showToast('Tersimpan', 'Konfigurasi limit dan akses fitur per plan telah diperbarui.');
        } catch (err: any) {
            showToast('Gagal', 'Terjadi kesalahan saat menyimpan pengaturan plan.', 'error');
        } finally {
            setIsSavingPlans(false);
        }
    };

    const updatePlanConfig = (planKey: string, field: string, value: any) => {
        setPlansConfig((prev: any) => ({
            ...prev,
            [planKey]: {
                ...prev[planKey],
                [field]: value
            }
        }));
    };

    const exportToCSV = () => {
        if (!invoices || invoices.length === 0) return showToast('Error', 'Tidak ada data untuk diexport', 'error');
        const headers = ["Invoice No", "Merchant", "Plan", "Amount", "Status", "Created At", "Due Date"];
        const rows = invoices.map((inv: any) => [
            inv.invoiceNo,
            inv.merchant?.name || '-',
            inv.plan,
            inv.totalAmount,
            inv.status,
            new Date(inv.createdAt).toISOString(),
            new Date(inv.dueDate).toISOString()
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `invoices_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            {toastMsg && (
                <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-start gap-3 ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                        <div>
                            <p className="font-bold text-sm">{toastMsg.title}</p>
                            <p className="text-[13px] opacity-90 mt-0.5">{toastMsg.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen SaaS & Subscriptions</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Kelola pendapatan berulang dari merchant dan siklus hidup pelanggan SaaS.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('INVOICES')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'INVOICES' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText className="w-4 h-4" /> Invoices
                    </button>
                    <button
                        onClick={() => setActiveTab('PLANS')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === 'PLANS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Settings className="w-4 h-4" /> Config Plans
                    </button>
                </div>
            </div>

            {activeTab === 'INVOICES' && (
                <>
                    {/* Performance Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
                                <DollarSign className="w-12 h-12" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue Langganan</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">Rp {perf?.totalRevenue?.toLocaleString('id-ID') || 0}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Merchant Aktif</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-black text-slate-800 mt-1">{perf?.activeMerchants || 0}</p>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Akses Expired</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{perf?.expiredMerchants || 0}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-orange-400">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Churn Rate</p>
                            <p className="text-2xl font-black text-orange-600 mt-1">{perf?.churnRate || '0%'}</p>
                        </div>
                    </div>

                    {/* Table & Filters */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari Merchant atau No Invoice..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="UNPAID">Unpaid</option>
                                    <option value="PENDING">Pending (TF Manual)</option>
                                    <option value="PAID">Paid</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                                <button onClick={() => setShowCreateInvoiceModal(true)} className="h-[38px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2 text-sm font-bold shadow-sm shadow-indigo-200">
                                    <Plus className="w-4 h-4" /> Buat Invoice
                                </button>
                                <button onClick={exportToCSV} className="h-[38px] px-4 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 text-sm font-medium">
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Invoice / Merchant</th>
                                            <th className="px-6 py-4">Plan Saat Ini</th>
                                            <th className="px-6 py-4">Plan Target</th>
                                            <th className="px-6 py-4">Total Tagihan</th>
                                            <th className="px-6 py-4">Dibuat / Tempo</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {invoices?.length === 0 ? (
                                            <tr><td colSpan={6} className="text-center py-10 text-slate-500 font-medium">Belum ada data invoice terbuat.</td></tr>
                                        ) : invoices?.map((inv: any) => (
                                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                                            <CreditCard className="w-5 h-5 shadow-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-[13px]">{inv.invoiceNo}</p>
                                                            <p className="text-[11px] text-slate-500 font-medium">{inv.merchant.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase truncate ${inv.merchant.plan === 'SUPREME' ? 'bg-orange-50 text-orange-600' :
                                                            inv.merchant.plan === 'LEGEND' ? 'bg-purple-50 text-purple-600' :
                                                                inv.merchant.plan === 'PRO' ? 'bg-blue-50 text-blue-600' :
                                                                    'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {inv.merchant.plan || 'FREE'}
                                                        </span>
                                                        <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border uppercase ${inv.plan === 'SUPREME' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        inv.plan === 'LEGEND' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            inv.plan === 'PRO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-slate-50 text-slate-600 border-slate-200'
                                                        }`}>
                                                        {inv.plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[14px] font-black text-slate-700">Rp {Number(inv.totalAmount).toLocaleString('id-ID')}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[11px] text-slate-500 font-medium">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-red-500 font-bold mt-0.5">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        inv.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 sticky-blink' :
                                                            inv.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-slate-50 text-slate-500 border-slate-200'
                                                        }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedInvoice(inv)}
                                                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                            title="Lihat Detail & Bukti"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setAdjustForm({
                                                                    merchantId: inv.merchantId,
                                                                    merchantName: inv.merchant.name,
                                                                    plan: inv.plan,
                                                                    days: 30
                                                                });
                                                                setShowAdjustModal(true);
                                                            }}
                                                            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                                            title="Adjust Manual Plan"
                                                        >
                                                            <Zap className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'PLANS' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-8 animate-in fade-in">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Setup Limit & Fitur Plan</h2>
                            <p className="text-sm text-slate-500 mt-1">Konfigurasikan harga dan batasan fitur untuk masing-masing kasta langganan.</p>
                        </div>
                        <button
                            onClick={handleSavePlansConfig}
                            disabled={isSavingPlans}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
                        >
                            {isSavingPlans ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                            Simpan Perubahan
                        </button>
                    </div>

                    {!plansConfig ? (
                        <div className="flex items-center gap-2 text-slate-400 py-10 justify-center"><Loader2 className="w-5 h-5 animate-spin" /> Loading Config...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['PRO', 'LEGEND', 'SUPREME'].map((planKey) => (
                                <div key={planKey} className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
                                    <div className="text-center mb-6">
                                        <span className={`inline-block px-3 py-1 text-xs font-black uppercase rounded-full mb-2 ${planKey === 'SUPREME' ? 'bg-orange-100 text-orange-700' :
                                            planKey === 'LEGEND' ? 'bg-purple-100 text-purple-700' :
                                                planKey === 'PRO' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-200 text-slate-600'
                                            }`}>{planKey}</span>
                                        <p className="font-medium text-xs text-slate-500">Subscription Tier</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Singkat</label>
                                            <input
                                                type="text"
                                                value={plansConfig[planKey]?.description || ''}
                                                onChange={e => updatePlanConfig(planKey, 'description', e.target.value)}
                                                placeholder="Contoh: Mulai bisnis dengan mudah!"
                                                className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-1 focus:ring-indigo-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Input Max Products (Limit)</label>
                                            <input
                                                type="number"
                                                value={plansConfig[planKey]?.maxProducts || 0}
                                                onChange={e => updatePlanConfig(planKey, 'maxProducts', Number(e.target.value))}
                                                className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-1 focus:ring-indigo-500 transition"
                                            />
                                        </div>
                                        {/* Harga */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Harga / Bulan (Rp)</label>
                                                <input
                                                    type="number"
                                                    value={plansConfig[planKey]?.price || 0}
                                                    onChange={e => updatePlanConfig(planKey, 'price', Number(e.target.value))}
                                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-500 transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Harga / Tahun (Rp)</label>
                                                <input
                                                    type="number"
                                                    value={plansConfig[planKey]?.yearlyPrice || 0}
                                                    onChange={e => updatePlanConfig(planKey, 'yearlyPrice', Number(e.target.value))}
                                                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-700 focus:ring-1 focus:ring-emerald-500 transition"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Potensi Profit Label</label>
                                            <input
                                                type="text"
                                                value={plansConfig[planKey]?.maxProfitLabel || ''}
                                                onChange={e => updatePlanConfig(planKey, 'maxProfitLabel', e.target.value)}
                                                placeholder="Contoh: Rp30jt/bln"
                                                className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-orange-600 focus:ring-1 focus:ring-orange-400 transition"
                                            />
                                        </div>

                                        {/* Domain */}
                                        <div className="border-t border-slate-200 pt-3">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Domain & Akses</p>
                                            <div className="space-y-1.5">
                                                {[
                                                    { key: 'customDomain', label: 'Custom Domain' },
                                                    { key: 'multiUser', label: 'Multi User (Staff)' },
                                                    { key: 'whiteLabel', label: 'White Label' },
                                                    { key: 'tldDomain', label: 'Dapat Domain TLD' },
                                                ].map(({ key, label }) => (
                                                    <div key={key} className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                                                        <span className="text-[11px] font-bold text-slate-600">{label}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={plansConfig[planKey]?.[key] || false}
                                                            onChange={e => updatePlanConfig(planKey, key, e.target.checked)}
                                                            className="w-4 h-4 rounded text-indigo-600"
                                                        />
                                                    </div>
                                                ))}
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Pilihan Domain (jumlah)</label>
                                                    <input
                                                        type="number"
                                                        value={plansConfig[planKey]?.domainChoices || 0}
                                                        onChange={e => updatePlanConfig(planKey, 'domainChoices', Number(e.target.value))}
                                                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-1 focus:ring-indigo-500 transition"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fitur Premium */}
                                        <div className="border-t border-slate-200 pt-3">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Fitur Premium</p>
                                            <div className="space-y-1.5">
                                                {[
                                                    { key: 'seoPixel', label: 'Optimasi SEO & Pixel' },
                                                    { key: 'couponManagement', label: 'Manajemen Kupon Diskon' },
                                                    { key: 'templateVariants', label: 'Variasi Template Website' },
                                                    { key: 'flashSale', label: '⚡ Flash Sale / Countdown Timer' },
                                                    { key: 'instantWithdrawal', label: '💸 Penarikan Saldo Instan' },
                                                    { key: 'customProductDetail', label: '🎮 Kustomisasi Detail Produk' },
                                                    { key: 'buildApk', label: '📱 Build Your APK' },
                                                    { key: 'resellerAcademy', label: '🎓 Reseller Academy' },
                                                    { key: 'prioritySupport', label: '🟢 Prioritized Support (WhatsApp)' },
                                                ].map(({ key, label }) => (
                                                    <div key={key} className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded-lg">
                                                        <span className="text-[11px] font-bold text-slate-600">{label}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={plansConfig[planKey]?.[key] || false}
                                                            onChange={e => updatePlanConfig(planKey, key, e.target.checked)}
                                                            className="w-4 h-4 rounded text-indigo-600"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 mt-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase">Fitur Tambahan (Teks)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const curr = plansConfig[planKey]?.customFeatures || [];
                                                        updatePlanConfig(planKey, 'customFeatures', [...curr, '']);
                                                    }}
                                                    className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold hover:bg-slate-300 transition"
                                                >
                                                    + Tambah
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {(plansConfig[planKey]?.customFeatures || []).map((feat: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={feat}
                                                            onChange={(e) => {
                                                                const arr = [...(plansConfig[planKey]?.customFeatures || [])];
                                                                arr[i] = e.target.value;
                                                                updatePlanConfig(planKey, 'customFeatures', arr);
                                                            }}
                                                            placeholder="Nama fitur..."
                                                            className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const arr = [...(plansConfig[planKey]?.customFeatures || [])];
                                                                arr.splice(i, 1);
                                                                updatePlanConfig(planKey, 'customFeatures', arr);
                                                            }}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!plansConfig[planKey]?.customFeatures || plansConfig[planKey]?.customFeatures.length === 0) && (
                                                    <p className="text-[10px] text-slate-400 italic text-center py-2">Belum ada fitur tambahan spesifik</p>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* CREATE INVOICE MODAL */}
            {showCreateInvoiceModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Buat Tagihan (Invoice)</h3>
                                <p className="text-[11px] text-slate-500 font-medium">Buat invoice kustom tanpa request via front-end.</p>
                            </div>
                            <button onClick={() => setShowCreateInvoiceModal(false)} className="p-2 bg-white rounded-full text-slate-400 border border-slate-200 shadow-sm hover:text-slate-700 transition"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Merchant (Tenant)</label>
                                <select
                                    required
                                    value={createInvoiceForm.merchantId}
                                    onChange={e => setCreateInvoiceForm({ ...createInvoiceForm, merchantId: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                >
                                    <option value="">-- Pilih Toko --</option>
                                    {merchantsList?.map((m: any) => (
                                        <option key={m.id} value={m.id}>{m.name} - {m.domain}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">Target Plan</label>
                                    <select
                                        required
                                        value={createInvoiceForm.plan}
                                        onChange={e => setCreateInvoiceForm({ ...createInvoiceForm, plan: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-indigo-700"
                                    >
                                        <option value="PRO">Pro</option>
                                        <option value="LEGEND">Legend</option>
                                        <option value="SUPREME">Supreme</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">Nominal Tagihan (Rp)</label>
                                    <input
                                        type="number" required min="0"
                                        value={createInvoiceForm.amount}
                                        onChange={e => setCreateInvoiceForm({ ...createInvoiceForm, amount: Number(e.target.value) })}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">Jatuh Tempo (Due Date)</label>
                                <input
                                    type="date" required
                                    value={createInvoiceForm.dueDate}
                                    onChange={e => setCreateInvoiceForm({ ...createInvoiceForm, dueDate: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                />
                            </div>
                            <button type="submit" className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" /> Terbitkan Invoice
                            </button>
                        </form>
                    </div>
                </div >
            )
            }

            {/* INVOICE DETAIL MODAL */}
            {
                selectedInvoice && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
                            {/* Left: Invoice Info */}
                            <div className="flex-1 p-8 border-r border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="text-right uppercase tracking-widest text-slate-400 font-bold text-[10px]">Invoice Summary</div>
                                </div>

                                <h3 className="text-xl font-black text-slate-800 tracking-tight">{selectedInvoice.invoiceNo}</h3>
                                <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-tighter">{selectedInvoice.merchant.name}</p>

                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-xs text-slate-400 font-bold">Plan Target</span>
                                        <span className="text-sm font-black text-slate-700">{selectedInvoice.plan}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-xs text-slate-400 font-bold">Nominal Pokok</span>
                                        <span className="text-sm font-black text-slate-700">Rp {Number(selectedInvoice.amount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-xs text-slate-400 font-bold text-red-400">Pajak (PPN)</span>
                                        <span className="text-sm font-black text-red-500">Rp {Number(selectedInvoice.tax).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-sm text-slate-700 font-black">Total Bayar</span>
                                        <span className="text-xl font-black text-indigo-700">Rp {Number(selectedInvoice.totalAmount).toLocaleString()}</span>
                                    </div>
                                </div>

                                {selectedInvoice.status === 'PENDING' && (
                                    <div className="mt-10 flex flex-col gap-3">
                                        <button onClick={() => handleConfirm(selectedInvoice.id)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition">
                                            <CheckCircle2 className="w-5 h-5" /> Konfirmasi Bayar
                                        </button>
                                        <button onClick={() => handleReject(selectedInvoice.id)} className="w-full py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2">
                                            <XCircle className="w-5 h-5" /> Tolak Data
                                        </button>
                                    </div>
                                )}

                                <button onClick={() => setSelectedInvoice(null)} className="w-full mt-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition">Tutup Detail</button>
                            </div>

                            {/* Right: Payment Proof */}
                            <div className="flex-1 bg-slate-50 p-8 flex flex-col items-center justify-center text-center">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> Bukti Pembayaran Manual
                                </h4>
                                {selectedInvoice.proofUrl ? (
                                    <div className="w-full aspect-[3/4] bg-white rounded-2xl shadow-inner border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                                        <img src={selectedInvoice.proofUrl} className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <a href={selectedInvoice.proofUrl} target="_blank" className="bg-white p-3 rounded-full text-indigo-600 shadow-xl scale-95 group-hover:scale-100 transition duration-300">
                                                <Eye className="w-6 h-6" />
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                                        <XCircle className="w-16 h-16 text-slate-300 mb-4" />
                                        <p className="text-sm font-bold text-slate-400">Bukti transfer belum diunggah</p>
                                    </div>
                                )}
                                <p className="mt-6 text-[11px] text-slate-500 leading-relaxed italic">
                                    Periksa nomor referensi, nominal, dan nama pengirim sesuai struk bank sebelum konfirmasi.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ADJUST MODAL */}
            {
                showAdjustModal && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                                <div>
                                    <h2 className="text-lg font-black text-indigo-900 tracking-tight flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-indigo-600" /> Adjust Plan Merchant
                                    </h2>
                                    <p className="text-[11px] text-indigo-700 font-bold opacity-80 mt-0.5">{adjustForm.merchantName}</p>
                                </div>
                                <button onClick={() => setShowAdjustModal(false)} className="p-2 text-indigo-400 hover:text-indigo-900 hover:bg-white rounded-full transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAdjust} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Plan Baru</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['FREE', 'PRO', 'LEGEND', 'SUPREME'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setAdjustForm({ ...adjustForm, plan: p })}
                                                className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition ${adjustForm.plan === p ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Durasi Tambahan (Hari)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={adjustForm.days}
                                            onChange={e => setAdjustForm({ ...adjustForm, days: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                                        />
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-800 font-medium">Aksi ini akan merubah akses fitur merchant seketika tanpa membutuhkan pembayaran invoice.</p>
                                </div>
                                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition">
                                    Simpan Perubahan Akses
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            <style jsx global>{`
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                .sticky-blink { animation: blink 2s infinite; }
            `}</style>
        </AdminLayout >
    );
}
