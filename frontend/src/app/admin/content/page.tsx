"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Plus,
    Search,
    Megaphone,
    Image as ImageIcon,
    LayoutTemplate,
    Mail,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    ToggleLeft,
    ToggleRight,
    Send,
    Bell,
    Smartphone,
    X,
    Zap
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState<'BANNERS' | 'ANNOUNCEMENTS' | 'BROADCASTS' | 'TEMPLATES'>('BANNERS');
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // Banners state
    const { data: banners, isLoading: loadingBanners, mutate: mutateBanners } = useSWR('http://localhost:3001/admin/content/banners', fetcher);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [bannerForm, setBannerForm] = useState<any>({ title: '', image: '', linkUrl: '', position: 'HERO', sortOrder: 0 });

    // Announcements state
    const { data: announcements, isLoading: loadingAnnouncements, mutate: mutateAnnouncements } = useSWR('http://localhost:3001/admin/content/announcements', fetcher);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementForm, setAnnouncementForm] = useState<any>({ title: '', content: '' });

    // Templates state
    const { data: templates, isLoading: loadingTemplates, mutate: mutateTemplates } = useSWR('http://localhost:3001/admin/content/templates', fetcher);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateForm, setTemplateForm] = useState<any>({ type: 'ORDER', channel: 'EMAIL', subject: '', body: '' });

    // Broadcasts state
    const { data: broadcasts, isLoading: loadingBroadcasts, mutate: mutateBroadcasts } = useSWR('http://localhost:3001/admin/content/broadcasts', fetcher);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastForm, setBroadcastForm] = useState<any>({ name: '', subject: '', body: '', targetRole: 'ALL' });

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    // --- BANNER HANDLERS ---
    const handleSaveBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/admin/content/banners', bannerForm);
            mutateBanners();
            setShowBannerModal(false);
            setBannerForm({ title: '', image: '', linkUrl: '', position: 'HERO', sortOrder: 0 });
            showToast('Sukses', 'Banner baru berhasil ditambahkan');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };
    const handleToggleBanner = async (id: string) => {
        try {
            await axios.post(`http://localhost:3001/admin/content/banners/${id}/toggle`);
            mutateBanners();
            showToast('Sukses', 'Status banner berhasil diubah');
        } catch (err: any) {
            showToast('Gagal', 'Gagal merubah status banner', 'error');
        }
    };
    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Hapus banner ini permanen?')) return;
        try {
            await axios.delete(`http://localhost:3001/admin/content/banners/${id}`);
            mutateBanners();
            showToast('Sukses', 'Banner berhasil dihapus');
        } catch (err: any) {
            showToast('Gagal', 'Gagal menghapus banner', 'error');
        }
    };

    // --- ANNOUNCEMENT HANDLERS ---
    const handleSaveAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/admin/content/announcements', announcementForm);
            mutateAnnouncements();
            setShowAnnouncementModal(false);
            setAnnouncementForm({ title: '', content: '' });
            showToast('Sukses', 'Pengumuman baru berhasil ditambahkan');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };
    const handleToggleAnnouncement = async (id: string) => {
        try {
            await axios.post(`http://localhost:3001/admin/content/announcements/${id}/toggle`);
            mutateAnnouncements();
            showToast('Sukses', 'Status pengumuman berhasil diubah');
        } catch (err: any) {
            showToast('Gagal', 'Gagal merubah status', 'error');
        }
    };
    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Hapus pengumuman ini permanen?')) return;
        try {
            await axios.delete(`http://localhost:3001/admin/content/announcements/${id}`);
            mutateAnnouncements();
            showToast('Sukses', 'Pengumuman dihapus');
        } catch (err: any) {
            showToast('Gagal', 'Gagal menghapus', 'error');
        }
    };

    // --- TEMPLATE HANDLERS ---
    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/admin/content/templates', templateForm);
            mutateTemplates();
            setShowTemplateModal(false);
            setTemplateForm({ type: 'ORDER', channel: 'EMAIL', subject: '', body: '' });
            showToast('Sukses', 'Template notifikasi berhasil disimpan');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    // --- BROADCAST HANDLERS ---
    const handleCreateBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/admin/content/broadcasts', broadcastForm);
            mutateBroadcasts();
            setShowBroadcastModal(false);
            setBroadcastForm({ name: '', subject: '', body: '', targetRole: 'ALL' });
            showToast('Terkirim', 'Email blast / Campaign berhasil dijadwalkan');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    return (
        <AdminLayout>
            {/* TOAST SYSTEM */}
            {toastMsg && (
                <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-start gap-3 ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                        <div>
                            <p className="font-bold text-sm">{toastMsg.title}</p>
                            <p className="text-[13px] opacity-90 mt-0.5">{toastMsg.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Konten & Broadcast</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Kelola Banner Promo, Pengumuman, Template, dan Email Blast.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('BANNERS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'BANNERS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <ImageIcon className="w-4 h-4" /> Banners
                    </button>
                    <button onClick={() => setActiveTab('ANNOUNCEMENTS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'ANNOUNCEMENTS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Megaphone className="w-4 h-4" /> Announcements
                    </button>
                    <button onClick={() => setActiveTab('TEMPLATES')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'TEMPLATES' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <LayoutTemplate className="w-4 h-4" /> Templates
                    </button>
                    <button onClick={() => setActiveTab('BROADCASTS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'BROADCASTS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Mail className="w-4 h-4" /> Email Blast
                    </button>
                </div>
            </div>

            {/* TAB: BANNERS */}
            {activeTab === 'BANNERS' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Manajemen Banner Ads</h2>
                        <button onClick={() => setShowBannerModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                            <Plus className="w-4 h-4" /> Tambah Banner
                        </button>
                    </div>

                    {loadingBanners ? (
                        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {banners?.map((b: any) => (
                                <div key={b.id} className={`border ${b.isActive ? 'border-indigo-200 shadow-md shadow-indigo-100/50' : 'border-slate-200 opacity-60'} rounded-2xl overflow-hidden group transition`}>
                                    <div className="aspect-video bg-slate-100 relative">
                                        {/* Simulating image with placeholder if URL fails or we just use it */}
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${b.image.startsWith('http') ? b.image : 'https://placehold.co/600x400/e2e8f0/475569?text=' + b.title.substring(0, 2)})` }}></div>
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">{b.position}</div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1" title={b.title}>{b.title}</h3>
                                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1" title={b.linkUrl || 'No Link'}>🔗 {b.linkUrl || 'Tidak ada URL'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-4 text-[11px] font-medium text-slate-500">
                                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Clicks: {b.clickCount}</span>
                                            <span className="flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5 text-slate-400" /> Urutan: {b.sortOrder}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                            <button onClick={() => handleToggleBanner(b.id)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex justify-center items-center gap-2 ${b.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                                                {b.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />} {b.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                            </button>
                                            <button onClick={() => handleDeleteBanner(b.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {banners?.length === 0 && (
                                <div className="col-span-3 text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                    <p className="font-bold">Belum ada banner terpasang</p>
                                    <p className="text-sm">Silakan buat hero banner pertama anda.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: ANNOUNCEMENTS */}
            {activeTab === 'ANNOUNCEMENTS' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Sistem Pengumuman</h2>
                        <button onClick={() => setShowAnnouncementModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                            <Plus className="w-4 h-4" /> Buat Info Baru
                        </button>
                    </div>

                    {loadingAnnouncements ? (
                        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="space-y-4">
                            {announcements?.map((a: any) => (
                                <div key={a.id} className={`flex gap-4 p-4 border rounded-2xl transition ${a.isActive ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500 shrink-0">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-800 text-sm">{a.title}</h3>
                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(a.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[12px] text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => handleToggleAnnouncement(a.id)} className={`text-[11px] font-bold px-3 py-1 rounded-lg transition ${a.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                                                {a.isActive ? 'Tarik Info' : 'Publish Info'}
                                            </button>
                                            <button onClick={() => handleDeleteAnnouncement(a.id)} className="text-[11px] font-bold px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition tracking-wide">
                                                HAPUS
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: TEMPLATES */}
            {activeTab === 'TEMPLATES' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Notification Templates</h2>
                        <button onClick={() => setShowTemplateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                            <Plus className="w-4 h-4" /> Setup Template
                        </button>
                    </div>
                    {loadingTemplates ? (
                        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {templates?.map((t: any) => (
                                <div key={t.id} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 transition bg-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {t.channel === 'EMAIL' ? <Mail className="w-4 h-4 text-blue-500" /> : t.channel === 'WHATSAPP' || t.channel === 'SMS' ? <Smartphone className="w-4 h-4 text-emerald-500" /> : <Bell className="w-4 h-4 text-orange-500" />}
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{t.channel}</span>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-bold uppercase">{t.type}</span>
                                    </div>
                                    {t.subject && <h4 className="font-bold text-slate-800 text-sm mb-1 text-truncate border-b border-slate-200 pb-2">{t.subject}</h4>}
                                    <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100 mt-2 h-24 overflow-y-auto w-full max-w-full relative">
                                        {t.body}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: BROADCASTS */}
            {activeTab === 'BROADCASTS' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Email Blast / Broadcast</h2>
                        <button onClick={() => setShowBroadcastModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                            <Send className="w-4 h-4" /> Kirim Broadcast
                        </button>
                    </div>

                    <div className="space-y-4">
                        {broadcasts?.map((c: any) => (
                            <div key={c.id} className="border border-slate-200 rounded-2xl p-5 bg-white flex justify-between items-center group">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-indigo-500" /> {c.name}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-1">Subjek: {c.subject}</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                                        Target: <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{c.targetRole || 'ALL ENTITIES'}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[20px] font-black text-slate-700">{c.sentCount}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Penerima</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
                                        COMPLETED
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODALS */}
            {/* 1. Modal Banner */}
            {showBannerModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Tambah Banner Promo</h3>
                            <button onClick={() => setShowBannerModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Judul Promo</label>
                                <input type="text" required value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-sm" placeholder="Promo Spesial 12.12" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Posisi Tampil</label>
                                <select value={bannerForm.position} onChange={e => setBannerForm({ ...bannerForm, position: e.target.value })} className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-sm font-bold text-indigo-700">
                                    <option value="HERO">HERO Slider (Atas)</option>
                                    <option value="SIDEBAR">SIDEBAR (Samping)</option>
                                    <option value="POPUP">POPUP (Tampil Di Awal)</option>
                                    <option value="FOOTER">FOOTER (Bawah)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Image URL (Link Banner)</label>
                                <input type="url" required value={bannerForm.image} onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })} className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-sm" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Tujuan Link (Optional)</label>
                                <input type="url" value={bannerForm.linkUrl} onChange={e => setBannerForm({ ...bannerForm, linkUrl: e.target.value })} className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-sm" placeholder="https://... (Produk spesifik)" />
                            </div>
                            <button type="submit" className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition">Upload Banner Baru</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Modal Info */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Buat Pengumuman Sistem</h3>
                            <button onClick={() => setShowAnnouncementModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveAnnouncement} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Judul Peringatan / Info</label>
                                <input type="text" required value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Maintenance Server API Digiflazz..." />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Isi Pesan Lengkap</label>
                                <textarea required rows={5} value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm resize-none" placeholder="Tuliskan detail pengumuman Anda di sini..."></textarea>
                            </div>
                            <button type="submit" className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition shadow-lg shadow-indigo-100">Publish Pengumuman Beranda</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Modal Template */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Konfigurasi Template Notifikasi</h3>
                            <button onClick={() => setShowTemplateModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveTemplate} className="p-6">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Tipe Eksekusi (Action)</label>
                                    <select value={templateForm.type} onChange={e => setTemplateForm({ ...templateForm, type: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold">
                                        <option value="ORDER">Order Pembelian Baru</option>
                                        <option value="PAYMENT">Konfirmasi Pembayaran</option>
                                        <option value="SYSTEM">Info Sistem Umum</option>
                                        <option value="PROMO">Promo Pemasaran</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Jalur Pengiriman (Channel)</label>
                                    <select value={templateForm.channel} onChange={e => setTemplateForm({ ...templateForm, channel: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold">
                                        <option value="EMAIL">Kirim Email (SMTP)</option>
                                        <option value="WHATSAPP">Kirim WhatsApp</option>
                                        <option value="IN_APP">Notifikasi Lonceng In-App</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {templateForm.channel === 'EMAIL' && (
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase">Subjek Email</label>
                                        <input type="text" value={templateForm.subject} onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm" placeholder="Pesanan Vouchers Anda {{orderId}}" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Format Body Pesan</label>
                                    <p className="text-[10px] text-slate-400 mb-2 italic">Variabel dinamis: {"{{nama}}, {{orderId}}, {{totalPrice}}, {{status}}"}</p>
                                    <textarea required rows={7} value={templateForm.body} onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })} className="w-full font-mono text-sm p-3 border border-slate-200 rounded-xl resize-none" placeholder="Halo {{nama}},\nTerimakasih atas pembayaran sebesar Rp. {{totalPrice}} untuk order {{orderId}}..."></textarea>
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition">Simpan Pola Template</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. Modal Broadcast */}
            {showBroadcastModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-5 border-b border-indigo-100 flex justify-between items-center bg-indigo-50/50">
                            <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Send className="w-5 h-5 text-indigo-600" /> Tulis Email Broadcast</h3>
                            <button onClick={() => setShowBroadcastModal(false)}><X className="w-5 h-5 text-indigo-400 hover:text-indigo-900" /></button>
                        </div>
                        <form onSubmit={handleCreateBroadcast} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Nama Campaign Internal</label>
                                <input type="text" required value={broadcastForm.name} onChange={e => setBroadcastForm({ ...broadcastForm, name: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold" placeholder="Misal: Promo Akhir Tahun 2026" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Grup Target</label>
                                    <select value={broadcastForm.targetRole} onChange={e => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50">
                                        <option value="ALL">Semua User</option>
                                        <option value="MERCHANT">Tenant / Merchant</option>
                                        <option value="RESELLER">Reseller / Downline</option>
                                        <option value="CUSTOMER">Pembeli Umum</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Subjek Ke Customer</label>
                                    <input type="text" required value={broadcastForm.subject} onChange={e => setBroadcastForm({ ...broadcastForm, subject: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm" placeholder="Diskon Spesial Menanti Anda..." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Body Email (HTML Support)</label>
                                <textarea required rows={6} value={broadcastForm.body} onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })} className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-sm resize-none font-mono" placeholder="Tuliskan berita anda disini..."></textarea>
                            </div>
                            <button type="submit" className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                                <Zap className="w-5 h-5" /> Kirim Campaign Sekarang
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
