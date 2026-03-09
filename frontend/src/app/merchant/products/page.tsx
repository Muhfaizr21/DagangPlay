"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Package, Search, Filter, Pencil, Check, X, AlertTriangle, Layers, Zap } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantProductsPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Semua');
    const [editSkuId, setEditSkuId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkPercentage, setBulkPercentage] = useState<number>(10);

    const { data: products, error, isLoading, mutate } = useSWR(
        `http://localhost:3001/merchant/products?search=${search}`,
        fetcher
    );

    const handleEditPrice = (sku: any) => {
        setEditSkuId(sku.id);
        setEditPrice(sku.merchantSellingPrice);
    };

    const handleSavePrice = async (sku: any) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`http://localhost:3001/merchant/products/${sku.id}/price`, {
                sellingPrice: Number(editPrice),
                isActive: sku.isActive
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditSkuId(null);
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan harga');
        }
    };

    const handleToggleSku = async (sku: any) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`http://localhost:3001/merchant/products/${sku.id}/price`, {
                sellingPrice: sku.merchantSellingPrice,
                isActive: !sku.isActive
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah status');
        }
    };

    const handleBulkUpdate = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post(`http://localhost:3001/merchant/products/bulk-update`, {
                markupPercentage: Number(bulkPercentage)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsBulkModalOpen(false);
            mutate();
            alert('Berhasil mengatur ulang harga bulk margin!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal melakukan bulk update');
        }
    };

    const filteredProducts = products; // could filter by category activeTab locally later

    return (
        <MerchantLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Produk Toko</h1>
                <p className="text-[14px] text-slate-500 mt-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    Atur margin keuntungan dan visibilitas setiap produk di toko Anda.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama produk / layanan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[14px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[14px] font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                        <Filter className="w-4 h-4" /> Kategori
                    </button>
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[14px] rounded-xl flex items-center gap-2 shadow-md transition-all">
                        <Zap className="w-4 h-4" /> Bulk Margins
                    </button>
                </div>
            </div>

            {/* Bulk Margin Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative transform transition-all">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-600" /> Setup Bulk Margin
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Ubah harga jual semua produk / kategori secara otomatis dengan basis persentase Markup.</p>
                        </div>
                        <div className="p-6">
                            <label className="block text-[13px] font-bold text-slate-700 mb-2">Persentase Kenaikan (%)</label>
                            <input
                                type="number"
                                value={bulkPercentage}
                                onChange={(e) => setBulkPercentage(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                            />
                            <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-xl mt-4 border border-amber-100 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Tindakan ini akan menimpa seluruh harga jual kustom yang sebelumnya sudah Anda simpan per SKU.</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setIsBulkModalOpen(false)} className="px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-200 rounded-xl">Batal</button>
                            <button onClick={handleBulkUpdate} className="px-5 py-2.5 text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">Terapkan Markup</button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center"><div className="w-8 h-8 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center font-medium">Gagal memuat produk.</div>
            ) : !filteredProducts || filteredProducts.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700">Tidak Ada Produk</h3>
                    <p className="text-slate-500">Coba ubah kata kunci pencarian Anda.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredProducts.map((product: any) => (
                        <div key={product.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                                        {product.thumbnail ? (
                                            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[16px] font-black text-slate-800">{product.name}</h3>
                                        <p className="text-[12px] font-medium text-indigo-500 mt-0.5">{product.category}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-1/3">Variasi SKU</th>
                                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Harga Dasar</th>
                                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Harga Toko Anda</th>
                                            <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {product.skus.map((sku: any) => (
                                            <tr key={sku.id} className={`hover:bg-slate-50/50 transition-colors ${!sku.isActive ? 'opacity-50 grayscale' : ''}`}>
                                                <td className="px-5 py-3">
                                                    <p className="text-[13px] font-bold text-slate-800">{sku.name}</p>
                                                    <p className={`text-[11px] font-bold mt-1 inline-flex px-1.5 py-0.5 rounded ${sku.margin > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                        Margin: Rp {sku.margin.toLocaleString('id-ID')}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className="text-[13px] font-medium text-slate-500">Rp {sku.basePrice.toLocaleString('id-ID')}</span>
                                                    <p className="text-[10px] text-slate-400 tracking-wide mt-0.5">Disarankan: Rp {sku.defaultSellingPrice.toLocaleString('id-ID')}</p>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    {editSkuId === sku.id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <input
                                                                type="number"
                                                                className="w-24 text-right px-2 py-1 text-[13px] font-bold border rounded bg-indigo-50 border-indigo-200 outline-none"
                                                                value={editPrice}
                                                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleSavePrice(sku)} className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => setEditSkuId(null)} className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg">
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-3 group">
                                                            <span className="text-[14px] font-black text-indigo-700">Rp {sku.merchantSellingPrice.toLocaleString('id-ID')}</span>
                                                            <button onClick={() => handleEditPrice(sku)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={sku.isActive} onChange={() => handleToggleSku(sku)} />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MerchantLayout>
    );
}
