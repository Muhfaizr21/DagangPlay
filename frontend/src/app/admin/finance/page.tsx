"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    Download,
    CheckCircle2,
    Loader2,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Wallet,
    Activity,
    XCircle,
    Eye,
    CornerDownRight
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function FinanceManagementPage() {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPOSIT' | 'WITHDRAWAL'>('OVERVIEW');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reject/Approve Modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [modalActionId, setModalActionId] = useState('');
    const [actionType, setActionType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
    const [actionReason, setActionReason] = useState('');
    const [actionReceipt, setActionReceipt] = useState('');

    // Fetch Data
    const { data: summary, error: summaryErr, isLoading: loadingSummary } = useSWR(
        (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/finance/summary',
        fetcher
    );

    const { data: deposits, error: depErr, isLoading: loadingDep, mutate: mutateDep } = useSWR(
        activeTab === 'DEPOSIT' ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/finance/deposits?status=${statusFilter}&search=${debouncedSearch}` : null,
        fetcher
    );

    const { data: withdrawals, error: wdErr, isLoading: loadingWd, mutate: mutateWd } = useSWR(
        activeTab === 'WITHDRAWAL' ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/finance/withdrawals?status=${statusFilter}` : null,
        fetcher
    );

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleConfirmDeposit = async (id: string) => {
        if (!confirm('Pastikan dana sudah benar-benar masuk ke rekening bank instansi. Konfirmasi deposit ini?')) return;
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/finance/deposits/${id}/confirm`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutateDep();
            showToast('Deposit Selesai', 'Saldo berhasil ditambahkan ke user.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error processing deposit', 'error');
        }
    };

    const handleProcessWd = async (id: string) => {
        if (!confirm('Tandai penarikan dana (Withdrawal) ini sebagai SUKSES ditransfer?')) return;
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/finance/withdrawals/${id}/process`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutateWd();
            showToast('Withdrawal Selesai', 'Status penarikan menjadi COMPLETED.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error processing withdrawal', 'error');
        }
    };

    const openRejectModal = (type: 'DEPOSIT' | 'WITHDRAWAL', id: string) => {
        setActionType(type);
        setModalActionId(id);
        setActionReason('');
        setShowRejectModal(true);
    };

    const openApproveModal = (type: 'DEPOSIT' | 'WITHDRAWAL', id: string) => {
        setActionType(type);
        setModalActionId(id);
        setActionReason('');
        setActionReceipt('');

        // For Deposit, we can still use simple confirm or modal too
        if (type === 'DEPOSIT') {
            handleConfirmDeposit(id);
        } else {
            setShowApproveModal(true);
        }
    };

    const submitApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/finance/withdrawals/${modalActionId}/process`, {
                note: actionReason,
                receiptImage: actionReceipt
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });

            mutateWd();
            showToast('Withdrawal Selesai', 'Status penarikan menjadi COMPLETED.');
            setShowApproveModal(false);
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error processing withdrawal', 'error');
        }
    };

    const submitReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionReason) return;

        try {
            if (actionType === 'DEPOSIT') {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/finance/deposits/${modalActionId}/reject`, { reason: actionReason }, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
                mutateDep();
                showToast('Sukses', 'Deposit telah ditolak.');
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/finance/withdrawals/${modalActionId}/reject`, { reason: actionReason }, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
                mutateWd();
                showToast('Sukses', 'Penarikan dana dibatalkan dan uang di-refund.');
            }
            setShowRejectModal(false);
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Gagal menolak transaksi', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED': case 'COMPLETED': return <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-bold tracking-wider">SUCCESS</span>;
            case 'PENDING': return <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200/60 text-[10px] font-bold tracking-wider">PENDING</span>;
            case 'REJECTED': return <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200/60 text-[10px] font-bold tracking-wider">REJECTED</span>;
            default: return <span className="text-[10px] text-slate-500 font-bold">{status}</span>;
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

            {/* REJECT MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200">
                        <h3 className="font-bold text-lg text-slate-800 mb-2 font-display">Tolak {actionType}</h3>
                        <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">Berikan alasan mengapa permintaan ini ditolak agar pengguna dapat mengetahuinya.</p>
                        <form onSubmit={submitReject}>
                            <textarea
                                required
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl p-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-400 mb-4 h-28 bg-slate-50 transition-all"
                                placeholder="Contoh: Bukti transfer tidak valid / Data rekening salah..."
                            />
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowRejectModal(false)} className="px-5 py-2.5 text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                                <button type="submit" className="px-5 py-2.5 text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition-all">Konfirmasi Tolak</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* APPROVE MODAL (With Receipt) */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md border border-slate-100 ring-1 ring-slate-900/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 tracking-tight">Setujui Penarikan Dana</h3>
                        </div>
                        <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">Selesaikan proses transfer ke rekening merchant, lalu lampirkan bukti atau catatan di sini sebagai arsip.</p>

                        <form onSubmit={submitApprove} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Bukti Transfer (URL/Link)</label>
                                <input
                                    type="text"
                                    value={actionReceipt}
                                    onChange={(e) => setActionReceipt(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-3.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 transition-all"
                                    placeholder="Tempel link screenshot bukti transfer (Imgur/Drive)..."
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Pesan / Catatan Internal</label>
                                <textarea
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl p-3.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 transition-all h-24"
                                    placeholder="Tulis catatan (opsional)..."
                                />
                            </div>
                            <div className="pt-2 flex gap-3 justify-end border-t border-slate-50 mt-2">
                                <button type="button" onClick={() => setShowApproveModal(false)} className="px-6 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors">Batal</button>
                                <button type="submit" className="px-6 py-2.5 text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2">
                                    Konfirmasi & Selesaikan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Keuangan</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Laporan finansial, verifikasi arus kas masuk (deposit) dan keluar (withdraw).</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[38px] px-4 inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Export Laporan Keuangan
                    </button>
                </div>
            </div>

            {/* TABS Navigation */}
            <div className="flex gap-1 border-b border-slate-200 mb-6 bg-white shrink-0 scrollbar-hide overflow-x-auto">
                <button
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`px-5 py-3 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'OVERVIEW' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Overview & Ringkasan Cashflow
                </button>
                <button
                    onClick={() => setActiveTab('DEPOSIT')}
                    className={`px-5 py-3 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'DEPOSIT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Verifikasi Deposit / Top Up Masuk
                </button>
                <button
                    onClick={() => setActiveTab('WITHDRAWAL')}
                    className={`px-5 py-3 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'WITHDRAWAL' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Permintaan Withdraw / Penarikan
                </button>
            </div>

            {/* TAB OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                    {loadingSummary ? (
                        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : summary ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-slate-500 mb-1">Total Omset Gross (All Time)</h3>
                                    <p className="text-2xl font-bold text-slate-800">Rp {summary.grossSales.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-slate-500 mb-1">Total Laba Bersih (Margin)</h3>
                                    <p className="text-2xl font-bold text-slate-800">Rp {summary.netMarginProfit.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-slate-500 mb-1">Arus Masuk (Deposit Valid)</h3>
                                    <p className="text-2xl font-bold text-slate-800">Rp {summary.totalDepositIn.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                                        <TrendingDown className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-[13px] font-bold text-slate-500 mb-1">Arus Keluar (Withdrawal)</h3>
                                    <p className="text-2xl font-bold text-slate-800">Rp {summary.totalWithdrawalOut.toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            {/* Chart Placeholder */}
                            <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                    <Activity className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">Grafik Chart Cashflow</h3>
                                <p className="text-sm text-slate-400">Library chart seperti Recharts belum diinstall.</p>
                            </div>
                        </>
                    ) : null}
                </div>
            )}

            {/* TAB DEPOSIT & WITHDRAWALS LIST */}
            {(activeTab === 'DEPOSIT' || activeTab === 'WITHDRAWAL') && (
                <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden min-h-[400px]">
                    {/* Controls */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari ID Pelanggan / Referensi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-400"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="PENDING">Menunggu Aksi (PENDING)</option>
                                <option value={activeTab === 'DEPOSIT' ? 'CONFIRMED' : 'COMPLETED'}>SUKSES / CONFIRMED</option>
                                <option value="REJECTED">DITOLAK</option>
                            </select>
                        </div>
                    </div>

                    {!loadingDep && !loadingWd && ((activeTab === 'DEPOSIT' && deposits) || (activeTab === 'WITHDRAWAL' && withdrawals)) && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Waktu Request</th>
                                        <th className="px-6 py-4">Data User</th>
                                        <th className="px-6 py-4">{activeTab === 'DEPOSIT' ? 'Metode & Bukti' : 'Bank & Rekening'}</th>
                                        <th className="px-6 py-4 text-right">Nominal Rp</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Tindakan Khusus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(activeTab === 'DEPOSIT' ? deposits : withdrawals).map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] font-semibold text-slate-800">{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                                                <br /><span className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleTimeString('id-ID')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[13px] font-bold text-indigo-600">{item.user?.name}</p>
                                                <p className="text-[11px] text-slate-500">{item.user?.role}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {activeTab === 'DEPOSIT' ? (
                                                    <>
                                                        <p className="text-[12px] font-bold text-slate-700">{item.method} ({item.provider})</p>
                                                        {item.receipt ? (
                                                            <button className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 mt-1 hover:underline">
                                                                Lihat Bukti Transfer <Eye className="w-3 h-3" />
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400">Tidak ada bukti upload</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-[12px] font-bold text-slate-700">{item.bankName}</p>
                                                        <p className="text-[11px] text-slate-500 font-mono">{item.bankAccountNumber}</p>
                                                        <p className="text-[11px] font-medium text-slate-600">A.N: {item.bankAccountName}</p>
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-[14px] font-bold text-emerald-600">Rp {Number(item.amount).toLocaleString('id-ID')}</p>
                                                {item.fee && Number(item.fee) > 0 && <p className="text-[10px] text-slate-400 mt-0.5">Fee: Rp {Number(item.fee).toLocaleString('id-ID')}</p>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {getStatusBadge(item.status)}
                                                    {item.note && <span className="text-[10px] text-red-500 line-clamp-1 max-w-[100px]" title={item.note}>{item.note}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    {item.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => openApproveModal(activeTab, item.id)}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-lg transition-all"
                                                                title="Approve / Loloskan"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(activeTab, item.id)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
                                                                title="Tolak Manual"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {(activeTab === 'DEPOSIT' ? deposits : withdrawals).length === 0 && (
                                <div className="p-10 text-center text-slate-500 font-medium text-sm">
                                    Tidak ada data {activeTab} yang sesuai.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

        </AdminLayout>
    );
}
