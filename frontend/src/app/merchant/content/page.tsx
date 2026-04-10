"use client";
import { getApiUrl } from '@/lib/api';

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { Palette, Image as ImageIcon, MessageSquare, Plus, Trash2, Power, Lock, CheckCircle2, Megaphone, Monitor, Pointer, Pencil } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantContentPage() {
    const [activeTab, setActiveTab] = useState('banners');

    const baseUrl = getApiUrl();

    // Data Fetching
    const { data: banners, mutate: mutateBanners } = useSWR(`${baseUrl}/merchant/content/banners`, fetcher);
    const { data: announcements, mutate: mutateAnnc } = useSWR(`${baseUrl}/merchant/content/announcements`, fetcher);
    const { data: popupPromos, mutate: mutatePopup } = useSWR(`${baseUrl}/merchant/content/popup-promos`, fetcher);

    // Modals
    const [isAddBannerModal, setIsAddBannerModal] = useState(false);
    const [isAddAnncModal, setIsAddAnncModal] = useState(false);
    const [isAddPopupModal, setIsAddPopupModal] = useState(false);
    
    // Edit tracking
    const [editId, setEditId] = useState<string | null>(null);

    // Forms
    const [bannerForm, setBannerForm] = useState({ title: '', imageUrl: '', linkUrl: '', location: 'HERO', sequence: 0 });
    const [anncForm, setAnncForm] = useState({ title: '', content: '' });
    const [popupForm, setPopupForm] = useState({ title: '', imageUrl: '', content: '', linkUrl: '' });

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

    const openAddModal = (type: string) => {
        setEditId(null);
        if (type === 'banner') {
            setBannerForm({ title: '', imageUrl: '', linkUrl: '', location: 'HERO', sequence: 0 });
            setIsAddBannerModal(true);
        } else if (type === 'annc') {
            setAnncForm({ title: '', content: '' });
            setIsAddAnncModal(true);
        } else if (type === 'popup') {
            setPopupForm({ title: '', imageUrl: '', content: '', linkUrl: '' });
            setIsAddPopupModal(true);
        }
    };

    const openEditBanner = (b: any) => {
        setEditId(b.id);
        setBannerForm({ title: b.title, imageUrl: b.image, linkUrl: b.linkUrl || '', location: b.position, sequence: b.sortOrder });
        setIsAddBannerModal(true);
    };

    const openEditAnnc = (a: any) => {
        setEditId(a.id);
        setAnncForm({ title: a.title, content: a.content });
        setIsAddAnncModal(true);
    };

    const openEditPopup = (p: any) => {
        setEditId(p.id);
        setPopupForm({ title: p.title, imageUrl: p.image, content: p.content || '', linkUrl: p.linkUrl || '' });
        setIsAddPopupModal(true);
    };

    // Banner Handlers
    const handleCreateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            if (editId) {
                await axios.put(`${baseUrl}/merchant/content/banners/${editId}`, bannerForm, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post(`${baseUrl}/merchant/content/banners`, bannerForm, { headers: { Authorization: `Bearer ${token}` } });
            }
            setIsAddBannerModal(false);
            setEditId(null);
            setBannerForm({ title: '', imageUrl: '', linkUrl: '', location: 'HERO', sequence: 0 });
            mutateBanners();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan banner');
        }
    };

    const handleToggleBanner = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/content/banners/${id}/toggle`, { isActive: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
            mutateBanners();
        } catch (err) {
            alert('Gagal ubah status banner');
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Hapus banner ini?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${baseUrl}/merchant/content/banners/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutateBanners();
        } catch (err) {
            alert('Gagal hapus banner');
        }
    };

    // Image Upload Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, formSetter: Function, currentForm: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('admin_token');
            // Adding a visual cue to users that upload is in progress could be good, but simple alert for now
            const res = await axios.post(`${baseUrl}/merchant/content/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // `res.data.url` returns something like /uploads/123.webp
            // For the frontend to show it, we append baseUrl unless we are proxying
            const imagePath = res.data.url.startsWith('http') ? res.data.url : `${baseUrl}${res.data.url}`;
            formSetter({ ...currentForm, imageUrl: imagePath });
            alert('Gambar berhasil diupload dan dioptimasi!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengupload gambar');
        }
    };

    // Announcement Handlers
    const handleCreateAnnc = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            if (editId) {
                await axios.put(`${baseUrl}/merchant/content/announcements/${editId}`, anncForm, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post(`${baseUrl}/merchant/content/announcements`, anncForm, { headers: { Authorization: `Bearer ${token}` } });
            }
            setIsAddAnncModal(false);
            setEditId(null);
            setAnncForm({ title: '', content: '' });
            mutateAnnc();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan pengumuman');
        }
    };

    const handleToggleAnnc = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/content/announcements/${id}/toggle`, { isActive: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
            mutateAnnc();
        } catch (err) {
            alert('Gagal ubah status pengumuman');
        }
    };

    const handleDeleteAnnc = async (id: string) => {
        if (!confirm('Hapus pengumuman ini?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${baseUrl}/merchant/content/announcements/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutateAnnc();
        } catch (err) {
            alert('Gagal hapus pengumuman');
        }
    };

    // Popup Promo Handlers
    const handleCreatePopup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            if (editId) {
                await axios.put(`${baseUrl}/merchant/content/popup-promos/${editId}`, popupForm, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post(`${baseUrl}/merchant/content/popup-promos`, popupForm, { headers: { Authorization: `Bearer ${token}` } });
            }
            setIsAddPopupModal(false);
            setEditId(null);
            setPopupForm({ title: '', imageUrl: '', content: '', linkUrl: '' });
            mutatePopup();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan popup promo');
        }
    };

    const handleTogglePopup = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/content/popup-promos/${id}/toggle`, { isActive: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
            mutatePopup();
        } catch (err) {
            alert('Gagal ubah status popup');
        }
    };

    const handleDeletePopup = async (id: string) => {
        if (!confirm('Hapus popup ini?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${baseUrl}/merchant/content/popup-promos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutatePopup();
        } catch (err) {
            alert('Gagal hapus popup');
        }
    };

    const handleUpdateTheme = async (newTheme: string) => {
        try {
            const baseUrl = getApiUrl();
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
                            <Megaphone className="w-4 h-4" /> Pengumuman
                        </button>
                        <button onClick={() => setActiveTab('popup')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'popup' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Pointer className="w-4 h-4" /> Popup Promo
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
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Manajemen Banner</h3>
                                    <p className="text-xs text-slate-500">Slide gambar promo di halaman depan</p>
                                </div>
                                <button onClick={() => openAddModal('banner')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md">
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
                                                <div className="absolute top-2 right-2 flex gap-1 bg-white/50 backdrop-blur-md p-1 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] opacity-100 transition-opacity">
                                                    <button onClick={() => handleToggleBanner(b.id, b.isActive)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100/50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600">
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEditBanner(b)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100/50 hover:bg-amber-50 text-slate-600 hover:text-amber-600">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteBanner(b.id)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-100/50 hover:bg-red-50 hover:text-red-600 text-slate-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-2 left-2">
                                                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-black text-indigo-700 rounded-lg shadow-sm border border-indigo-100 uppercase tracking-tighter">Posisi: {b.position}</span>
                                                </div>
                                                {!b.isActive && (
                                                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center pointer-events-none">
                                                        <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg uppercase shadow-lg">Nonaktif</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 bg-white border-t border-slate-50">
                                                <p className="font-bold text-slate-800 text-sm truncate">{b.title}</p>
                                                <p className="text-[10px] text-slate-500 mt-1 truncate font-mono bg-slate-50 p-1 rounded">URL: {b.linkUrl || '-'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Announcements */}
                    {activeTab === 'announcements' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Papan Pengumuman</h3>
                                    <p className="text-xs text-slate-500">Teks berjalan atau informasi di dashboard user</p>
                                </div>
                                <button onClick={() => openAddModal('annc')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md">
                                    <Plus className="w-4 h-4" /> Tambah Pengumuman
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="space-y-3">
                                    {!announcements ? (
                                        <p className="text-slate-500 text-sm">Memuat data...</p>
                                    ) : announcements.length === 0 ? (
                                        <div className="text-center py-10 opacity-70 border-2 border-dashed border-slate-100 rounded-2xl">
                                            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 font-bold">Belum ada pengumuman</p>
                                        </div>
                                    ) : announcements.map((a: any) => (
                                        <div key={a.id} className={`flex items-center justify-between p-4 rounded-2xl border ${a.isActive ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${a.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                                    <Megaphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{a.content}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleToggleAnnc(a.id, a.isActive)} className={`p-2 rounded-lg border transition-colors ${a.isActive ? 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openEditAnnc(a)} className={`p-2 rounded-lg border bg-white border-amber-200 text-amber-500 hover:bg-amber-50`}>
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteAnnc(a.id)} className="p-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Popup Promos */}
                    {activeTab === 'popup' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Popup Promo</h3>
                                    <p className="text-xs text-slate-500">Muncul saat pelanggan pertama kali buka toko</p>
                                </div>
                                <button onClick={() => openAddModal('popup')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md">
                                    <Plus className="w-4 h-4" /> Tambah Popup
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {!popupPromos ? (
                                        <p className="text-slate-500 text-sm">Memuat data...</p>
                                    ) : popupPromos.length === 0 ? (
                                        <div className="col-span-2 text-center py-10 opacity-70">
                                            <Pointer className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-500 font-bold">Belum ada popup promo</p>
                                        </div>
                                    ) : popupPromos.map((p: any) => (
                                        <div key={p.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
                                            <div className="h-48 bg-slate-100 relative">
                                                <img src={p.image || 'https://via.placeholder.com/400x300?text=No+Image'} className="w-full h-full object-cover" alt={p.title} />
                                                {!p.isActive && (
                                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Mati</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <button onClick={() => handleTogglePopup(p.id, p.isActive)} className="p-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-indigo-600">
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEditPopup(p)} className="p-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-amber-600">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeletePopup(p.id)} className="p-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-slate-800 text-sm truncate">{p.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.content || 'Tidak ada deskripsi'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Theme */}
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
                            <h3 className="text-lg font-bold text-slate-800 text-center flex-grow pl-6">Konfigurasi Banner</h3>
                            <button onClick={() => setIsAddBannerModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-light">&times;</button>
                        </div>
                        <form onSubmit={handleCreateBanner} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Judul Banner</label>
                                    <input type="text" required value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" placeholder="Contoh: Promo Ramadhan" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Posisi / Lokasi</label>
                                        <select value={bannerForm.location} onChange={e => setBannerForm({ ...bannerForm, location: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm">
                                            <option value="HERO">Main Hero (Slider)</option>
                                            <option value="SIDEBAR">Sidebar</option>
                                            <option value="FOOTER">Footer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Urutan (0-9)</label>
                                        <input type="number" value={bannerForm.sequence} onChange={e => setBannerForm({ ...bannerForm, sequence: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Upload Gambar Banner (Otomatis WebP)</label>
                                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setBannerForm, bannerForm)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                    {bannerForm.imageUrl && <div className="mt-2 h-20 w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-200"><img src={bannerForm.imageUrl} className="h-full w-full object-cover" alt="Preview"/></div>}
                                    <p className="text-[10px] text-slate-400 mt-1 italic">*Gunakan ukuran rasio memanjang untuk hasil terbaik</p>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Atau Gunakan Image URL Langsung</label>
                                    <input type="url" value={bannerForm.imageUrl} onChange={e => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Link Tujuan (Opsional)</label>
                                    <input type="text" value={bannerForm.linkUrl} onChange={e => setBannerForm({ ...bannerForm, linkUrl: e.target.value })} placeholder="/produk/mobile-legends-topup" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200">
                                {editId ? 'Simpan Perubahan' : 'Apply & Sinkronisasi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Pengumuman */}
            {isAddAnncModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-[400px] overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 text-center flex-grow pl-6">{editId ? 'Edit Info' : 'Informasi Baru'}</h3>
                            <button onClick={() => setIsAddAnncModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-light">&times;</button>
                        </div>
                        <form onSubmit={handleCreateAnnc} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Judul Info</label>
                                    <input type="text" required value={anncForm.title} onChange={e => setAnncForm({ ...anncForm, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" placeholder="Contoh: Maintenance Sistem" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Konten / Isi Pesan</label>
                                    <textarea required value={anncForm.content} onChange={e => setAnncForm({ ...anncForm, content: e.target.value })} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm resize-none" placeholder="Tulis pengumuman di sini..."></textarea>
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200">
                                {editId ? 'Simpan Perubahan' : 'Publikasikan Info'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Popup */}
            {isAddPopupModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-[400px] overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 text-center flex-grow pl-6">{editId ? 'Edit Popup' : 'Popup Promo Strategis'}</h3>
                            <button onClick={() => setIsAddPopupModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-light">&times;</button>
                        </div>
                        <form onSubmit={handleCreatePopup} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Nama Promo</label>
                                    <input type="text" required value={popupForm.title} onChange={e => setPopupForm({ ...popupForm, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" placeholder="Contoh: Flash Sale Diamonds" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Upload Gambar Popup (Otomatis WebP)</label>
                                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setPopupForm, popupForm)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                    {popupForm.imageUrl && <div className="mt-2 h-20 w-32 rounded-xl bg-slate-100 overflow-hidden border border-slate-200"><img src={popupForm.imageUrl} className="h-full w-full object-cover" alt="Preview"/></div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Atau Gunakan Image URL Langsung</label>
                                    <input type="url" required value={popupForm.imageUrl} onChange={e => setPopupForm({ ...popupForm, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Penjelasan Singkat</label>
                                    <input type="text" value={popupForm.content} onChange={e => setPopupForm({ ...popupForm, content: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" placeholder="Opsional" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1">Direct Link (Opsional)</label>
                                    <input type="text" value={popupForm.linkUrl} onChange={e => setPopupForm({ ...popupForm, linkUrl: e.target.value })} placeholder="/promo/special" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 text-sm" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-8 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200">
                                {editId ? 'Simpan Perubahan' : 'Aktifkan Popup Sekarang'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
