"use client";
import React, { useState } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    Terminal,
    KeyRound,
    Network,
    Webhook,
    RefreshCw,
    Copy,
    Eye,
    EyeOff,
    CheckCircle,
    ServerCrash,
    Activity,
    Save,
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

export default function MerchantDeveloperWebhookPage() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    // SWR logic for webhook logs
    const { data: logs, mutate, isLoading } = useSWR(`${baseUrl}/saas/merchant/webhooks/logs`, fetcher);

    // States
    const [showSecret, setShowSecret] = useState(false);
    const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

    const handleRetry = async (logId: string) => {
        setRetryingLogId(logId);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${baseUrl}/saas/merchant/webhooks/retry`, { logId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Webhook retry queued successfully!');
        } catch (e) {
            alert('Failed to retry webhook.');
        } finally {
            setRetryingLogId(null);
        }
    };

    return (
        <MerchantLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pusat API & Webhook</h1>
                    <p className="text-[14px] text-slate-500 mt-2">Atur API Credentials dan konfigurasi Webhook Callback URL untuk integrasi pihak ketiga (Bot WA/Telegram/Sistem sendiri).</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[40px] px-5 inline-flex items-center gap-2 bg-slate-800 hover:bg-black text-white rounded-xl text-[13px] font-bold transition-all shadow-md">
                        <Terminal className="w-4 h-4" />
                        Baca Dokumentasi API
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* API Credentials */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">API Credentials</h2>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Public API Key</label>
                            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-3 rounded-xl">
                                <code className="text-[13px] font-medium text-slate-800">pk_live_d8291naxnc1q0vbn0ad</code>
                                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Private / Secret Key</label>
                            <div className="flex items-center justify-between border border-emerald-200 bg-emerald-50/30 p-3 rounded-xl">
                                <code className="text-[13px] font-medium text-slate-800">
                                    {showSecret ? 'sk_live_v98h2n3mxnzq9kjd81n' : '•••••••••••••••••••••••••••'}
                                </code>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowSecret(!showSecret)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Webhook Configuration */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Network className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Callback (Webhook)</h2>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase tracking-wider">Active</span>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Webhook Endpoint URL</label>
                            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                                <input 
                                    type="url" 
                                    defaultValue="https://sistem-toko.com/api/callback/dagangplay" 
                                    className="flex-1 w-full bg-transparent px-4 py-2.5 text-[13px] font-medium text-slate-800 focus:outline-none"
                                />
                                <button className="px-5 bg-slate-50 border-l border-slate-200 text-[12px] font-bold text-indigo-600 hover:bg-slate-100">
                                    Simpan
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5 block">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0">HMAC Validation Secret</label>
                                <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Regenerate
                                </button>
                            </div>
                            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-3 rounded-xl">
                                <code className="text-[13px] font-mono text-slate-600">whsec_mNbv882!kzLpasq199nLz</code>
                                <button className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Gunakan HMAC-SHA256 untuk memvalidasi header <code className="text-indigo-600 bg-indigo-50 px-1 rounded">x-dagangplay-signature</code>.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Webhook Delivery Logs */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Live Delivery Logs
                        </h3>
                        <p className="text-[12px] text-slate-500 font-medium mt-1">Monitor riwayat dan status respon notifikasi dari server Anda (Rata-rata Latensi 125ms).</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                <th className="p-4 pl-6 font-bold">Waktu & Event ID</th>
                                <th className="p-4 font-bold">Event Type</th>
                                <th className="p-4 font-bold">Target Response</th>
                                <th className="p-4 font-bold text-right">Latency</th>
                                <th className="p-4 pr-6 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] text-slate-700">
                            {isLoading && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></td></tr>
                            )}
                            {!isLoading && (!logs || logs.length === 0) ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada riwayat webhook.</td></tr>
                            ) : logs?.map((log: any) => (
                                <tr key={log.id} className={`border-b border-slate-50 transition-colors ${!log.isSuccess ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/50'}`}>
                                    <td className="p-4 pl-6">
                                        <div className={`font-mono text-[12px] font-semibold mb-0.5 ${log.isSuccess ? 'text-indigo-600' : 'text-rose-600'}`}>evt_{log.id.slice(0, 10)}</div>
                                        <div className="text-[11px] text-slate-400 tracking-tight">{new Date(log.createdAt).toLocaleString('id-ID')}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-slate-700 bg-slate-100 text-xs px-2 py-1 rounded border border-slate-200">{log.event}</span>
                                    </td>
                                    <td className="p-4">
                                        {log.isSuccess ? (
                                            <span className="inline-flex items-center gap-1 font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded text-[11px] uppercase tracking-wider">
                                                <CheckCircle className="w-3 h-3" /> {log.responseStatus} OK
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded text-[11px] uppercase tracking-wider">
                                                <ServerCrash className="w-3 h-3" /> {log.responseStatus || 'TIMEOUT'} ERROR
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right font-mono text-[11px] font-medium text-slate-500">
                                        {log.latencyMs ? `${log.latencyMs}ms` : 'Timeout'}
                                    </td>
                                    <td className="p-4 pr-6 text-right space-x-2 flex justify-end">
                                        {!log.isSuccess && (
                                            <button 
                                                onClick={() => handleRetry(log.id)}
                                                disabled={retryingLogId === log.id}
                                                className={`text-[11px] font-bold text-white shadow-sm px-3 py-1 rounded items-center flex gap-1 transition-all ${retryingLogId === log.id ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                            >
                                                <RefreshCw className={`w-3 h-3 ${retryingLogId === log.id ? 'animate-spin' : ''}`} /> 
                                                {retryingLogId === log.id ? 'Sending...' : 'Resend Payload'}
                                            </button>
                                        )}
                                        <button className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 border border-slate-200 bg-white px-2 py-1 rounded">Log</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MerchantLayout>
    );
}
