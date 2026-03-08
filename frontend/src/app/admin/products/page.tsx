"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Search,
    Plus,
    RefreshCw,
    FolderTree,
    PackageSearch,
    MoreVertical,
    CheckCircle2,
    Loader2,
    AlertCircle
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ProductManagementPage() {
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
    const [isSyncing, setIsSyncing] = useState(false);
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // Fetch Data
    const { data: products, error: prodErr, mutate: mutateProd } = useSWR('http://localhost:3001/admin/products', fetcher);
    const { data: categories, error: catErr, mutate: mutateCat } = useSWR('http://localhost:3001/admin/products/categories', fetcher);

    const handleSyncDigiflazz = async () => {
        if (!confirm('Apakah Anda yakin ingin melakukan sinkronisasi dengan Digiflazz? Proses ini mungkin memakan waktu.')) return;

        setIsSyncing(true);
        try {
            const res = await axios.post('http://localhost:3001/admin/products/sync');

            setToastMsg({
                title: 'Sinkronisasi Berhasil',
                desc: `Sukses menambah ${res.data.newCount} SKU baru, dan update ${res.data.updatedCount} SKU.`,
                type: 'success'
            });

            mutateProd();
            mutateCat();
        } catch (err: any) {
            setToastMsg({
                title: 'Gagal Sinkronisasi',
                desc: err.response?.data?.message || 'Terjadi kesalahan sistem',
                type: 'error'
            });
        } finally {
            setIsSyncing(false);
            setTimeout(() => setToastMsg(null), 5000);
        }
    };

    const isLoading = (!products && !prodErr) || (!categories && !catErr);

    return (
        <AdminLayout>
            {/* Toast Notification */}
            {toastMsg && (
                <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-xl shadow-lg flex items-start gap-3 border ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200/60 text-emerald-800' : 'bg-red-50 border-red-200/60 text-red-800'}`}>
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
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Produk</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Kelola katalog produk, kategori, margin harga, dan integrasi supplier.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        disabled={isSyncing}
                        onClick={handleSyncDigiflazz}
                        className="h-[38px] px-4 inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-slate-50 hover:border-indigo-200 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Sinkronisasi Berjalan...' : 'Sync Digiflazz'}
                    </button>
                    <button className="h-[38px] px-4 inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg bg-indigo-600 border border-transparent text-white hover:bg-indigo-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Buat Manual
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
                {/* Tabs */}
                <div className="border-b border-slate-100 px-6 pt-4 flex items-center gap-8 bg-slate-50/50">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-4 text-[14px] font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <PackageSearch className="w-4 h-4" /> Data Produk
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`pb-4 text-[14px] font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <FolderTree className="w-4 h-4" /> Kategori & Brand
                    </button>
                </div>

                {/* Table Controls (Search/Filter) */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder={`Cari ${activeTab === 'products' ? 'Nama Produk/SKU' : 'Nama Kategori'}...`}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* Loading / Error States */}
                {isLoading && (
                    <div className="flex flex-col flex-1 items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                        <p className="text-sm font-medium">Memuat data...</p>
                    </div>
                )}

                {(prodErr || catErr) && !isLoading && (
                    <div className="p-8 text-center text-red-500 font-medium text-sm">
                        Koneksi Backend Gagal. Error Server.
                    </div>
                )}

                {/* CONTENT AREA: PRODUCTS */}
                {!isLoading && !(prodErr || catErr) && activeTab === 'products' && (
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Nama Produk / Game</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Jumlah SKU (Varian)</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products?.map((prod: any) => (
                                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800">{prod.name}</p>
                                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{prod.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200/60">
                                                {prod.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[13px] font-semibold text-slate-700">{prod.skus?.length || 0} varian</p>
                                            {prod.skus?.length > 0 && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Termurah: Rp {Number(prod.skus[0].sellingPrice).toLocaleString('id-ID')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-bold tracking-wider">
                                                {prod.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!products || products.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500 text-[14px]">
                                            Belum ada data produk tersimpan. Silakan import dari Digiflazz.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* CONTENT AREA: CATEGORIES */}
                {!isLoading && !(prodErr || catErr) && activeTab === 'categories' && (
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Nama Brand / Kategori</th>
                                    <th className="px-6 py-4">Slug</th>
                                    <th className="px-6 py-4 text-center">Total Produk Terhubung</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories?.map((cat: any) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-[14px] font-bold text-slate-800">{cat.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[12px] text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded inline-flex border border-slate-200/50">{cat.slug}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex w-7 h-7 bg-indigo-50 text-indigo-700 font-bold items-center justify-center rounded-full text-[12px]">
                                                {cat._count?.products || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {cat.isActive ? (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!categories || categories.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500 text-[14px]">
                                            Belum ada data kategori tersimpan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
