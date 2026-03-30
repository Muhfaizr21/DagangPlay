"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Filter,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Save,
    Calculator,
    ArrowRight,
    RefreshCw,
    ImageIcon,
    Link as LinkIcon
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
};

export default function AdminPricingPage() {
    const { data: skus, error, isLoading } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/products/skus/pricing', fetcher);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Filtered data
    const filteredSkus = skus?.filter((sku: any) => {
        const nameMatch = sku.name.toLowerCase().includes(searchQuery.toLowerCase());
        const productNameMatch = sku.product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = nameMatch || productNameMatch;
        const matchesCategory = filterCategory === 'All' || sku.product.category.name === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categoriesObjMap = new Map();
    skus?.forEach((s: any) => {
        if (!categoriesObjMap.has(s.product.category.name)) {
            categoriesObjMap.set(s.product.category.name, s.product.category);
        }
    });
    const categories = Array.from(categoriesObjMap.values());
    const activeCategoryItem = categories.find(c => c.name === filterCategory);

    const [editingImage, setEditingImage] = useState(false);
    const [imgUrlInput, setImgUrlInput] = useState('');

    const handleSaveImage = async () => {
        if (!activeCategoryItem) return;
        try {
            const token = localStorage.getItem('admin_token');
            // Encode the category name to handle special characters correctly, although NextJS might auto handle
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/products/categories/${encodeURIComponent(activeCategoryItem.name)}/image`, {
                imageUrl: imgUrlInput
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/products/skus/pricing');
            setEditingImage(false);
            setImgUrlInput('');
            alert('Gambar kategori berhasil disimpan');
        } catch (err) {
            alert('Gagal menyimpan gambar kategori');
        }
    };

    const handleSync = async () => {
        if (!confirm('Singkronkan ulang seluruh produk dari Digiflazz? Ini akan mengupdate harga dasar dan menerapkan margin default jika SKU baru ditemukan.')) return;
        setSyncing(true);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/products/sync', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message || 'Sinkronisasi berhasil!');
            mutate((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/products/skus/pricing');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal sinkronisasi dengan Digiflazz');
        } finally {
            setSyncing(false);
        }
    };

    const handleEdit = (sku: any) => {
        setEditingId(sku.id);
        setEditValues({
            normal: sku.priceNormal,
            pro: sku.pricePro,
            legend: sku.priceLegend,
            supreme: sku.priceSupreme
        });
    };

    const handleSave = async (id: string) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/products/skus/${id}/price`, editValues, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/products/skus/pricing');
            setEditingId(null);
        } catch (err) {
            alert('Gagal menyimpan harga');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (sku: any) => {
        const newStatus = sku.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            const token = localStorage.getItem('admin_token');
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/products/skus/${sku.id}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/products/skus/pricing');
        } catch (err) {
            alert('Gagal mengubah status produk');
        }
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    if (error) return <AdminLayout><div>Error loading data...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Manajemen Tier Harga</h1>
                <p className="text-slate-500">Kelola 4 tier harga (Normal/Pro/Legend/Supreme) untuk seluruh SKU.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total SKU Terdata</p>
                        <p className="text-2xl font-bold text-slate-900">{skus?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between transition-all">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari SKU atau Produk..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full md:w-72 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Link
                        href="/admin/products/pricing/rules"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-[13px] font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Calculator className="w-4 h-4" />
                        Bulk Formula
                    </Link>
                    <button
                        onClick={handleSync}
                        disabled={syncing || isLoading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Digiflazz'}
                    </button>
                    <button
                        onClick={() => mutate((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/products/skus/pricing')}
                        disabled={isLoading}
                        className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Premium Category Filter - Horizontal Scroll */}
            <div className="mb-6 relative">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth pr-10">
                    <button
                        onClick={() => { setFilterCategory('All'); setEditingImage(false); }}
                        className={`flex-none px-4 py-2 rounded-full text-[13px] font-bold transition-all border flex items-center gap-2
                            ${filterCategory === 'All'
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        Semua Kategori
                    </button>
                    {categories.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => { setFilterCategory(cat.name); setEditingImage(false); }}
                            className={`flex-none px-4 py-2 rounded-full text-[13px] font-bold transition-all border
                                ${filterCategory === cat.name
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                {/* Fade effect at the end of scroll */}
                <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-[#fafafa] to-transparent pointer-events-none"></div>
            </div>

            {/* Category Setting Editor */}
            {filterCategory !== 'All' && activeCategoryItem && (
                <div className="mb-6 p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm flex items-start flex-col md:flex-row gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {activeCategoryItem.image ? (
                            <img src={activeCategoryItem.image} alt={activeCategoryItem.name} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{activeCategoryItem.name}</h3>
                                <p className="text-xs text-slate-500">Konfigurasi gambar kategori ini akan digunakan pada halaman Frontend untuk semua produk dalam kategori {activeCategoryItem.name}.</p>
                            </div>
                            {!editingImage ? (
                                <button
                                    onClick={() => { setImgUrlInput(activeCategoryItem.image || ''); setEditingImage(true); }}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100 transition"
                                >
                                    Ubah Gambar
                                </button>
                            ) : null}
                        </div>

                        {editingImage && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-600 mb-2">URL Gambar Kategori</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-indigo-500 outline-none"
                                            placeholder="https://..."
                                            value={imgUrlInput}
                                            onChange={(e) => setImgUrlInput(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveImage}
                                        className="px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        onClick={() => setEditingImage(false)}
                                        className="px-5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-sm transition"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Pricing Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-separate">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi SKU</th>
                                <th className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Modal</th>
                                <th className="px-4 py-5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50/20 border-x border-indigo-100/30">Normal</th>
                                <th className="px-4 py-5 text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50/20 border-x border-blue-100/30">Pro</th>
                                <th className="px-4 py-5 text-[10px] font-bold text-purple-500 uppercase tracking-widest bg-purple-50/20 border-x border-purple-100/30">Legend</th>
                                <th className="px-4 py-5 text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-50/20 border-x border-amber-100/30">Supreme</th>
                                <th className="px-6 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelola</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center py-24 text-slate-400 font-medium">Memuat data pricing...</td></tr>
                            ) : filteredSkus?.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-24 text-slate-400 font-medium whitespace-pre-wrap">Tidak ada data ditemukan.{"\n"}Coba hapus filter atau cari kata lain.</td></tr>
                            ) : filteredSkus?.map((sku: any) => (
                                <tr key={sku.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[13px] font-bold text-slate-900 leading-none">{sku.name}</p>
                                                    <button
                                                        onClick={() => handleToggleStatus(sku)}
                                                        className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 ${sku.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                                    >
                                                        {sku.status}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">{sku.product.category.name}</span>
                                                    <span className="text-slate-300">/</span>
                                                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{sku.product.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-right">
                                        <span className="text-[13px] font-mono font-bold text-slate-600">{formatIDR(sku.basePrice)}</span>
                                    </td>

                                    {/* Normal Tier */}
                                    <td className="px-4 py-5 bg-indigo-50/5 border-x border-indigo-100/10">
                                        {editingId === sku.id ? (
                                            <input
                                                type="number"
                                                className="w-full min-w-[100px] px-3 py-2 bg-white border-2 border-indigo-200 rounded-lg text-[13px] font-bold focus:border-indigo-500 outline-none"
                                                value={editValues.normal}
                                                onChange={(e) => setEditValues({ ...editValues, normal: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-[13.5px] font-bold text-indigo-700">{formatIDR(sku.priceNormal)}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className={`text-[10px] font-bold ${sku.marginNormal < 5 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                        {sku.marginNormal.toFixed(1)}%
                                                    </span>
                                                    {sku.marginNormal < 5 && <AlertTriangle className="w-2.5 h-2.5 text-rose-500 animate-pulse" />}
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    {/* Pro Tier */}
                                    <td className="px-4 py-5 bg-blue-50/5 border-x border-blue-100/10">
                                        {editingId === sku.id ? (
                                            <input
                                                type="number"
                                                className="w-full min-w-[100px] px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-[13px] font-bold focus:border-blue-500 outline-none"
                                                value={editValues.pro}
                                                onChange={(e) => setEditValues({ ...editValues, pro: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-[13.5px] font-bold text-blue-700">{formatIDR(sku.pricePro)}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className={`text-[10px] font-bold ${sku.marginPro < 3 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                        {sku.marginPro.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    {/* Legend Tier */}
                                    <td className="px-4 py-5 bg-purple-50/5 border-x border-purple-100/10">
                                        {editingId === sku.id ? (
                                            <input
                                                type="number"
                                                className="w-full min-w-[100px] px-3 py-2 bg-white border-2 border-purple-200 rounded-lg text-[13px] font-bold focus:border-purple-500 outline-none"
                                                value={editValues.legend}
                                                onChange={(e) => setEditValues({ ...editValues, legend: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-[13.5px] font-bold text-purple-700">{formatIDR(sku.priceLegend)}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className={`text-[10px] font-bold ${sku.marginLegend < 2 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                        {sku.marginLegend.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    {/* Supreme Tier */}
                                    <td className="px-4 py-5 bg-amber-50/5 border-x border-amber-100/10">
                                        {editingId === sku.id ? (
                                            <input
                                                type="number"
                                                className="w-full min-w-[100px] px-3 py-2 bg-white border-2 border-amber-200 rounded-lg text-[13px] font-bold focus:border-amber-500 outline-none"
                                                value={editValues.supreme}
                                                onChange={(e) => setEditValues({ ...editValues, supreme: parseInt(e.target.value) })}
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-[13.5px] font-bold text-amber-700">{formatIDR(sku.priceSupreme)}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className={`text-[10px] font-bold ${sku.marginSupreme < 1 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                        {sku.marginSupreme.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex justify-center flex-col gap-2">
                                            {editingId === sku.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSave(sku.id)}
                                                        disabled={saving}
                                                        className="flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-100"
                                                    >
                                                        <Save className="w-3.5 h-3.5" />
                                                        Simpan
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="py-1.5 text-slate-500 text-[11px] font-bold hover:text-slate-800"
                                                    >
                                                        Batal
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(sku)}
                                                    className="px-4 py-2 bg-white border-2 border-slate-100 text-slate-700 rounded-lg text-[11px] font-bold hover:border-indigo-100 hover:text-indigo-600 transition-all active:scale-95"
                                                >
                                                    Set Harga Per Tier
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
