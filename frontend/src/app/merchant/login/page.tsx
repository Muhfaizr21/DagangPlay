"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Lock, Mail, Key, ArrowRight, ShieldCheck, Store, Loader2 } from 'lucide-react';

export default function MerchantLoginPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const res = await axios.post(`${baseUrl}/api/auth/merchant/login`, {
                email,
                password
            });

            // Save token and user info
            localStorage.setItem('admin_token', res.data.access_token);
            localStorage.setItem('admin_user', JSON.stringify(res.data.user));

            // Merchants always go to /merchant
            router.push('/merchant');
            
        } catch (err: any) {
            console.error('Merchant Login error:', err);
            setError(err.response?.data?.message || 'Gagal login ke Dashboard Merchant.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden transform transition-all">
                    
                    {/* Header Banner */}
                    <div className="bg-indigo-600 p-10 text-center relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                        <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-4 ring-white/20">
                            <Store className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-white text-2xl font-black tracking-tight leading-none mb-2">MERCHANT <span className="text-indigo-200">PORTAL</span></h1>
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Dashboard Akses Seller</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-10 space-y-7">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Kemitraan</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <input 
                                        type="email" required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-300 placeholder:font-medium"
                                        placeholder="nama@tokoanda.id"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                                    <a href="#" className="text-[11px] font-black text-indigo-500 hover:text-indigo-700 transition-colors">Lupa Password?</a>
                                </div>
                                <div className="relative group">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    <input 
                                        type="password" required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    MASUK KE DASHBOARD <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-400">Belum punya toko? <a href="#" className="text-indigo-600 hover:underline">Daftar Kemitraan Sekarang</a></p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Kawasan Terenkripsi & Diawasi
                </p>
            </div>
        </div>
    );
}
