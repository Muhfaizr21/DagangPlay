"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { ShoppingCart, Search, RefreshCcw, HandCoins, ExternalLink, Filter } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantOrdersPage() {
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundReason, setRefundReason] = useState('');

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data, error, isLoading, mutate } = useSWR(
        `${baseUrl}/merchant/orders?search=${search}`,
        fetcher,
        { refreshInterval: 10000 } // real-time updates
    );

    const handleRetry = async (orderId: string) => {
        if (!confirm('Apakah Anda yakin ingin mencoba ulang transaksi ini ke provider?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`${baseUrl}/merchant/orders/${orderId}/retry`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert('Transaksi sedang dicoba ulang. Silakan tunggu beberapa saat.');
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal retry pesanan');
        }
    };

    const handleRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`${baseUrl}/merchant/orders/${selectedOrder.id}/refund`,
                { reason: refundReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Sukses melakukan refund. Saldo telah dikembalikan ke user.');
            setIsRefundModalOpen(false);
            setSelectedOrder(null);
            setRefundReason('');
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal merefund pesanan');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-bold">SUKSES</span>;
            case 'PENDING': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-[11px] font-bold">PENDING</span>;
            case 'PROCESSING': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[11px] font-bold">PROSES</span>;
            case 'FAILED': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[11px] font-bold">GAGAL</span>;
            case 'REFUNDED': return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">REFUND</span>;
            default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">{status}</span>;
        }
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Pesanan</h1>
                    <p className="text-slate-500 text-sm mt-1">Pantau transaksi dan proses pembatalan/refund.</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari Invoice, ID Game..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm transition-all text-sm font-bold flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-semibold mb-1">Total Pesanan</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{data?.stats?.totalCount || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-semibold mb-1">Success Rate</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{data?.stats?.successRate || 0}%</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tgl & Invoice</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Produk</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Pembeli</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Nominal</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={6} className="p-8 text-center text-red-500">Gagal memuat data</td></tr>
                            ) : data?.orders?.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-500">
                                    <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                    Belum ada transaksi ditemukan
                                </td></tr>
                            ) : (
                                data?.orders?.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-800">{order.orderNumber}</p>
                                            <p className="text-[12px] text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-800">{order.productSkuName}</p>
                                            <p className="text-[12px] text-indigo-600 mt-0.5 line-clamp-1">{order.gameUserId} {order.gameUserServerId ? `(${order.gameUserServerId})` : ''}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-slate-700">{order.customer?.name || order.reseller?.name || 'Guest'}</p>
                                            {order.reseller && <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">Reseller</span>}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-bold text-emerald-600">Rp {Number(order.totalPrice).toLocaleString('id-ID')}</p>
                                            <span className="text-[11px] text-slate-500 mt-0.5">{order.paymentMethod || 'Saldo'}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                {getStatusBadge(order.fulfillmentStatus)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            {(order.fulfillmentStatus === 'FAILED' || order.fulfillmentStatus === 'PENDING') && (
                                                <button
                                                    onClick={() => handleRetry(order.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                    title="Coba Ulang Transaksi"
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                </button>
                                            )}

                                            {(order.fulfillmentStatus === 'FAILED' || order.fulfillmentStatus === 'PENDING') && order.paymentStatus === 'PAID' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsRefundModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                    title="Refund ke Saldo User"
                                                >
                                                    <HandCoins className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Refund Modal */}
            {isRefundModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative transform transition-all">
                        <div className="p-6 border-b border-slate-100 bg-red-50/30">
                            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                                <HandCoins className="w-5 h-5" /> Konfirmasi Refund
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">Anda akan mengembalikan dana sebesar <b className="text-slate-800">Rp {Number(selectedOrder.totalPrice).toLocaleString('id-ID')}</b> ke saldo akun pembeli.</p>
                        </div>
                        <form onSubmit={handleRefund} className="p-6">
                            <div className="mb-6">
                                <label className="block text-[12px] font-bold text-slate-500 mb-2">Alasan Refund (Opsional)</label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 min-h-[100px]"
                                    placeholder="Contoh: Stok sedang kosong dari pusat"
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsRefundModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-200">
                                    Proses Refund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
