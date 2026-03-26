"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    Play,
    BookOpen,
    GraduationCap,
    Clock,
    ChevronRight,
    Search,
    Video,
    Zap,
    Crown,
    Lock,
    ArrowRight
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data).catch(err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/admin/login';
        }
        throw err;
    });
};

export default function MerchantAcademy() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGuide, setSelectedGuide] = useState<any>(null);
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    // Fetch plan features untuk cek apakah merchant eligible (optional ui enhancement, tapi logic utama ada di 403)
    const { data: planData } = useSWR(`${baseUrl}/merchant/subscription`, fetcher);

    // Fetch guides — akan 403 jika tidak eligible (dari backend)
    const { data: guides, isLoading, error } = useSWR(`${baseUrl}/admin/marketing/my-guides`, fetcher);

    const isBlocked = error && error.response?.status === 403;

    const filteredGuides = guides?.filter((g: any) =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🔒 GATING WALL — tampilkan upgrade wall jika tidak eligible
    if (isBlocked) {
        return (
            <MerchantLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="max-w-md w-full text-center px-6">
                        <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-9 h-9 text-amber-500" />
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
                            <Crown className="w-3 h-3" />
                            Fitur SUPREME
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                            Reseller Academy
                        </h1>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Akses panduan eksklusif, strategi marketing terbukti, dan video tutorial dari tim expert DagangPlay. 
                            Fitur ini hanya tersedia untuk paket <span className="font-bold text-amber-600">SUPREME</span>.
                        </p>
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mb-6 text-left space-y-3">
                            {['Video Tutorial & Strategi Jualan', 'Panduan SEO untuk Toko Top Up', 'Teknik FOMO & Copywriting', 'Tips Scale Up ke Rp30jt/bulan'].map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <GraduationCap className="w-3 h-3 text-amber-600" />
                                    </div>
                                    <span className="text-slate-600 font-medium">{f}</span>
                                </div>
                            ))}
                        </div>
                        <Link
                            href="/merchant/subscription"
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200"
                        >
                            <Crown className="w-4 h-4" />
                            Upgrade ke SUPREME
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <p className="text-xs text-slate-400 mt-4">Paket mulai Rp1.328.000/tahun</p>
                    </div>
                </div>
            </MerchantLayout>
        );
    }

    if (selectedGuide) {
        return (
            <MerchantLayout>
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => setSelectedGuide(null)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-bold text-sm"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Kembali ke Katalog
                    </button>

                    <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                            {selectedGuide.videoUrl ? (
                                <iframe
                                    src={selectedGuide.videoUrl.replace('watch?v=', 'embed/')}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                ></iframe>
                            ) : selectedGuide.imageUrl ? (
                                <img
                                    src={selectedGuide.imageUrl}
                                    className="w-full h-full object-contain bg-slate-100"
                                    alt={selectedGuide.title}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <Video className="w-20 h-20" />
                                </div>
                            )}
                        </div>
                        <div className="p-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
                                    {selectedGuide.category}
                                </span>
                                <div className="flex items-center gap-1.5 text-slate-400 text-[12px] font-bold">
                                    <Clock className="w-3.5 h-3.5" /> 5-10 Menit Materi
                                </div>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-6 uppercase leading-tight">{selectedGuide.title}</h1>
                            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                {selectedGuide.content}
                            </div>

                            <div className="mt-12 p-8 bg-slate-50 rounded-[24px] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 tracking-tight">Butuh Konsultasi Lebih Lanjut?</h3>
                                    <p className="text-sm text-slate-500 mt-1">Tim Success kami siap membantu Anda mengaplikasikan materi ini.</p>
                                </div>
                                <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                    <Zap className="w-4 h-4 text-indigo-500" /> Hubungi Account Manager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </MerchantLayout>
        );
    }

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-indigo-600" />
                        Marketing Academy
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Akses panduan eksklusif untuk scale up bisnis top-up Anda.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari materi marketing..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[18px] text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="aspect-[4/3] bg-slate-100 animate-pulse rounded-[28px]" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGuides?.length > 0 ? filteredGuides.map((guide: any) => (
                        <div
                            key={guide.id}
                            onClick={() => setSelectedGuide(guide)}
                            className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer border-transparent hover:border-indigo-100"
                        >
                            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                {guide.thumbnail ? (
                                    <img src={guide.thumbnail} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <BookOpen className="w-10 h-10 text-slate-200" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/40 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                        {guide.videoUrl ? <Play className="w-6 h-6 fill-current ml-1" /> : <BookOpen className="w-6 h-6" />}
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-black text-indigo-700 rounded-full shadow-sm uppercase tracking-widest border border-white">
                                        {guide.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-3 group-hover:text-indigo-600 transition-colors min-h-[3.5rem] line-clamp-2 uppercase tracking-tight">{guide.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 font-medium mb-6">{guide.content?.substring(0, 100)}...</p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                        <Clock className="w-3.5 h-3.5" /> Sekitar 5 Menit
                                    </div>
                                    <div className="text-indigo-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-1">
                                        Pelajari Materi <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-300">
                            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-400 font-bold tracking-tight">Belum ada materi tersedia.</p>
                            <p className="text-slate-400 text-sm mt-1">Admin sedang menyiapkan konten untuk Anda.</p>
                        </div>
                    )}
                </div>
            )}
        </MerchantLayout>
    );
}
