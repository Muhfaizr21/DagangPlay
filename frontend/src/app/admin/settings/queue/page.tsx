"use client";
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    ServerCrash,
    Activity,
    Cpu,
    Database,
    RotateCcw,
    Trash2,
    ShieldAlert,
    AlertTriangle
} from 'lucide-react';

export default function MessageQueueDashboardPage() {
    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Queue & Middleware</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Monitoring load worker RabbitMQ/Redis, Dead Letter Queue (DLQ), dan retry otomatis.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-[40px] px-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-semibold transition-all shadow-md shadow-indigo-200">
                        <Activity className="w-4 h-4" />
                        Restart Workers
                    </button>
                </div>
            </div>

            {/* Infrastructure Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Jobs (Processing)</h4>
                        <p className="text-2xl font-black text-slate-800">142<span className="text-sm text-slate-400 font-medium ml-1">/sec</span></p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Queued Jobs (Pending)</h4>
                        <p className="text-2xl font-black text-slate-800">54<span className="text-sm text-slate-400 font-medium ml-1">waiting</span></p>
                    </div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-[0_2px_20px_-8px_rgba(225,29,72,0.1)] flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert className="w-20 h-20 text-rose-600" />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center animate-pulse">
                        <ServerCrash className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest">Dead Letter Queue (DLQ)</h4>
                        <p className="text-2xl font-black text-rose-700">12<span className="text-sm text-rose-500 font-medium ml-1">failed</span></p>
                    </div>
                </div>
            </div>

            {/* DLQ Table */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden border-t-4 border-t-rose-500">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Dead Letter Queue (DLQ)</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">Job/Webhook yang gagal dieksekusi berkali-kali dan dimatikan secara sistem.</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors shadow-sm">
                        Empty DLQ
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-100">
                                <th className="p-4 pl-6">Job Class / Type</th>
                                <th className="p-4">Payload Hint</th>
                                <th className="p-4">Error Message</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-700">
                            {[1, 2, 3].map((item) => (
                                <tr key={item} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="font-mono text-xs text-rose-600">SendWebhookJob</div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">Attempt: 5/5</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block text-slate-600">
                                            &#123; "order_id": "DP-10293", "merchant_id": 8 &#125;
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-rose-600 font-semibold max-w-xs truncate">
                                            cURL error 28: Connection timed out after 30000 milliseconds
                                        </div>
                                    </td>
                                    <td className="p-4 pr-6">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100" title="Re-queue (Retry)">
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
