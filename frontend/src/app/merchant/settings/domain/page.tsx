"use client";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    Globe,
    CheckCircle2,
    Lock,
    AlertCircle,
    Server,
    ExternalLink,
    RefreshCw,
    Save
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
}).then(res => res.data);

export default function MerchantDomainSettingsPage() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: profile, mutate } = useSWR(`${baseUrl}/merchant/profile`, fetcher);

    const [domain, setDomain] = useState('');
    const [forceHttps, setForceHttps] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile?.domain) {
            setDomain(profile.domain);
        }
    }, [profile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`${baseUrl}/merchant/settings/domain`, { domain }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            mutate();
            alert('Domain berhasil diperbarui!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal menyimpan domain');
        } finally {
            setIsSaving(false);
        }
    };

    const displayDomain = domain || 'domainanda.com';

    return (
        <MerchantLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Whitelabel Custom Domain</h1>
                    <p className="text-[14px] text-slate-500 mt-2">Gunakan nama domain toko Anda sendiri (contoh: topupdewa.com) secara gratis.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-[46px] px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-black tracking-wide shadow-[0_8px_20px_-8px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Simpan Domain'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Domain</h3>
                                <input 
                                    type="text" 
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="contoh: tokogame.com"
                                    className="w-full text-lg font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <Server className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[12px] font-bold text-emerald-900">DNS Resolution</span>
                                </div>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[12px] font-bold text-emerald-900">SSL Certificate</span>
                                </div>
                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Force HTTPS Toggle */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Force HTTPS Routing</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">Alihkan paksa HTTP ke HTTPS</p>
                        </div>
                        <button 
                            onClick={() => setForceHttps(!forceHttps)}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${forceHttps ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${forceHttps ? 'translate-x-6' : 'translate-x-0'}`}></span>
                        </button>
                    </div>
                </div>

                {/* Setup Instructions */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_4px_25px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">DNS Setup Instructions</h2>
                            <p className="text-[13px] text-slate-500 mt-1 font-medium">Arahkan/pointing domain Anda mengikuti record berikut di Cloudflare atau cPanel Anda.</p>
                        </div>
                        <button className="h-[36px] px-4 rounded-xl text-[12px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5" /> Verifikasi Ulang
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* A Record */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3 text-slate-800">
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-wider rounded">A Record</span>
                                <span className="text-sm font-bold text-slate-700">Untuk Root Domain (@)</span>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name / Host</p>
                                    <div className="text-[13px] font-mono font-semibold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-800">@</div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target / IPv4 Address</p>
                                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-800">
                                        <span className="text-[14px] font-mono font-bold text-slate-800">[IP Server Utama]</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CNAME Record */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3 text-slate-800">
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 font-black text-[10px] uppercase tracking-wider rounded">CName Record</span>
                                <span className="text-sm font-bold text-slate-700">Untuk Subdomain (www)</span>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name / Host</p>
                                    <div className="text-[13px] font-mono font-semibold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-800">www</div>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
                                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-800">
                                        <span className="text-[14px] font-mono font-bold text-slate-800">{displayDomain}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex gap-4">
                            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-[13px] font-medium text-blue-800 leading-relaxed">
                                Fitur Auto-SSL (Gembok Hijau) otomatis di-generate setelah <strong>A Record Anda terdeteksi valid/resolved</strong>. Harap tidak mengaktifkan fitur proxy Cloudflare (Awan Kuning) pada saat awal pointing agar engine Next.js kami bisa menerbitkan SSL.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
