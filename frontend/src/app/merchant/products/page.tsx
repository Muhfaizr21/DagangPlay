"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Package, Search, Filter, Pencil, Check, X, AlertTriangle, Layers, Zap, Lock, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

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
    const [merchantPlan, setMerchantPlan] = useState('PRO');
    const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
    const [isCustomizingProduct, setIsCustomizingProduct] = useState<any>(null);
    const [customName, setCustomName] = useState('');
    const [customThumbnail, setCustomThumbnail] = useState('');

    React.useEffect(() => {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setMerchantPlan(parsed.plan || 'PRO');
        }
    }, []);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: products, error, isLoading, mutate } = useSWR(
        `${baseUrl}/merchant/products?search=${search}`,
        fetcher
    );

    const [bulkMode, setBulkMode] = useState<'PERCENT' | 'FIXED'>('PERCENT');
    const [bulkAmount, setBulkAmount] = useState<number>(0);

    const handleEditPrice = (sku: any) => {
        setEditSkuId(sku.id);
        setEditPrice(sku.merchantSellingPrice);
    };

    const handleSavePrice = async (sku: any) => {
        if (Number(editPrice) < sku.basePrice) {
            alert(`Harga jual tidak boleh lebih rendah dari harga modal (Rp ${sku.basePrice.toLocaleString('id-ID')})`);
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            await axios.put(`${baseUrl}/merchant/products/${sku.id}/price`, {
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
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            await axios.put(`${baseUrl}/merchant/products/${sku.id}/price`, {
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
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            await axios.post(`${baseUrl}/merchant/products/bulk-update`, {
                markupPercentage: bulkMode === 'PERCENT' ? Number(bulkPercentage) : 0,
                markupAmount: bulkMode === 'FIXED' ? Number(bulkAmount) : 0
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

    const toggleProduct = (id: string) => {
        setExpandedProducts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
    const handleSaveMetadata = async () => {
        if (!isCustomizingProduct) return;

        try {
            const token = localStorage.getItem('admin_token');
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            await axios.put(`${baseUrl}/merchant/products/${isCustomizingProduct.id}/metadata`, {
                customName: customName || undefined,
                customThumbnail: customThumbnail || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsCustomizingProduct(null);
            mutate();
            alert('Berhasil menyimpan kustomisasi produk!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan kustomisasi');
        }
    };

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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative transform transition-all">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-600" /> Setup Bulk Margin
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Ubah harga jual masal secara otomatis berdasarkan markup modal.</p>
                        </div>
                        <div className="p-6">
                            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                                <button 
                                    onClick={() => setBulkMode('PERCENT')}
                                    className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${bulkMode === 'PERCENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Persentase (%)
                                </button>
                                <button 
                                    onClick={() => setBulkMode('FIXED')}
                                    className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${bulkMode === 'FIXED' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Nominal Rupiah (Rp)
                                </button>
                            </div>

                            {bulkMode === 'PERCENT' ? (
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 underline decoration-indigo-200 underline-offset-4">Persentase Kenaikan (%)</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={bulkPercentage}
                                            onChange={(e) => setBulkPercentage(Number(e.target.value))}
                                            className="w-full pl-4 pr-12 py-3 bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-2xl outline-none font-black text-xl text-slate-800 transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xl text-slate-300">%</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Contoh: 10% dari modal Rp 10.000 = Harga Jual Rp 11.000</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 underline decoration-indigo-200 underline-offset-4">Markup Nominal (Rp)</label>
                                    <div className="relative mt-1">
                                         <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-slate-300">Rp</span>
                                         <input
                                            type="number"
                                            value={bulkAmount}
                                            onChange={(e) => setBulkAmount(Number(e.target.value))}
                                            className="w-full pl-14 pr-4 py-3 bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-2xl outline-none font-black text-xl text-slate-800 transition-all"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Contoh: Rp 2.000 + modal Rp 10.000 = Harga Jual Rp 12.000</p>
                                </div>
                            )}

                            <div className="bg-amber-50 text-amber-700 text-[11px] p-4 rounded-2xl mt-6 border border-amber-100 flex items-start gap-3 leading-relaxed">
                                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                                <p className="font-medium">Tindakan ini akan menimpa seluruh harga kustom per SKU yang sudah Anda atur secara manual sebelumnya. Pastikan angka sudah benar.</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setIsBulkModalOpen(false)} className="px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                            <button onClick={handleBulkUpdate} className="px-6 py-2.5 text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
                                Update Semua Harga
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Customization Modal */}
            {isCustomizingProduct && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative transform transition-all">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-indigo-600" /> Kustomisasi {isCustomizingProduct.name}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Ubah tampilan produk khusus di website toko Anda.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-2">Nama Produk Kustom</label>
                                <input
                                    type="text"
                                    placeholder={isCustomizingProduct.name}
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 shadow-sm"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Kosongkan jika ingin menggunakan nama asli.</p>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-slate-700 mb-2">URL Thumbnail Kustom</label>
                                <input
                                    type="text"
                                    placeholder={isCustomizingProduct.thumbnail}
                                    value={customThumbnail}
                                    onChange={(e) => setCustomThumbnail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 shadow-sm"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Gunakan URL gambar (JPG/PNG/WEBP). Kosongkan untuk default.</p>
                            </div>
                            {customThumbnail && (
                                <div className="mt-2 text-center">
                                    <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Preview Gambar Baru:</p>
                                    <img src={customThumbnail} alt="Preview" className="w-24 h-24 object-cover mx-auto rounded-2xl border-2 border-indigo-100 shadow-sm" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setIsCustomizingProduct(null)} className="px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-200 rounded-xl">Batal</button>
                            <button onClick={handleSaveMetadata} className="px-5 py-2.5 text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">Simpan Kustomisasi</button>
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
                            <div
                                className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => toggleProduct(product.id)}
                            >
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
                                        <p className="text-[12px] font-medium text-indigo-500 mt-0.5">{product.category} • {product.skus.length} SKU</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (merchantPlan === 'FREE' && !product.isOfficial) {
                                                alert('Upgrade ke PRO/SUPREME untuk kustomisasi detail produk.');
                                            } else {
                                                setIsCustomizingProduct(product);
                                                setCustomName(product.customName || '');
                                                setCustomThumbnail(product.customThumbnail || '');
                                            }
                                        }}
                                        className="px-3 py-1.5 flex items-center gap-2 text-[12px] font-bold rounded-lg transition-colors border shadow-sm bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                                    >
                                        <Settings2 className="w-3.5 h-3.5" />
                                        Kustomisasi Detail
                                        {merchantPlan === 'FREE' && <Lock className="w-3 h-3 text-red-500 ml-1" />}
                                    </button>
                                    <div className="p-2 text-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        {expandedProducts[product.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>

                            {expandedProducts[product.id] && (
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
                            )}
                        </div>
                    ))}
                </div>
            )}
        </MerchantLayout>
    );
}
