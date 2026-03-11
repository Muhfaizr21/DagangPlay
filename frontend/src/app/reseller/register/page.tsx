"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, User, Mail, Lock, Phone, Globe, ArrowRight, ShieldCheck, CheckCircle2, Zap, Star } from 'lucide-react';

const ResellerRegisterPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        // User Info
        fullName: '',
        email: '',
        whatsapp: '',
        password: '',
        // Store Info
        storeName: '',
        storeSlug: '',
        // Plan Info
        plan: 'PRO', // PRO, LEGEND, SUPREME
        billingCycle: 'yearly', // yearly, quarterly
    });

    const PLANS: any = {
        PRO: { name: 'Pro', qPrice: 224750, yPrice: 899000, desc: 'Mulai bisnis dengan mudah!' },
        LEGEND: { name: 'Legend', qPrice: 246750, yPrice: 987000, desc: 'Naik level, untung berlipat!' },
        SUPREME: { name: 'Supreme', qPrice: 299750, yPrice: 1199000, desc: 'Fitur terlengkap, paling cuan!' },
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const temp = { ...prev, [name]: value };
            if (name === 'storeName' && !prev.storeSlug) {
                temp.storeSlug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            }
            if (name === 'storeSlug') {
                temp.storeSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
            }
            return temp;
        });
    };

    const handlePlanSelect = (planCode: string) => {
        setFormData(prev => ({ ...prev, plan: planCode }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.whatsapp || !formData.password) {
                setError('Mohon lengkapi semua data pribadi.');
                return;
            }
            if (formData.password.length < 6) {
                setError('Password minimal 6 karakter.');
                return;
            }
            setError('');
            setStep(2);
            return;
        }
        if (step === 2) {
            if (!formData.storeName || !formData.storeSlug) {
                setError('Mohon lengkapi data toko Otoritas kamu.');
                return;
            }
            setError('');
            setStep(3);
            return;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

            // In a real implementation, this would point to your NestJS backend
            // For now, we simulate the API request
            // const res = await axios.post(`${baseUrl}/api/merchant/register`, formData);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate Success Response that puts Merchant in PENDING_REVIEW
            setSuccess(true);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Terjadi kesalahan sistem. Coba beberapa saat lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E8B84B] to-yellow-300" />

                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Pendaftaran Berhasil!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Data toko <strong className="text-slate-800">{formData.storeName}</strong> dengan paket <strong className="text-[#E8B84B]">{PLANS[formData.plan].name}</strong> telah berhasil direkam.
                        Saat ini akun kamu sedang dalam proses <strong>Review oleh Super Admin</strong> (Maks. 1x24 Jam). Kami akan menghubungi via WhatsApp untuk proses pembayaran aktivasi senilai <strong>Rp {formData.billingCycle === 'yearly' ? PLANS[formData.plan].yPrice.toLocaleString('id-ID') : PLANS[formData.plan].qPrice.toLocaleString('id-ID')}</strong>.
                    </p>

                    <Link href="/" className="inline-flex items-center justify-center w-full py-4 bg-[#0A1628] text-white font-bold rounded-xl hover:bg-[#132544] transition-colors">
                        Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>
        );
    }

    const currentPlan = PLANS[formData.plan];
    const paymentAmount = formData.billingCycle === 'yearly' ? currentPlan.yPrice : currentPlan.qPrice;

    return (
        <div className="min-h-screen flex font-sans bg-[#0A1628] selection:bg-cyan-500/30">
            {/* Left Box: Illustration & Marketing */}
            <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] to-[#1A3260] z-0" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg">
                        <img src="/dagang.png" alt="DagangPlay" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xl font-bold tracking-wider text-white">DAGANGPLAY</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E8B84B] text-[11px] font-bold tracking-widest uppercase mb-6 border border-[#E8B84B]/20">
                        <ShieldCheck size={14} /> Reseller Eksekutif
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                        Bangun <span className="text-[#E8B84B]">Kekaisaran</span> Top Up Game Kamu.
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed mb-10">
                        Lebih dari sekadar website. Kami berikan sistem otomatis, harga termurah, dan panduan marketing sampai pecah telur.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Dashboard canggih & White Label (Domain Pribadi)',
                            'Ribuan produk game siap jual tanpa modal (Deposit)',
                            'Margin bebas atur sendiri, cuan 100% milikmu',
                            'Dibimbing langsung oleh praktisi digital marketing'
                        ].map((ft, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                                <div className="mt-1 w-5 h-5 rounded-full bg-[#E8B84B]/20 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={12} className="text-[#E8B84B]" />
                                </div>
                                <span className="text-sm font-medium text-slate-200">{ft}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-500 font-medium">
                    © {new Date().getFullYear()} DagangPlay Partner Network. All rights reserved.
                </div>
            </div>

            {/* Right Box: Form Section */}
            <div className="flex-1 flex flex-col justify-center relative bg-white py-12 px-6 sm:px-12 md:px-20 lg:px-24 overflow-y-auto">
                <div className="max-w-md w-full mx-auto relative z-10 my-auto">

                    {/* Mobile Header */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-[#0A1628] rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-blue-900/20">
                            <img src="/dagang.png" className="w-full h-full object-contain filter invert brightness-0" />
                        </div>
                        <span className="text-2xl font-bold tracking-widest text-[#0A1628]">DAGANGPLAY</span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Kemitraan Baru</h2>
                        <p className="text-slate-500 text-sm">Lengkapi formulir di bawah ini untuk mengajukan akun merchant ke Super Admin.</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`h-2 flex-1 rounded-full bg-gradient-to-r ${step >= 1 ? 'from-[#0A1628] to-[#132544]' : 'bg-slate-100'} transition-all duration-500`} />
                        <div className={`h-2 flex-1 rounded-full bg-gradient-to-r ${step >= 2 ? 'from-[#132544] to-[#2D4A6E]' : 'bg-slate-100'} transition-all duration-500`} />
                        <div className={`h-2 flex-1 rounded-full bg-gradient-to-r ${step >= 3 ? 'from-[#2D4A6E] to-[#E8B84B]' : 'bg-slate-100'} transition-all duration-500`} />
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Profil Pendaftar (1/3)</h3>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nama Lengkap</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#0A1628] focus:ring-1 focus:ring-[#0A1628] outline-none transition-all placeholder:text-slate-400"
                                                placeholder="Budi Santoso"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Aktif</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#0A1628] focus:ring-1 focus:ring-[#0A1628] outline-none transition-all placeholder:text-slate-400"
                                                placeholder="budi@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nomor WhatsApp</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="whatsapp"
                                                value={formData.whatsapp}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#0A1628] focus:ring-1 focus:ring-[#0A1628] outline-none transition-all placeholder:text-slate-400"
                                                placeholder="081234567890"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Password Pengelola</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#0A1628] focus:ring-1 focus:ring-[#0A1628] outline-none transition-all placeholder:text-slate-400"
                                                placeholder="Minimal 6 karakter"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full mt-8 py-4 bg-[#0A1628] hover:bg-[#132544] text-white font-bold rounded-xl flex flex-row items-center justify-center gap-3 transition-colors uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/20"
                                >
                                    Lanjut ke Data Toko <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <button onClick={() => setStep(1)} type="button" className="text-slate-400 hover:text-slate-700"><ArrowRight className="rotate-180 w-4 h-4" /></button>
                                    Identitas Toko (2/3)
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nama Toko/Brand Kamu</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Store size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="storeName"
                                                value={formData.storeName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-[#0A1628] focus:ring-1 focus:ring-[#0A1628] outline-none transition-all placeholder:text-slate-400"
                                                placeholder="Misal: Budi Gaming Store"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-2 font-medium">Nama ini akan diletakkan di header toko kamu.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Slug URL Toko</label>
                                        <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:border-[#0A1628] focus-within:ring-1 focus-within:ring-[#0A1628] transition-all">
                                            <div className="flex items-center pl-4 pr-2 text-slate-400 bg-slate-100 border-r border-slate-200 font-medium text-[13px]">
                                                <Globe size={16} className="mr-2" /> dagangplay.com/
                                            </div>
                                            <input
                                                type="text"
                                                name="storeSlug"
                                                value={formData.storeSlug}
                                                onChange={handleChange}
                                                className="flex-1 py-4 px-3 bg-transparent text-sm font-bold text-slate-900 outline-none"
                                                placeholder="budi-gaming"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-2 font-medium">Hanya huruf kecil, angka, dan tanda hubung (-).</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full mt-8 py-4 bg-[#0A1628] hover:bg-[#132544] text-white font-bold rounded-xl flex flex-row items-center justify-center gap-3 transition-colors uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/20"
                                >
                                    Lanjut ke Pemilihan Paket <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <button onClick={() => setStep(2)} type="button" className="text-slate-400 hover:text-slate-700"><ArrowRight className="rotate-180 w-4 h-4" /></button>
                                    Pemilihan Paket (3/3)
                                </h3>

                                {/* Billing Toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-6 font-bold text-[11px] uppercase tracking-widest">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, billingCycle: 'yearly' }))}
                                        className={`flex-1 py-3 rounded-lg transition-all ${formData.billingCycle === 'yearly' ? 'bg-white shadow-sm text-[#0A1628]' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Tahunan (Skon 20%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, billingCycle: 'quarterly' }))}
                                        className={`flex-1 py-3 rounded-lg transition-all ${formData.billingCycle === 'quarterly' ? 'bg-white shadow-sm text-[#0A1628]' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        3 Bulan
                                    </button>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {Object.keys(PLANS).map((key) => {
                                        const plan = PLANS[key];
                                        const isSelected = formData.plan === key;
                                        const price = formData.billingCycle === 'yearly' ? plan.yPrice : plan.qPrice;
                                        const label = formData.billingCycle === 'yearly' ? '/ Tahun' : '/ 3 Bulan';

                                        return (
                                            <div
                                                key={key}
                                                onClick={() => handlePlanSelect(key)}
                                                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[#E8B84B] bg-orange-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                {key === 'SUPREME' && (
                                                    <div className="absolute -top-3 right-4 px-3 py-1 bg-[#0A1628] text-[#E8B84B] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <Star size={10} fill="currentColor" /> Terpopuler
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className={`text-lg font-black ${isSelected ? 'text-[#0A1628]' : 'text-slate-700'}`}>{plan.name}</h4>
                                                        <p className="text-xs font-medium text-slate-500 mt-1">{plan.desc}</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#E8B84B]' : 'border-slate-300'}`}>
                                                        {isSelected && <div className="w-2.5 h-2.5 bg-[#E8B84B] rounded-full" />}
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Biaya Komitmen</span>
                                                    <div className="text-right">
                                                        <span className={`text-xl font-black ${isSelected ? 'text-[#E8B84B]' : 'text-slate-800'}`}>Rp {price.toLocaleString('id-ID')}</span>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="p-4 rounded-xl bg-[#0A1628]/5 border border-[#0A1628]/10 mb-8 flex items-start gap-3">
                                    <div className="mt-0.5"><Zap size={16} className="text-[#E8B84B]" /></div>
                                    <div>
                                        <h4 className="text-xs font-bold text-[#0A1628] uppercase tracking-widest mb-1">Total Tagihan: Rp {paymentAmount.toLocaleString('id-ID')}</h4>
                                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                            Data formulir beserta paket pilihanmu akan disampaikan ke Super Admin. Setelah disetujui, kami akan berikan instruksi pembayaran ke WhatsApp kamu.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#E8B84B] hover:bg-[#d4a030] text-[#0A1628] font-black rounded-xl flex flex-row items-center justify-center gap-3 transition-colors uppercase tracking-widest text-[12px] shadow-lg shadow-[#E8B84B]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Mengirim Data...' : 'Kirim Pendaftaran Menjadi Agen'}
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="mt-10 text-center text-sm font-medium text-slate-500 pb-10 border-b lg:border-none border-slate-100">
                        Sudah punya akun merchant? <Link href="/admin/login" className="text-[#0A1628] font-bold hover:underline">Masuk</Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ResellerRegisterPage;
