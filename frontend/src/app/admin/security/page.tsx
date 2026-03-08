"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Activity,
    ShieldAlert,
    Ban,
    Lock,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    UserX,
    ServerCrash,
    History,
    Loader2
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function SecurityManagementPage() {
    const [activeTab, setActiveTab] = useState<'FRAUD' | 'BLACKLIST' | 'AUDIT' | 'LOGIN'>('FRAUD');
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // FRAUD State
    const { data: frauds, isLoading: loadingFrauds, mutate: mutateFrauds } = useSWR('http://localhost:3001/admin/security/fraud', fetcher);
    // BLACKLIST State
    const { data: blacklists, isLoading: loadingBlacklists, mutate: mutateBlacklists } = useSWR('http://localhost:3001/admin/security/blacklist', fetcher);
    const [showBlacklistModal, setShowBlacklistModal] = useState(false);
    const [blacklistForm, setBlacklistForm] = useState({ ipAddress: '', reason: '' });
    // LOGIN State
    const { data: logins, isLoading: loadingLogins } = useSWR('http://localhost:3001/admin/security/login-attempts', fetcher);
    // AUDIT State
    const { data: audits, isLoading: loadingAudits } = useSWR('http://localhost:3001/admin/security/audit', fetcher);

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleResolveFraud = async (id: string) => {
        if (!confirm('Tandai investigasi fraud ini telah selesai/resolved?')) return;
        try {
            await axios.post(`http://localhost:3001/admin/security/fraud/${id}/resolve`);
            mutateFrauds();
            showToast('Resolved', 'Kasus fraud berhasil ditutup.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleAddBlacklist = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/admin/security/blacklist', blacklistForm);
            mutateBlacklists();
            setShowBlacklistModal(false);
            setBlacklistForm({ ipAddress: '', reason: '' });
            showToast('Sukses', 'IP Address berhasil diblokir.');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleRemoveBlacklist = async (id: string) => {
        if (!confirm('Buka blokir dari IP Address ini?')) return;
        try {
            await axios.delete(`http://localhost:3001/admin/security/blacklist/${id}`);
            mutateBlacklists();
            showToast('Unblocked', 'IP Address kembali mendapatkan akses.');
        } catch (err: any) {
            showToast('Gagal', 'Terjadi kesalahan sistem.', 'error');
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
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Security & Audit Control</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Sistem deteksi fraud, blokir IP, dan jejak aktivitas admin platform.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('FRAUD')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'FRAUD' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <ShieldAlert className="w-4 h-4" /> Fraud Watch
                    </button>
                    <button onClick={() => setActiveTab('BLACKLIST')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'BLACKLIST' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Ban className="w-4 h-4" /> Blokir IP
                    </button>
                    <button onClick={() => setActiveTab('LOGIN')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'LOGIN' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Lock className="w-4 h-4" /> Login Attempts
                    </button>
                    <button onClick={() => setActiveTab('AUDIT')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'AUDIT' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Activity className="w-4 h-4" /> Audit Logs
                    </button>
                </div>
            </div>

            {/* TAB: FRAUD DETECTION */}
            {activeTab === 'FRAUD' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Peringatan Kecurangan (Fraud Alerts)</h2>
                    </div>
                    {loadingFrauds ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="space-y-4">
                            {frauds?.length === 0 && <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">Tidak ada deteksi fraud terbaru. Sistem aman.</div>}
                            {frauds?.map((f: any) => (
                                <div key={f.id} className={`p-5 border rounded-2xl flex flex-col md:flex-row gap-6 ${f.isResolved ? 'border-slate-200 bg-slate-50' : 'border-red-200 bg-red-50/30'}`}>
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${f.isResolved ? 'bg-slate-200' : 'bg-red-100 text-red-600'}`}>
                                        <AlertTriangle className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 
                                                      ${f.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' :
                                                        f.riskLevel === 'HIGH' ? 'bg-orange-500 text-white' :
                                                            'bg-amber-100 text-amber-700'}`}>
                                                    {f.riskLevel} RISK
                                                </span>
                                                <h3 className="font-bold text-slate-800 text-sm">Terindikasi oleh sistem: {f.reason}</h3>
                                            </div>
                                            {!f.isResolved && (
                                                <button onClick={() => handleResolveFraud(f.id)} className="bg-white border border-slate-200 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition shadow-sm">
                                                    Tandai Selesai (Resolve)
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 py-4 border-t border-slate-200/50">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Tersangka User</p>
                                                <p className="text-xs font-medium text-slate-700 mt-1">{f.user?.name || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Order Terkait</p>
                                                <p className="text-xs font-medium text-slate-700 mt-1 font-mono">{f.order?.orderNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Waktu Kejadian</p>
                                                <p className="text-xs font-medium text-slate-700 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                                                <p className={`text-xs font-bold mt-1 ${f.isResolved ? 'text-emerald-600' : 'text-red-500 animate-pulse'}`}>
                                                    {f.isResolved ? `Resolved by ${f.resolvedBy}` : 'INVESTIGATING'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: BLACKLIST IP */}
            {activeTab === 'BLACKLIST' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">IP Address Blacklist</h2>
                        <button onClick={() => setShowBlacklistModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                            <Ban className="w-4 h-4" /> Tambah Blacklist Manual
                        </button>
                    </div>
                    {loadingBlacklists ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-4">IP Address Target</th>
                                        <th className="px-6 py-4">Alasan Pemblokiran</th>
                                        <th className="px-6 py-4">Diblokir Oleh</th>
                                        <th className="px-6 py-4 text-center">Waktu Eksekusi</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {blacklists?.length === 0 && <tr><td colSpan={5} className="text-center py-10 font-medium text-slate-500">Tidak ada IP dalam daftar blacklist.</td></tr>}
                                    {blacklists?.map((b: any) => (
                                        <tr key={b.id} className="hover:bg-red-50/30 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-bold text-red-600 bg-red-50 inline-block px-3 py-1 rounded-lg border border-red-100">{b.ipAddress}</div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-medium text-slate-600">{b.reason || '-'}</td>
                                            <td className="px-6 py-4 text-[12px] font-bold text-slate-500">{b.blockedBy || 'System'}</td>
                                            <td className="px-6 py-4 text-[12px] text-center text-slate-500">{new Date(b.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleRemoveBlacklist(b.id)} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition">Hapus Blokir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: LOGIN ATTEMPTS */}
            {activeTab === 'LOGIN' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Login Attempts & Brute Force Monitor</h2>
                        <p className="text-xs text-slate-500 mt-1">Sistem mencatat 100 percobaan login beruntun terakhir di platform.</p>
                    </div>
                    {loadingLogins ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100">
                                    {logins?.map((l: any) => (
                                        <tr key={l.id} className="hover:bg-slate-50 transition">
                                            <td className="px-4 py-3 shrink-0">
                                                {l.isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <UserX className="w-5 h-5 text-red-500" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-bold text-slate-800">{l.email || l.user?.email || 'Unknown User'}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{l.ipAddress}</p>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <p className="text-[11px] text-slate-500 max-w-xs truncate">{l.userAgent}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="text-[11px] font-bold text-slate-400">{new Date(l.createdAt).toLocaleString()}</p>
                                                {!l.isSuccess && <p className="text-[10px] text-red-500 font-bold mt-0.5">{l.failReason}</p>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: AUDIT ADMIN */}
            {activeTab === 'AUDIT' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">System Audit logs</h2>
                        <p className="text-xs text-slate-500 mt-1">History aktivitas pergerakan penting dalam sistem oleh admin/super admin.</p>
                    </div>
                    {loadingAudits ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="space-y-0 border-l-2 border-slate-100 ml-4 pl-4 pt-2">
                            {audits?.map((a: any) => (
                                <div key={a.id} className="relative pb-6">
                                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                                        <span className="font-bold text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded mr-2">{a.action}</span>
                                        <span className="text-sm font-bold text-slate-800">{a.user?.name || 'Sistem Ops'}</span>
                                        <span className="text-[11px] text-slate-400 font-medium">menjalankan aktivitas pada modul</span>
                                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{a.entity} ({a.entityId})</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                                        <History className="w-3 h-3" /> {new Date(a.createdAt).toLocaleString()}
                                    </p>
                                    <div className="mt-2 text-xs font-mono bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-500 max-h-24 overflow-y-auto w-fit">
                                        {JSON.stringify(a.details)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL BLACKLIST */}
            {showBlacklistModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in text-left">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-red-50">
                            <h3 className="font-bold text-red-900 flex items-center gap-2"><Ban className="w-5 h-5 text-red-600" /> Force Block IP</h3>
                            <button onClick={() => setShowBlacklistModal(false)}><XCircle className="w-5 h-5 text-red-400 hover:text-red-900" /></button>
                        </div>
                        <form onSubmit={handleAddBlacklist} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">IP Address Target</label>
                                <input type="text" required value={blacklistForm.ipAddress} onChange={e => setBlacklistForm({ ...blacklistForm, ipAddress: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800" placeholder="192.168.0.x / 114.xxx" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Alasan Keamanan</label>
                                <input type="text" required value={blacklistForm.reason} onChange={e => setBlacklistForm({ ...blacklistForm, reason: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm" placeholder="Spamming requests..." />
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex gap-2">
                                <ServerCrash className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-800">IP yang di-blacklist akan tertolak dari middleware level paling dasar aplikasi secara instan.</p>
                            </div>
                            <button type="submit" className="w-full mt-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm transition">Blokir Jaringan Sekarang</button>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
