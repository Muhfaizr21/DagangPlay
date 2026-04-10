"use client";
import { getApiUrl } from '@/lib/api';
import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Plus,
    Settings2,
    Trash2,
    ChevronRight,
    Calculator,
    Zap
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
};

export default function PricingRulesPage() {
    const { data: rules, error, isLoading } = useSWR((getApiUrl()) + '/admin/pricing-rules/categories', fetcher);
    const { data: categories } = useSWR((getApiUrl()) + '/admin/products/categories', fetcher);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: 'global',
        marginNormal: 10,
        marginPro: 7,
        marginLegend: 5,
        marginSupreme: 3
    });

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post((getApiUrl()) + '/admin/pricing-rules/categories', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate((getApiUrl()) + '/admin/pricing-rules/categories');
            setIsModalOpen(false);
        } catch (err) {
            alert('Gagal menyimpan aturan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus aturan ini?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${getApiUrl()}/admin/pricing-rules/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate((getApiUrl()) + '/admin/pricing-rules/categories');
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    const handleApply = async (rule: any) => {
        if (!rule.categoryId) {
            alert('Aturan global belum didukung untuk apply bulk. Pilih kategori spesifik.');
            return;
        }
        if (!confirm(`Terapkan formula ini ke seluruh SKU di kategori ${rule.category?.name}? Harga akan berubah di frontend.`)) return;

        try {
            const token = localStorage.getItem('admin_token');
            const targetId = rule.categoryId || 'global';
            await axios.post(`${getApiUrl()}/admin/pricing-rules/apply-category/${targetId}`, {
                normal: rule.marginNormal,
                pro: rule.marginPro,
                legend: rule.marginLegend,
                supreme: rule.marginSupreme
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Formula berhasil diterapkan!');
        } catch (err) {
            alert('Gagal menerapkan formula');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Aturan Formula Margin</h1>
                    <p className="text-slate-500 text-[13px]">Set persentase margin per kategori untuk update harga otomatis.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Aturan
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="text-center py-20 text-slate-400 font-medium">Memuat aturan...</div>
                ) : rules?.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
                        <Settings2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium whitespace-pre-line">Belum ada aturan pricing kategori.{"\n"}Klik tombol Tambah Aturan untuk memulai.</p>
                    </div>
                ) : rules?.map((rule: any) => (
                    <div key={rule.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-indigo-200 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-all"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-[17px] font-bold text-slate-900">{rule.category?.name || 'GLOBAL (Seluruh Kategori)'}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-1">Status: AKTIF</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-center min-w-[80px]">
                                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">Normal</p>
                                    <p className="text-[15px] font-bold text-indigo-700">{rule.marginNormal}%</p>
                                </div>
                                <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-center min-w-[80px]">
                                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Pro</p>
                                    <p className="text-[15px] font-bold text-blue-700">{rule.marginPro}%</p>
                                </div>
                                <div className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl text-center min-w-[80px]">
                                    <p className="text-[9px] font-bold text-purple-400 uppercase tracking-tighter">Legend</p>
                                    <p className="text-[15px] font-bold text-purple-700">{rule.marginLegend}%</p>
                                </div>
                                <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-center min-w-[80px]">
                                    <p className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter">Supreme</p>
                                    <p className="text-[15px] font-bold text-amber-700">{rule.marginSupreme}%</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                                <button
                                    onClick={() => handleApply(rule)}
                                    className="flex-1 md:flex-none flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    <Calculator className="w-3.5 h-3.5" />
                                    Terapkan Formula
                                </button>
                                <button
                                    onClick={() => handleDelete(rule.id)}
                                    className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Tambah */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Setting Margin Baru</h3>
                                <p className="text-[12px] text-slate-400 font-medium uppercase tracking-wider mt-1">Kategori: {categories?.find((c: any) => c.id === formData.categoryId)?.name || 'Global'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold">X</button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pilih Kategori</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="global">Global (Seluruh Produk)</option>
                                    {categories?.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Margin Normal (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-xl outline-none focus:border-indigo-500 font-bold"
                                        value={formData.marginNormal}
                                        onChange={(e) => setFormData({ ...formData, marginNormal: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Margin Pro (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:border-blue-500 font-bold"
                                        value={formData.marginPro}
                                        onChange={(e) => setFormData({ ...formData, marginPro: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Margin Legend (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-purple-50/30 border border-purple-100 rounded-xl outline-none focus:border-purple-500 font-bold"
                                        value={formData.marginLegend}
                                        onChange={(e) => setFormData({ ...formData, marginLegend: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Margin Supreme (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-xl outline-none focus:border-amber-500 font-bold"
                                        value={formData.marginSupreme}
                                        onChange={(e) => setFormData({ ...formData, marginSupreme: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                            >
                                Simpan Aturan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
