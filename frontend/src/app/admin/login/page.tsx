"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleLogin = async (e: React.FormEvent) => {
        // ... (unchanged code inside handleLogin) ...
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const res = await axios.post(`${baseUrl}/api/auth/admin/login`, {
                email,
                password
            });

            // Save token and user info
            const role = res.data.user.role;
            if (role === 'MERCHANT') {
                // If merchant accidentally tries to login at admin page
                localStorage.clear();
                localStorage.setItem('admin_token', res.data.access_token);
                localStorage.setItem('admin_user', JSON.stringify(res.data.user));
                router.push('/merchant');
                return;
            }

            if (role === 'SUPER_ADMIN' || role === 'ADMIN_STAFF') {
                localStorage.setItem('admin_token', res.data.access_token);
                localStorage.setItem('admin_user', JSON.stringify(res.data.user));
                router.push('/admin');
            } else {
                setError('Anda tidak memiliki izin untuk masuk ke area Super Admin.');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || err.message || 'Gagal login. Cek kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 selection:bg-cyan-500/30">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/10 blur-[100px] pointer-events-none" />

            {/* Form Container */}
            <div className="w-full max-w-md p-8 md:p-10 rounded-2xl relative z-10 border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                <div className="text-center mb-8">
                    <div className="mx-auto inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm mb-4 p-3 overflow-hidden">
                        <img src="/dagang.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="font-heading text-3xl text-slate-800 tracking-widest whitespace-nowrap">CENTRAL<span className="text-[#C9A84C]">ADMIN</span></h1>
                    <p className="font-body text-red-600 text-[10px] uppercase tracking-widest mt-2 font-black select-none">Restricted: Super Admin & Staff Only</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body text-sm"
                            placeholder="admin@dagangplay.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded bg-white border-slate-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer" />
                            <span className="text-slate-600 font-body">Simpan login saya</span>
                        </label>
                        <a href="#" className="font-body text-cyan-600 hover:text-[#C9A84C] transition-colors underline-offset-4 hover:underline">Lupa Password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 rounded-xl font-body font-bold text-sm tracking-widest text-white uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:translate-y-0"
                        style={{ background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)' }}
                    >
                        {loading ? 'Authenticating...' : 'Login ke Dashboard'}
                    </button>
                </form>

                {/* Decorative Badge */}
                <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-[#C9A84C] text-white text-[10px] font-bold uppercase shadow-md select-none">
                    🔒 Secured Area
                </div>
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                <p className="font-body text-xs text-slate-400">© {new Date().getFullYear()} DagangPlay Platform. All rights reserved.</p>
            </div>
        </div>
    );
}
