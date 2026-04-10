"use client";
import { getApiUrl } from '@/lib/api';
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import {
    Search, Pencil, Check, X, Settings2, AlertCircle,
    ImageIcon, Layers, ChevronDown, ChevronRight, SlidersHorizontal
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('admin_token') : null;
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantProductsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [editSkuId, setEditSkuId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkPercentage, setBulkPercentage] = useState<number>(10);
    const [bulkMode, setBulkMode] = useState<'PERCENT' | 'FIXED'>('PERCENT');
    const [bulkAmount, setBulkAmount] = useState<number>(0);
    const [isCustomizingProduct, setIsCustomizingProduct] = useState<any>(null);
    const [customName, setCustomName] = useState('');
    const [customThumbnail, setCustomThumbnail] = useState('');
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

    const baseUrl = getApiUrl();

    const { data: categories } = useSWR(`${baseUrl}/merchant/products/categories`, fetcher);

    const productUrl = useMemo(() => {
        let url = `${baseUrl}/merchant/products?search=${search}`;
        if (selectedCategoryId) url += `&categoryId=${selectedCategoryId}`;
        return url;
    }, [baseUrl, search, selectedCategoryId]);

    const { data: products, error, isLoading, mutate } = useSWR(productUrl, fetcher);

    const filteredProducts = useMemo(() => {
        let list = products || [];
        if (filterStatus === 'ACTIVE') list = list.filter((p: any) => p.skus?.some((s: any) => s.isActive));
        else if (filterStatus === 'INACTIVE') list = list.filter((p: any) => p.skus?.every((s: any) => !s.isActive));
        return list;
    }, [products, filterStatus]);

    const totalActive = useMemo(() =>
        (products || []).reduce((acc: number, p: any) => acc + (p.skus?.filter((s: any) => s.isActive).length || 0), 0),
        [products]);

    const toggleCollapse = (id: string) => {
        setCollapsedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSavePrice = async (sku: any) => {
        if (Number(editPrice) < sku.defaultSellingPrice) {
            alert(`Harga jual min: Rp ${sku.defaultSellingPrice.toLocaleString('id-ID')} (harga modal)`);
            return;
        }
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/products/${sku.id}/price`,
                { sellingPrice: Number(editPrice), isActive: sku.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditSkuId(null);
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan harga');
        }
    };

    const handleToggleSku = async (sku: any) => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/products/${sku.id}/price`,
                { sellingPrice: sku.merchantSellingPrice, isActive: !sku.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah status');
        }
    };

    const handleBulkUpdate = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
            await axios.post(`${baseUrl}/merchant/products/bulk-update`, {
                markupPercentage: bulkMode === 'PERCENT' ? Number(bulkPercentage) : 0,
                markupAmount: bulkMode === 'FIXED' ? Number(bulkAmount) : 0,
                categoryId: selectedCategoryId || undefined
            }, { headers: { Authorization: `Bearer ${token}` } });
            setIsBulkModalOpen(false);
            mutate();
            alert('Berhasil update harga massal!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal bulk update');
        }
    };

    const handleSaveMetadata = async () => {
        if (!isCustomizingProduct) return;
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/products/${isCustomizingProduct.id}/metadata`,
                { customName: customName || undefined, customThumbnail: customThumbnail || undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsCustomizingProduct(null);
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const selectedCategoryName = categories?.find((c: any) => c.id === selectedCategoryId)?.name;

    return (
        <MerchantLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Katalog Produk</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Kelola harga jual & visibilitas produk toko Anda.
                        {!isLoading && <span className="ml-1.5 font-semibold text-blue-600">{totalActive} SKU aktif</span>}
                    </p>
                </div>
                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-sm shrink-0"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {selectedCategoryId ? `Bulk: ${selectedCategoryName}` : 'Bulk Margin'}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama produk atau SKU..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide shrink-0">Game:</span>
                    <button
                        onClick={() => setSelectedCategoryId('')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${!selectedCategoryId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                    >Semua</button>
                    {(categories || []).map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? '' : cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${selectedCategoryId === cat.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                        >
                            {cat.image && <img src={cat.image} alt="" className="w-3.5 h-3.5 rounded-full object-cover" onError={(e: any) => e.target.style.display = 'none'} />}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status:</span>
                    {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                            {s === 'ALL' ? 'Semua' : s === 'ACTIVE' ? '✅ Aktif' : '⛔ Nonaktif'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Memuat katalog...</p>
                </div>
            ) : error ? (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div><b className="block">Gagal memuat data</b>Periksa koneksi dan sesi login Anda.</div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <Layers className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">Tidak ada produk</p>
                    <p className="text-sm text-gray-400 mt-1">{selectedCategoryId ? `Kosong di kategori "${selectedCategoryName}"` : 'Coba ubah filter pencarian'}</p>
                    {selectedCategoryId && <button onClick={() => setSelectedCategoryId('')} className="mt-3 text-sm text-blue-600 hover:underline">Lihat semua →</button>}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredProducts.map((product: any) => {
                        const isCollapsed = collapsedIds.has(product.id);
                        const activeSkus = product.skus?.filter((s: any) => s.isActive).length || 0;

                        return (
                            <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                {/* Product Header */}
                                <div
                                    onClick={() => toggleCollapse(product.id)}
                                    className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl select-none"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {product.thumbnail
                                                ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                                : <ImageIcon className="w-4 h-4 text-gray-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-gray-900">{product.name}</span>
                                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">{product.category}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                <span className="text-green-600 font-semibold">{activeSkus} aktif</span> · {product.skus?.length || 0} SKU
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                setIsCustomizingProduct(product);
                                                setCustomName(product.customName || '');
                                                setCustomThumbnail(product.customThumbnail || '');
                                            }}
                                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings2 className="w-3 h-3" /> Edit Nama
                                        </button>
                                        {isCollapsed
                                            ? <ChevronRight className="w-4 h-4 text-gray-400" />
                                            : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                </div>

                                {/* SKU Rows */}
                                {!isCollapsed && (
                                    <div className="border-t border-gray-100">
                                        {/* Column Headers */}
                                        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2 bg-gray-50 border-b border-gray-100 gap-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Paket</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right w-28">Modal</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right w-24">Profit</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right w-36">Harga Jual</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-14">Aktif</span>
                                        </div>

                                        {product.skus?.map((sku: any) => {
                                            const modal = Number(sku.defaultSellingPrice) || 0;
                                            const jual = Number(sku.merchantSellingPrice) || modal;
                                            const profit = jual - modal;
                                            const isEditing = editSkuId === sku.id;

                                            return (
                                                <div
                                                    key={sku.id}
                                                    className={`grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2.5 gap-4 border-b border-gray-50 last:border-0 transition-colors ${!sku.isActive ? 'opacity-50 bg-gray-50/50' : 'hover:bg-blue-50/30'}`}
                                                >
                                                    {/* Nama */}
                                                    <span className="text-sm font-medium text-gray-800 truncate">{sku.name}</span>

                                                    {/* Modal */}
                                                    <span className="text-sm text-gray-500 text-right w-28">Rp {modal.toLocaleString('id-ID')}</span>

                                                    {/* Profit */}
                                                    <div className="w-24 flex justify-end">
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${profit > 0 ? 'bg-green-100 text-green-700' : profit === 0 ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                                                            +{profit.toLocaleString('id-ID')}
                                                        </span>
                                                    </div>

                                                    {/* Harga Jual / Edit */}
                                                    <div className="w-36 flex items-center justify-end gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <div className="relative">
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Rp</span>
                                                                    <input
                                                                        type="number"
                                                                        value={editPrice}
                                                                        autoFocus
                                                                        onChange={e => setEditPrice(Number(e.target.value))}
                                                                        onKeyDown={e => { if (e.key === 'Enter') handleSavePrice(sku); if (e.key === 'Escape') setEditSkuId(null); }}
                                                                        className="w-28 pl-7 pr-2 py-1 text-sm font-semibold border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-slate-800"
                                                                    />
                                                                </div>
                                                                <button onClick={() => handleSavePrice(sku)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setEditSkuId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-bold text-gray-900">Rp {jual.toLocaleString('id-ID')}</span>
                                                                <button
                                                                    onClick={() => { setEditSkuId(sku.id); setEditPrice(jual); }}
                                                                    className="ml-1 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                    title="Edit harga jual"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Toggle */}
                                                    <div className="w-14 flex justify-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" className="sr-only peer" checked={sku.isActive} onChange={() => handleToggleSku(sku)} />
                                                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Bulk Margin */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsBulkModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Setup Bulk Margin</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{selectedCategoryId ? `Kategori: ${selectedCategoryName}` : 'Semua produk aktif'}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setBulkMode('PERCENT')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${bulkMode === 'PERCENT' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Persentase (%)</button>
                                <button onClick={() => setBulkMode('FIXED')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${bulkMode === 'FIXED' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Nominal Tetap (Rp)</button>
                            </div>
                            {bulkMode === 'PERCENT' ? (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Target Margin (%)</label>
                                    <div className="relative">
                                        <input type="number" value={bulkPercentage} onChange={e => setBulkPercentage(Number(e.target.value))} className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-slate-800" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Contoh: 10% dari modal Rp 10.000 → Harga Jual Rp 11.000</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Markup Nominal (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                        <input type="number" value={bulkAmount} onChange={e => setBulkAmount(Number(e.target.value))} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-slate-800" />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Contoh: Rp 2.000 dari modal Rp 10.000 → Harga Jual Rp 12.000</p>
                                </div>
                            )}
                            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                                <span>Aksi ini akan <b>menimpa semua harga manual</b> yang sudah Anda set sebelumnya.</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Batal</button>
                            <button onClick={handleBulkUpdate} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition-colors">Eksekusi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Edit Nama */}
            {isCustomizingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCustomizingProduct(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <Settings2 className="w-5 h-5 text-gray-400" />
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Kustomisasi Tampilan</h3>
                                <p className="text-xs text-gray-500">{isCustomizingProduct.name}</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">Nama Kustom (tampil di toko)</label>
                                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder={isCustomizingProduct.name} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-slate-800" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">URL Thumbnail Kustom</label>
                                <input type="url" value={customThumbnail} onChange={e => setCustomThumbnail(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-slate-800" />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setIsCustomizingProduct(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Tutup</button>
                            <button onClick={handleSaveMetadata} className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-xl shadow transition-colors">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
