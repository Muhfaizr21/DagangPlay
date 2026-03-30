"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Plus,
    Search,
    Video,
    Trash2,
    Edit,
    ExternalLink,
    GraduationCap,
    CheckCircle2,
    XCircle,
    Play
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MarketingAdmin() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGuide, setEditingGuide] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        content: '',
        videoUrl: '',
        imageUrl: '',
        thumbnail: '',
        category: 'Marketing Strategy',
        targetPlan: 'SUPREME',
        isActive: true,
        sortOrder: 0
    });

    const { data: guides, mutate } = useSWR(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/marketing/guides?search=${searchTerm}`, fetcher);

    const handleOpenCreate = () => {
        setEditingGuide(null);
        setForm({
            title: '',
            content: '',
            videoUrl: '',
            imageUrl: '',
            thumbnail: '',
            category: 'Marketing Strategy',
            targetPlan: 'SUPREME',
            isActive: true,
            sortOrder: 0
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (guide: any) => {
        setEditingGuide(guide);
        setForm({
            ...guide,
            sortOrder: guide.sortOrder || 0
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            if (editingGuide) {
                await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/marketing/guides/${editingGuide.id}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/marketing/guides', form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            mutate();
            setIsModalOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving guide');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus panduan ini secara permanen?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/marketing/guides/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting guide');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <GraduationCap className="w-7 h-7 text-indigo-600" />
                        Marketing Academy
                    </h1>
                    <p className="text-[14px] text-slate-500 mt-1">Edukasi & Kit Marketing Eksklusif untuk Supreme Merchants.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="h-[42px] px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" /> Tambah Panduan
                </button>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides?.map((guide: any) => (
                    <div key={guide.id} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                            {guide.thumbnail ? (
                                <img src={guide.thumbnail} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Video className="w-10 h-10 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-black text-indigo-600 rounded-full border border-indigo-100 shadow-sm uppercase tracking-wider">
                                    {guide.category}
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                                    <Play className="fill-current w-5 h-5 ml-1" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-widest ${guide.targetPlan === 'SUPREME' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}>
                                    {guide.targetPlan} ONLY
                                </span>
                                {!guide.isActive && <span className="text-[9px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-widest"><XCircle className="w-3 h-3" /> Draft</span>}
                            </div>
                            <h3 className="font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight line-clamp-2 min-h-[3rem]">{guide.title}</h3>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-2">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleOpenEdit(guide)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(guide.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <a href={guide.videoUrl} target="_blank" className="p-2 text-slate-400 hover:text-slate-800 transition-all hover:bg-slate-100 rounded-lg">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Edit/Create */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[32px] w-full max-w-2xl relative z-10 shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">{editingGuide ? 'Edit Panduan' : 'Buat Panduan Baru'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Judul Video / Tutorial</label>
                                    <input
                                        required
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                        placeholder="Judul menarik panduan marketing..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kategori</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                    >
                                        <option value="Marketing Strategy">Marketing Strategy</option>
                                        <option value="Branding">Branding</option>
                                        <option value="Ads & Traffic">Ads & Traffic</option>
                                        <option value="Management">Management</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Limit Plan</label>
                                    <select
                                        value={form.targetPlan}
                                        onChange={(e) => setForm({ ...form, targetPlan: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                    >
                                        <option value="FREE">Semua Plan (FREE+)</option>
                                        <option value="PRO">Minimum PRO+</option>
                                        <option value="LEGEND">Minimum LEGEND+</option>
                                        <option value="SUPREME">SUPREME ONLY</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">YouTube / Video URL</label>
                                    <input
                                        type="url"
                                        value={form.videoUrl}
                                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Banner / Marketing Kit Image URL</label>
                                    <input
                                        type="url"
                                        value={form.imageUrl}
                                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                        placeholder="https://example.com/marketing-kit.jpg..."
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Thumbnail Image URL</label>
                                    <input
                                        type="url"
                                        value={form.thumbnail}
                                        onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                        placeholder="https://i.ytimg.com/vi/..."
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Konten / Deskripsi Singkat</label>
                                    <textarea
                                        rows={4}
                                        value={form.content}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                        placeholder="Ringkasan atau panduan teks..."
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                                    />
                                </div>
                                <div className="sm:col-span-1 flex items-center gap-2 mt-6">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isActive" className="text-[13px] font-black text-slate-700 uppercase tracking-tight">Langsung Publikasi?</label>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-[13px] font-black text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-indigo-600 text-white font-black text-[13px] rounded-[18px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                >
                                    Simpan Panduan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
