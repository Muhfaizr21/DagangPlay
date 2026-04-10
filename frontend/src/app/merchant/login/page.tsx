"use client";
import { getApiUrl } from '@/lib/api';
import React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Lock, Mail, Key, ArrowRight, ShieldCheck, Store, Loader2, Zap, TrendingUp, Users, Star } from 'lucide-react';

const stats = [
  { icon: TrendingUp, label: 'Transaksi / Bulan', value: '12.000+' },
  { icon: Users, label: 'Merchant Aktif', value: '500+' },
  { icon: Star, label: 'Rating Platform', value: '4.9 ⭐' },
];

export default function MerchantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const baseUrl = getApiUrl();
      const res = await axios.post(`${baseUrl}/api/auth/merchant/login`, { email, password });
      // Clear any stale session first (e.g. old admin token)
      localStorage.clear();
      localStorage.setItem('merchant_token', res.data.access_token);
      localStorage.setItem('merchant_user', JSON.stringify(res.data.user));
      // Also store in admin_token key for backward compat with merchant pages
      localStorage.setItem('admin_token', res.data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      router.push('/merchant');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ===== LEFT PANEL – Brand / Hero ===== */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #7c3aed 100%)' }}
      >
        {/* Animated blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)', animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] rounded-full opacity-10 blur-2xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #f472b6, transparent)', animationDelay: '2s' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">DagangPlay</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
            <Zap className="w-3 h-3 text-yellow-300" />
            Platform SaaS Gaming #1 Indonesia
          </div>
          <h2 className="text-white text-5xl font-black leading-tight tracking-tight">
            Kelola Toko<br />
            <span className="text-indigo-200">Game Anda</span><br />
            Dari Sini.
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed max-w-xs">
            Dashboard merchant all-in-one. Produk, transaksi, reseller, dan laporan keuangan — semua dalam satu genggaman.
          </p>

          {/* Stats */}
          <div className="flex gap-6 pt-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-white font-black text-lg leading-none">{value}</span>
                </div>
                <span className="text-indigo-300 text-[11px] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-indigo-300/60 text-[11px] font-medium">
          © 2025 DagangPlay · Platform Terpercaya Ribuan Merchant
        </p>
      </div>

      {/* ===== RIGHT PANEL – Login Form ===== */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-800 font-black text-xl">DagangPlay</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100/80 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke Merchant Portal</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                Belum punya akun?{' '}
                <a href="#" className="text-indigo-600 font-bold hover:underline underline-offset-2">Daftar Gratis</a>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Email Kemitraan</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@tokoanda.id"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">Lupa Password?</a>
                </div>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors text-xs font-bold"
                  >
                    {showPass ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                style={{ background: loading ? '#818cf8' : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memverifikasi...</>
                ) : (
                  <>MASUK KE DASHBOARD <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>

          {/* Security note */}
          <p className="mt-6 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" /> Dilindungi Enkripsi SSL 256-bit
          </p>
        </div>
      </div>
    </div>
  );
}
