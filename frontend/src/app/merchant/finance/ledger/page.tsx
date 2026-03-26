"use client";
import React, { useState } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    Wallet,
    Clock,
    ArrowDownToLine,
    RefreshCw,
    Settings,
    FileText,
    ArrowRightLeft,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let merchantId = "";
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        merchantId = user.merchantId || '';
    } catch(e) {}
    
    return axios.get(`${url}?merchantId=${merchantId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
    }).then(res => res.data);
};

export default function MerchantFinanceLedgerPage() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    // Fetch data using SWR with real-time polling
    const { data: ledger, error, isLoading, mutate } = useSWR(`${baseUrl}/saas/merchant/ledger`, fetcher, {
        refreshInterval: 5000,
        revalidateOnFocus: true
    });

    // Local states
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Handler for toggling Auto-Payout
    const toggleAutoPayout = async () => {
        if (!ledger) return;
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await axios.post(`${baseUrl}/saas/merchant/payout/auto`, {
                merchantId: user.merchantId,
                enabled: !ledger.autoPayoutEnabled,
                threshold: ledger.autoPayoutThreshold,
                schedule: ledger.autoPayoutSchedule
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate({ ...ledger, autoPayoutEnabled: !ledger.autoPayoutEnabled }, false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <MerchantLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            </MerchantLayout>
        );
    }

    if (error || !ledger) {
        return (
            <MerchantLayout>
                <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-200">
                    Gagal memuat data Ledger. Silakan cek koneksi Backend.
                </div>
            </MerchantLayout>
        );
    }

    return (
        <MerchantLayout>
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Keuangan & Saldo</h1>
                    <p className="text-sm text-gray-500 font-medium">Pantau mutasi pendapatan, pencairan dana, dan otorisasi ledger.</p>
                </div>
                <div className="flex gap-2">
                    <button className="h-9 px-4 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-sm font-medium transition-colors">
                        <ArrowDownToLine className="w-4 h-4" />
                        Tarik Saldo
                    </button>
                    <button className="h-9 px-4 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm font-medium transition-colors border border-transparent">
                        <Settings className="w-4 h-4" />
                        Pengaturan Payout
                    </button>
                </div>
            </div>

            {/* Dashboard Saldo Minimalist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Available Balance Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Available Balance</h3>
                    </div>
                    
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
                        Rp {Number(ledger.availableBalance || 0).toLocaleString('id-ID')}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium pb-5 border-b border-gray-100 flex-1">
                        Saldo aktif yang tersedia untuk penarikan.
                    </p>
                    
                    <div className="pt-4 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <span className={`flex h-2 w-2 rounded-full ${ledger.autoPayoutEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-xs font-medium text-gray-600">Auto-Payout {ledger.autoPayoutEnabled ? 'Aktif' : 'Nonaktif'}</span>
                        </div>
                        <button 
                            onClick={toggleAutoPayout}
                            disabled={isUpdating}
                            className={`text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded transition-colors ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUpdating ? 'Menyimpan...' : 'Ubah Status'}
                        </button>
                    </div>
                </div>

                {/* Escrow Balance Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Escrow Balance</h3>
                    </div>
                    
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
                        Rp {Number(ledger.escrowBalance || 0).toLocaleString('id-ID')}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium pb-5 border-b border-gray-200 flex-1">
                        Dana tertahan sementara menunggu penyelesaian pesanan.
                    </p>
                    
                    <div className="pt-4 mt-auto">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">Estimasi Settlement</span>
                            <span className="font-semibold text-gray-900">00:00 WIB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mutasi Ledger Detail */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Riwayat Mutasi Saldo</h3>
                    </div>
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Cari ID Trx..." className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 w-48 transition-all" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                <th className="px-5 py-3">Waktu & Trx ID</th>
                                <th className="px-5 py-3">Keterangan</th>
                                <th className="px-5 py-3 text-right">Debit / Credit</th>
                                <th className="px-5 py-3 text-right">Saldo Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {(!ledger.movements || ledger.movements.length === 0) ? (
                                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">Belum ada pergerakan saldo (Ledger Movement).</td></tr>
                            ) : ledger.movements.map((mov: any, idx: number) => {
                                const isCredit = mov.type.includes('_IN') || mov.type === 'COMMISSION';
                                const isOut = mov.type.includes('_OUT') || mov.type === 'PAYOUT' || mov.type === 'FEE';
                                return (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3 align-top">
                                            <div className="font-mono text-xs text-gray-900 font-medium mb-1">{mov.orderId || mov.id.substring(0,8)}</div>
                                            <div className="text-[11px] text-gray-500">{new Date(mov.createdAt).toLocaleString('id-ID')}</div>
                                        </td>
                                        <td className="px-5 py-3 align-top">
                                            <p className="font-medium text-gray-900 mb-1 flex items-center gap-1.5">
                                                {isOut && <ArrowRightLeft className="w-3 h-3 text-gray-400" />}
                                                {mov.description}
                                            </p>
                                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-gray-100 text-gray-600 border border-gray-200">
                                                {mov.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right align-top">
                                            <span className={`inline-flex font-semibold text-sm ${isCredit ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {isCredit ? '+' : '-'} Rp {Number(mov.amount).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right align-top">
                                            <span className="font-medium text-gray-900">
                                                Rp {Number(mov.availableAfter || 0).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {ledger.movements && ledger.movements.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-center">
                        <button className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">Lihat Semua Riwayat</button>
                    </div>
                )}
            </div>
        </MerchantLayout>
    );
}
