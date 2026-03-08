"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/admin');
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 selection:bg-cyan-500/30">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-400/10 blur-[100px] pointer-events-none" />

            {/* Form Container */}
            <div className="w-full max-w-md p-8 md:p-10 rounded-2xl relative z-10 border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                <div className="text-center mb-8">
                    <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-200 shadow-sm mb-4">
                        <span className="text-3xl text-[#C9A84C] drop-shadow-sm">⚡</span>
                    </div>
                    <h1 className="font-heading text-3xl text-slate-800 tracking-widest whitespace-nowrap">DAGANG<span className="text-[#C9A84C]">PLAY</span></h1>
                    <p className="font-body text-cyan-600 text-xs uppercase tracking-widest mt-2 font-bold select-none">Super Admin Authentication</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            defaultValue="superadmin@dagangplay.com"
                            className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-body text-sm"
                            placeholder="admin@dagangplay.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            defaultValue="dagangplayadmin2026"
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
                        className="w-full py-4 mt-4 rounded-xl font-body font-bold text-sm tracking-widest text-white uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/30"
                        style={{ background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)' }}
                    >
                        Login ke Dashboard
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
