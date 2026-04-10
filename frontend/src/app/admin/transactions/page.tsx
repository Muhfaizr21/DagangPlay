"use client";
import { getApiUrl } from '@/lib/api';
import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    MoreVertical,
    Download,
    CheckCircle2,
    Loader2,
    AlertCircle,
    RefreshCw,
    Ban,
    ReceiptText,
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

export default function TransactionManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); // FIX FE-5: Debounced search
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // FIX FE-5: Debounce search input 400ms to prevent per-keystroke API flood
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // States for Detail Modal
    const [selectedTrxId, setSelectedTrxId] = useState<string | null>(null);

    // States for Fraud Modal
    const [showFraudModal, setShowFraudModal] = useState(false);
    const [fraudReason, setFraudReason] = useState('');

    // Fetch Data — use debouncedSearch for API calls
    const { data: fetchResult, error, isLoading, mutate } = useSWR(
        `${getApiUrl()}/admin/transactions?search=${debouncedSearch}&fulfillmentStatus=${statusFilter}&page=${page}&limit=20`,
        fetcher,
        { refreshInterval: 15000 }
    );
    const transactions = fetchResult?.data || [];
    const meta = fetchResult?.meta;

    const { data: trxDetail, error: detailError, isLoading: loadingDetail, mutate: mutateDetail } = useSWR(
        selectedTrxId ? `${getApiUrl()}/admin/transactions/${selectedTrxId}` : null,
        fetcher
    );

    // Actions
    const handleRetry = async (id: string) => {
        try {
            if (!confirm(`Yakin ingin melakukan RETRY ke Supplier API?`)) return;
            await axios.post(`${getApiUrl()}/admin/transactions/${id}/retry`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutate();
            if (selectedTrxId === id) mutateDetail();
            setToastMsg({ title: 'Berhasil', desc: `Transaksi dimasukkan antrian retry`, type: 'success' });
        } catch (err: any) {
            setToastMsg({ title: 'Error', desc: err.response?.data?.message || 'Gagal retry', type: 'error' });
        } finally {
            setTimeout(() => setToastMsg(null), 3000);
        }
    };

    const handleRefund = async (id: string) => {
        try {
            if (!confirm(`Lakukan REFUND dana kembali ke balance user?`)) return;
            await axios.post(`${getApiUrl()}/admin/transactions/${id}/refund`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
            mutate();
            if (selectedTrxId === id) mutateDetail();
            setToastMsg({ title: 'Refund Diproses', desc: `Saldo telah dikembalikan ke user`, type: 'success' });
        } catch (err: any) {
            setToastMsg({ title: 'Refund Gagal', desc: err.response?.data?.message || 'Gagal refund', type: 'error' });
        } finally {
            setTimeout(() => setToastMsg(null), 3000);
        }
    };

    const submitFraudMark = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrxId || !fraudReason) return;
        // FIX FE-3: Add Authorization header — was missing, causing 401 on every fraud mark
        const token = localStorage.getItem('admin_token');
        try {
            await axios.post(
                `${getApiUrl()}/admin/transactions/${selectedTrxId}/mark-fraud`,
                { reason: fraudReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            mutate();
            mutateDetail();
            setToastMsg({ title: 'Fraud Ditambahkan', desc: `Transaksi diamankan karena indikasi penipuan`, type: 'success' });
            setShowFraudModal(false);
        } catch (err: any) {
            setToastMsg({ title: 'Gagal', desc: err.response?.data?.message || 'Server error', type: 'error' });
        } finally {
            setTimeout(() => setToastMsg(null), 3000);
        }
    };

    const getFulfillmentBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-bold tracking-wider">SUCCESS</span>;
            case 'PENDING': return <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200/60 text-[10px] font-bold tracking-wider">PENDING</span>;
            case 'PROCESSING': return <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200/60 text-[10px] font-bold tracking-wider">PROCESSING</span>;
            case 'FAILED': return <span className="px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200/60 text-[10px] font-bold tracking-wider">FAILED</span>;
            case 'REFUNDED': return <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-bold tracking-wider">REFUNDED</span>;
            default: return <span className="text-[10px] text-slate-500 font-bold">{status}</span>;
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'PAID': return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1 w-max"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PAID</span>;
            case 'PENDING': return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1 w-max"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> UNPAID</span>;
            case 'EXPIRED': return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1 w-max"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> EXPIRED</span>;
            default: return null;
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

            {/* DETAIL DRAWER / MODAL */}
            {selectedTrxId && (
                <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm flex justify-end">
                    <div className="w-full max-w-2xl bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right-8">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    Detail Transaksi
                                    {trxDetail?.fraudDetections && trxDetail.fraudDetections.length > 0 && (
                                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> FRAUD DETECTED
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedTrxId}</p>
                            </div>
                            <button onClick={() => setSelectedTrxId(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetail ? (
                                <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                            ) : trxDetail ? (
                                <div className="space-y-8">
                                    {/* Section 1: Overview */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Status Fulfillment</p>
                                            {getFulfillmentBadge(trxDetail.fulfillmentStatus)}
                                            {trxDetail.failReason && <p className="text-xs text-red-500 mt-2 font-medium break-words">{trxDetail.failReason}</p>}
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Status Payment</p>
                                            {getPaymentBadge(trxDetail.paymentStatus)}
                                        </div>
                                    </div>

                                    {/* Section 2: Info Produk */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><ReceiptText className="w-4 h-4 text-slate-400" /> Info Produk & Pembeli</h3>
                                        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                                            <div className="p-3 flex justify-between">
                                                <span className="text-sm text-slate-500">Nama Produk</span>
                                                <span className="text-sm font-semibold text-slate-800 text-right">{trxDetail.productName}<br /><span className="text-indigo-600 text-[12px]">{trxDetail.productSkuName}</span></span>
                                            </div>
                                            <div className="p-3 flex justify-between">
                                                <span className="text-sm text-slate-500">Data Player UID</span>
                                                <span className="text-sm font-mono font-bold text-slate-800">{trxDetail.gameUserId} {trxDetail.gameUserServerId ? `(${trxDetail.gameUserServerId})` : ''} - {trxDetail.gameUserName}</span>
                                            </div>
                                            <div className="p-3 flex justify-between">
                                                <span className="text-sm text-slate-500">Invoice (Total Rp)</span>
                                                <span className="text-sm font-bold text-slate-800">Rp {Number(trxDetail.totalPrice).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="p-3 flex justify-between">
                                                <span className="text-sm text-slate-500">Customer (User)</span>
                                                <span className="text-sm font-medium text-slate-700">{trxDetail.customer?.name} ({trxDetail.customer?.email})</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Action Override */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleRetry(trxDetail.id)}
                                            disabled={trxDetail.fulfillmentStatus === 'SUCCESS'}
                                            className="flex-1 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                        >
                                            <RefreshCw className="w-4 h-4" /> Manual Retry
                                        </button>
                                        <button
                                            onClick={() => handleRefund(trxDetail.id)}
                                            disabled={trxDetail.fulfillmentStatus === 'REFUNDED' || trxDetail.paymentStatus !== 'PAID'}
                                            className="flex-1 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                        >
                                            <CornerDownRight className="w-4 h-4" /> Refund Saldo
                                        </button>
                                        <button
                                            onClick={() => setShowFraudModal(true)}
                                            className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                        >
                                            <Ban className="w-4 h-4" /> Mark As Fraud
                                        </button>
                                    </div>

                                    {/* Section 4: History log */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-3">Audit Trails & Status History</h3>
                                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                            {trxDetail.statusHistories?.map((hist: any, i: number) => (
                                                <div key={hist.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                        <span className="text-[10px] font-bold">{hist.status.substring(0, 3)}</span>
                                                    </div>
                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="font-bold text-slate-800 text-xs">{hist.status}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{new Date(hist.createdAt).toLocaleTimeString('id-ID')}</div>
                                                        </div>
                                                        <div className="text-slate-500 text-[11px] leading-tight break-words">{hist.note || 'No notes'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            ) : null}
                        </div>

                        {/* Fraud Modal Child */}
                        {showFraudModal && (
                            <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                                    <h3 className="font-bold text-lg text-slate-800 mb-2">Tandai Indikasi Fraud</h3>
                                    <p className="text-sm text-slate-500 mb-4">Akun akan dipantau secara khusus jika ditandai. Mohon berikan alasan detil.</p>
                                    <form onSubmit={submitFraudMark}>
                                        <textarea
                                            required
                                            value={fraudReason}
                                            onChange={(e) => setFraudReason(e.target.value)}
                                            className="w-full border border-red-200 bg-red-50/30 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4 h-24"
                                            placeholder="Misal: Indikasi CC Curian / Bug abusing..."
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button type="button" onClick={() => setShowFraudModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg">Batal</button>
                                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Tandai Transaksi</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Page Layout */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Transaksi</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Pantau seluruh pergerakan order dari pelanggan dan reseller.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[38px] px-4 inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Export Transaksi
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
                            placeholder="Cari ID Trx / UID Game / ID Trx Supplier..."
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
                                className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">Semua Pengiriman</option>
                                <option value="SUCCESS">SUCCESS (Digiflazz)</option>
                                <option value="PENDING">PENDING</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="FAILED">FAILED (Gagal)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading / Error States */}
                {isLoading && (
                    <div className="flex flex-col flex-1 items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-medium">Memuat miliaran data transaksi...</p>
                    </div>
                )}

                {/* Table Data */}
                {!isLoading && !error && transactions && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">ID & Waktu Trx</th>
                                    <th className="px-6 py-4">Misi Terpilih (Katalog)</th>
                                    <th className="px-6 py-4">Pembeli & Target (UID/ID)</th>
                                    <th className="px-6 py-4 text-center">Status Transaksi</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((trx: any) => (
                                    <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-[12px] font-mono font-semibold text-slate-800 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">#{trx.orderNumber}</span>
                                                <span className="text-[11px] text-slate-400">{new Date(trx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-slate-700">{trx.productName}</span>
                                                <span className="text-[12px] text-indigo-600 font-medium">{trx.productSkuName}</span>
                                                <span className="text-[11px] font-semibold text-emerald-600 mt-1">Rp {Number(trx.totalPrice).toLocaleString('id-ID')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-[12px] font-bold text-slate-800">{trx.gameUserId} {trx.gameUserServerId ? `(${trx.gameUserServerId})` : ''} - <span className="font-semibold text-slate-500 italic">{trx.gameUserName || 'No Name'}</span></p>
                                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> By {trx.customer?.name} ({trx.merchant?.name || ''})</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                {getFulfillmentBadge(trx.fulfillmentStatus)}
                                                {getPaymentBadge(trx.paymentStatus)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedTrxId(trx.id)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1 ml-auto">
                                                Detail Trx <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {transactions.length === 0 && (
                            <div className="p-10 text-center text-slate-500 font-medium text-sm">
                                Tidak ada data transaksi yang sesuai filter.
                            </div>
                        )}

                        {meta && meta.totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-sm text-slate-500 font-medium">
                                    Hal {meta.currentPage} dari {meta.totalPages} <span className="text-slate-400">({meta.totalItems} transaksi)</span>
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
