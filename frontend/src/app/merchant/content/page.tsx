"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { Palette, Image as ImageIcon, MessageSquare, Plus, Trash2, Power, Lock, CheckCircle2 } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantContentPage() {
    const [activeTab, setActiveTab] = useState('banners');

    // Data Fetching
    const { data: banners, mutate: mutateBanners } = useSWR('http://localhost:3001/merchant/content/banners', fetcher);
    // const { data: announcements, mutate: mutateAnnc } = useSWR('http://localhost:3001/merchant/content/announcements', fetcher);

    const [isAddBannerModal, setIsAddBannerModal] = useState(false);
    const [bannerForm, setBannerForm] = useState({ title: '', imageUrl: '', linkUrl: '', location: 'HERO' });

    // Merchant Plan
    const [merchantPlan, setMerchantPlan] = useState('PRO');
    const [activeTheme, setActiveTheme] = useState('light');

    React.useEffect(() => {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setMerchantPlan(parsed.plan || 'PRO');
        }

        // Sync active theme from backend settings
        const fetchSettings = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
                const token = localStorage.getItem('admin_token');
                const res = await axios.get(`${baseUrl}/merchant/settings`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.data?.settings?.theme?.active) {
                    setActiveTheme(res.data.settings.theme.active);
                }
            } catch (err) {
                console.error('Failed to sync theme settings');
            }
        };
        fetchSettings();
    }, []);

    const handleCreateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://localhost:3001/merchant/content/banners', bannerForm, { headers: { Authorization: `Bearer ${token}` } });
            alert('Banner berhasil ditambahkan!');
            setIsAddBannerModal(false);
            setBannerForm({ title: '', imageUrl: '', linkUrl: '', location: 'HERO' });
            mutateBanners();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal membuat banner');
        }
    };

    const handleToggleBanner = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`http://localhost:3001/merchant/content/banners/${id}/toggle`, { isActive: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
            mutateBanners();
        } catch (err) {
            alert('Gagal ubah status banner');
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Hapus banner ini?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`http://localhost:3001/merchant/content/banners/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutateBanners();
        } catch (err) {
            alert('Gagal hapus banner');
        }
    };

    const handleUpdateTheme = async (newTheme: string) => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/content/theme`, { active: newTheme }, { headers: { Authorization: `Bearer ${token}` } });
            setActiveTheme(newTheme);
            alert(`Tema ${newTheme} berhasil diterapkan!`);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah tema');
        }
    };

    return (
        <MerchantLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Tampilan Toko</h1>
                <p className="text-slate-500 text-sm mt-1">Kustomisasi banner, pengumuman, dan tema toko Anda.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col gap-1">
                        <button onClick={() => setActiveTab('banners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'banners' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <ImageIcon className="w-4 h-4" /> Banners Utama
                        </button>
                        <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'announcements' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <MessageSquare className="w-4 h-4" /> Pengumuman
                        </button>
                        <button onClick={() => setActiveTab('theme')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'theme' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Palette className="w-4 h-4" /> Tema & Warna
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow">
                    {/* Banners */}
                    {activeTab === 'banners' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Manajemen Banner</h3>
                                <button onClick={() => setIsAddBannerModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md">
                                    <Plus className="w-4 h-4" /> Tambah Banner
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {!banners ? (
                                        <p className="text-slate-500 text-sm">Memuat banner...</p>
                                    ) : banners.length === 0 ? (
                                        <div className="col-span-2 text-center py-10 opacity-70">
                                            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 font-bold">Belum ada banner</p>
                                        </div>
                                    ) : banners.map((b: any) => (
                                        <div key={b.id} className="border border-slate-200 rounded-2xl overflow-hidden group">
                                            <div className="h-40 bg-slate-100 relative group-hover:bg-slate-200 transition-colors">
                                                {b.image ? (
                                                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-slate-400">Broken Image</div>
                                                )}
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleToggleBanner(b.id, b.isActive)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-600">
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteBanner(b.id)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:text-red-600 text-slate-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {!b.isActive && (
                                                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg uppercase">Nonaktif</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 bg-white">
                                                <p className="font-bold text-slate-800 text-sm truncate">{b.title}</p>
                                                <p className="text-xs text-slate-500 mt-1 truncate">Link: {b.linkUrl || '-'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Announcements Mockup */}
                    {activeTab === 'announcements' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center py-16">
                            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Papan Pengumuman</h3>
                            <p className="text-slate-500 px-8 text-sm max-w-md mx-auto">Tampilkan pesan running text atau popup darurat kepada pelanggan Anda. Segera hadir.</p>
                        </div>
                    )}

                    {/* Theme Mockup */}
                    {activeTab === 'theme' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-indigo-600" /> Pilihan Template & Tema
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Theme */}
                                <div className={`border-2 rounded-2xl p-5 relative transition-all ${activeTheme === 'light' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                                    {activeTheme === 'light' && (
                                        <div className="absolute top-4 right-4 text-indigo-600">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 border border-slate-200 flex flex-col items-center justify-center gap-2">
                                        <div className="w-16 h-2 bg-slate-300 rounded-full"></div>
                                        <div className="w-24 h-2 bg-slate-200 rounded-full"></div>
                                        <div className="w-20 h-2 bg-slate-200 rounded-full"></div>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg mb-1">Tema Dasar (Light)</h4>
                                    <p className="text-slate-500 text-xs mb-4">Tampilan default yang bersih dan cepat, tersedia untuk seluruh level akun merchant.</p>

                                    <button onClick={() => handleUpdateTheme('light')} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTheme === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                                        {activeTheme === 'light' ? 'Tema Aktif' : 'Gunakan Tema Ini'}
                                    </button>
                                </div>

                                {/* Premium Theme */}
                                <div className={`border-2 rounded-2xl p-5 relative transition-all ${(merchantPlan === 'PRO') ? 'border-slate-200 bg-slate-50 opacity-80' : activeTheme === 'dark' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                                    {activeTheme === 'dark' && merchantPlan !== 'PRO' && (
                                        <div className="absolute top-4 right-4 text-indigo-600">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    )}
                                    {(merchantPlan === 'PRO') && (
                                        <div className="absolute top-4 right-4 text-red-500 bg-red-50 p-1.5 rounded-lg border border-red-100">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div className="w-full h-32 bg-slate-800 rounded-xl mb-4 border border-slate-700 flex flex-col items-center justify-center gap-2">
                                        <div className="w-16 h-2 bg-slate-600 rounded-full"></div>
                                        <div className="w-24 h-2 bg-slate-700 rounded-full"></div>
                                        <div className="w-20 h-2 bg-slate-700 rounded-full"></div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800 text-lg">Tema Premium (Dark)</h4>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">💎 LEGEND & UP</span>
                                    </div>
                                    <p className="text-slate-500 text-xs mb-4">Tampilan elegan mode gelap untuk meningkatkan konversi dan kenyamanan mata.</p>

                                    {merchantPlan === 'PRO' ? (
                                        <button onClick={() => alert('Fitur ini khusus akun LEGEND dan SUPREME. Silakan upgrade tier merchant Anda.')} className="w-full py-2.5 rounded-xl font-bold text-sm bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2">
                                            <Lock className="w-4 h-4" /> Terkunci (Upgrade Required)
                                        </button>
                                    ) : (
                                        <button onClick={() => handleUpdateTheme('dark')} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${activeTheme === 'dark' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                                            {activeTheme === 'dark' ? 'Tema Aktif' : 'Gunakan Tema Ini'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Banner */}
            {isAddBannerModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-[400px] overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Banner Baru</h3>
                            <button onClick={() => setIsAddBannerModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-light">&times;</button>
                        </div>
                        <form onSubmit={handleCreateBanner} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Judul Banner</label>
                                    <input type="text" required value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">URL Gambar (Direct Link)</label>
                                    <input type="url" required value={bannerForm.imageUrl} onChange={e => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Link Tujuan (Opsional)</label>
                                    <input type="text" value={bannerForm.linkUrl} onChange={e => setBannerForm({ ...bannerForm, linkUrl: e.target.value })} placeholder="/kategori/mobile-legends" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                                Simpan Banner
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
