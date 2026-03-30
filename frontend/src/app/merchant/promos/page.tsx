"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { Tag, Plus, Trash2, Power, Search, Zap, Lock } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantPromosPage() {
    const { data: promos, mutate, error } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/merchant/promos', fetcher);
    // Tambah untuk Flash Sale Data
    const { data: flashSales, mutate: mutateFS } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/merchant/promos/flash-sales', fetcher);
    const { data: productsData } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/merchant/products', fetcher);


    const [activeTab, setActiveTab] = useState('vouchers');
    const [merchantPlan, setMerchantPlan] = useState('PRO');

    React.useEffect(() => {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setMerchantPlan(parsed.plan || 'PRO');
        }
    }, []);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [form, setForm] = useState({
        code: '',
        name: '',
        type: 'DISCOUNT_FLAT',
        discountAmount: '',
        quota: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
        forRole: 'ALL'
    });

    const [isAddFSModalOpen, setIsAddFSModalOpen] = useState(false);
    const [fsForm, setFsForm] = useState({
        name: 'Midnight Flash Sale',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        discountType: 'PERCENTAGE',
        discountValue: '20',
        selectedProduct: '',
        salePrice: ''
    });

    const handleCreatePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            const numDiscount = Number(form.discountAmount);
            const numQuota = form.quota ? Number(form.quota) : null;

            await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/merchant/promos', {
                ...form,
                discountAmount: numDiscount,
                quota: numQuota
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Promo berhasil dibuat!');
            setIsAddModalOpen(false);
            setForm({ ...form, code: '', name: '', discountAmount: '', quota: '' });
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal membuat promo');
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/merchant/promos/${id}/toggle`, { isActive: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
            mutate();
        } catch (err: any) {
            alert('Gagal ubah status promo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus promo ini secara permanen?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/merchant/promos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutate();
        } catch (err: any) {
            alert('Gagal menghapus promo');
        }
    };

    // --- FLASH SALE HANDLERS ---
    const handleCreateFS = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            const targetProduct = productsData?.find((p: any) => p.id === fsForm.selectedProduct);
            if (!targetProduct) return alert('Pilih produk dulu');

            await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/merchant/promos/flash-sales', {
                name: fsForm.name,
                startTime: new Date(fsForm.startDate).toISOString(),
                endTime: new Date(fsForm.endDate).toISOString(),
                discountType: fsForm.discountType,
                discountValue: fsForm.discountValue,
                items: [{
                    productSkuId: targetProduct.skus[0].id, // For demo, pick first SKU
                    originalPrice: targetProduct.skus[0].priceNormal,
                    salePrice: fsForm.salePrice || (targetProduct.skus[0].priceNormal * 0.8), // Custom or 20% off
                }]
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert('Flash Sale berhasil dibuat!');
            setIsAddFSModalOpen(false);
            mutateFS();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal membuat Flash Sale');
        }
    };

    const handleToggleFS = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/merchant/promos/flash-sales/${id}/toggle`, { isActive: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
            mutateFS();
        } catch (err: any) {
            alert('Gagal ubah status Flash Sale');
        }
    };

    const handleDeleteFS = async (id: string) => {
        if (!confirm('Hapus Flash Sale ini?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/merchant/promos/flash-sales/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutateFS();
        } catch (err: any) {
            alert('Gagal menghapus Flash Sale');
        }
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Promo & Voucher</h1>
                    <p className="text-slate-500 text-sm mt-1">Buat kode voucher untuk pembeli dan tingkatkan konversi penjualan Anda.</p>
                </div>

                {activeTab === 'vouchers' && (
                    <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] transition-all hover:-translate-y-0.5 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Bikin Promo Baru
                    </button>
                )}
                {activeTab === 'flashsale' && merchantPlan === 'SUPREME' && (
                    <button onClick={() => setIsAddFSModalOpen(true)} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[13px] rounded-xl shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] transition-all hover:-translate-y-0.5 flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-white" /> Bikin Flash Sale Biasa
                    </button>
                )}
            </div>

            {/* TAB MENU */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('vouchers')}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'vouchers' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Kode Voucher
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('flashsale')}
                    className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'flashsale' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Flash Sale Event
                    </div>
                </button>
            </div>

            {/* VOUCHER TAB CONTENT */}
            {activeTab === 'vouchers' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center w-full md:w-auto text-slate-800">
                        <div className="relative w-full max-w-xs">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari voucher..."
                                className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-white border-b border-slate-100">
                                    <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Kode & Nama</th>
                                    <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tipe & Nilai</th>
                                    <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Target</th>
                                    <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Kuota / Dipakai</th>
                                    <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {!promos ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Memuat...</td></tr>
                                ) : promos.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-500">
                                        <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        Belum ada kode promo.
                                    </td></tr>
                                ) : (
                                    promos.map((p: any) => (
                                        <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${!p.isActive && 'opacity-60'}`}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-sm border border-amber-200 uppercase tracking-wider">
                                                        {p.code}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">{p.name}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {p.type === 'DISCOUNT_FLAT' ? 'Diskon Rupiah' :
                                                        p.type === 'DISCOUNT_PERCENTAGE' ? 'Diskon %' : 'Cashback'}
                                                </p>
                                                <p className="text-xs font-bold text-emerald-600 mt-1">
                                                    {p.type === 'DISCOUNT_PERCENTAGE' ? `${Number(p.value)}%` : `Rp ${Number(p.value).toLocaleString('id-ID')}`}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                                                    {p.forRole === 'ALL' ? 'Semua User' : p.forRole === 'CUSTOMER' ? 'Customer Saja' : 'Reseller Saja'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-slate-700 font-bold">{p.usedCount} <span className="text-slate-400 font-normal">/ {p.quota || '∞'}</span></p>
                                            </td>
                                            <td className="p-4 flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleToggle(p.id, p.isActive)}
                                                    className={`p-2 rounded-lg transition-colors border ${p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                                                    title={p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Hapus Promo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* FLASHSALE TAB CONTENT */}
            {activeTab === 'flashsale' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {merchantPlan !== 'SUPREME' ? (
                        <div className="max-w-2xl mx-auto text-center py-16 px-8">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                                <Lock className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Eksklusif Tier SUPREME</h2>
                            <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
                                Fitur <b className="text-indigo-600">Flash Sale Countdown Real-time</b> ini dikhususkan bagi Merchant prioritas kami. Upgrade rencana Anda sekarang untuk meningkatkan fear-of-missing-out (FOMO) pembeli dan ciptakan ledakan orderan!
                            </p>
                            <button className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1">
                                🚀 Upgrade ke SUPREME Sekarang
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-slate-800">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-rose-500 fill-rose-500" /> Event Flash Sale Aktif</h3>
                                    <p className="text-sm text-slate-500 mt-1">Daftar event diskon waktu terbatas yang sedang dan akan berjalan di toko Anda.</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100">
                                            <th className="p-4 pl-6 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Nama Event</th>
                                            <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Periode Aktif</th>
                                            <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Diskon / Harga Flash</th>
                                            <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {!flashSales ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Memuat...</td></tr>
                                        ) : flashSales.length === 0 ? (
                                            <tr><td colSpan={4} className="p-12 text-center text-slate-500">
                                                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                Belum ada Flash Sale. Bikin pemicu FOMO pertamamu sekarang!
                                            </td></tr>
                                        ) : (
                                            flashSales.map((fs: any) => {
                                                const isActiveNow = fs.isActive && new Date(fs.startTime) <= new Date() && new Date(fs.endTime) >= new Date();
                                                const firstItem = fs.items?.[0] || {};
                                                
                                                return (
                                                    <tr key={fs.id} className={`hover:bg-slate-50/50 transition-colors ${!fs.isActive && 'opacity-60'}`}>
                                                        <td className="p-4 pl-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-xl ${isActiveNow ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                    <Zap className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-sm">{fs.name}</p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">Produk: {firstItem.productSku?.name || 'Semua Produk'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-xs font-bold text-slate-700">{new Date(fs.startTime).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                                            <p className="text-xs text-slate-400 mt-1">s/d {new Date(fs.endTime).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            {fs.discountType === 'PERCENTAGE' ? (
                                                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">{fs.discountValue}% OFF</span>
                                                            ) : (
                                                                <div>
                                                                    <p className="text-[10px] text-slate-500 line-through">Rp {firstItem.originalPrice?.toLocaleString('id-ID')}</p>
                                                                    <p className="text-sm font-bold text-rose-600">Rp {firstItem.salePrice?.toLocaleString('id-ID')}</p>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4 pr-6 flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => handleToggleFS(fs.id, fs.isActive)}
                                                                className={`p-2 text-xs font-bold rounded-lg transition-colors border ${fs.isActive ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                                                            >
                                                                {fs.isActive ? 'NONAKTIFKAN' : 'AKTIFKAN'}
                                                            </button>
                                                            <button onClick={() => handleDeleteFS(fs.id)} className="p-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Modal Tambah Promo */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-[500px] overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 flex justify-between items-center text-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-indigo-600" /> Bikin Promo Baru
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
                        </div>
                        <form onSubmit={handleCreatePromo} className="p-6">
                            <div className="grid grid-cols-2 gap-5 mb-5">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Kode Kupon (Tanpa Spasi)</label>
                                    <input type="text" required placeholder="MISAL: TAHUNBARU2026" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 uppercase text-slate-800" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Nama Kampanye Promo</label>
                                    <input type="text" required placeholder="Promo Spesial Liburan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Tipe Promo</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700">
                                        <option value="DISCOUNT_FLAT">Diskon Rupiah</option>
                                        <option value="DISCOUNT_PERCENTAGE">Diskon Persen (%)</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Nilai Potongan (Rp / %)</label>
                                    <input type="number" required min="1" placeholder="5000" value={form.discountAmount} onChange={e => setForm({ ...form, discountAmount: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-emerald-600 text-slate-800" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Batas Kuota (Opsional: Kosong = 無限)</label>
                                    <input type="number" placeholder="Contoh: 100" value={form.quota} onChange={e => setForm({ ...form, quota: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Target Pengguna</label>
                                    <select value={form.forRole} onChange={e => setForm({ ...form, forRole: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800">
                                        <option value="ALL">Semua Pihak</option>
                                        <option value="CUSTOMER">Customer Langsung</option>
                                        <option value="RESELLER">Khusus Reseller</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Berlaku Dari</label>
                                    <input type="datetime-local" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm text-slate-800" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Berakhir Pada</label>
                                    <input type="datetime-local" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm text-slate-800" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                                Buat Promo & Aktifkan
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Flash Sale */}
            {isAddFSModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-[500px] overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 flex justify-between items-center text-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-rose-500 fill-rose-500" /> Flash Sale Baru
                            </h3>
                            <button onClick={() => setIsAddFSModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
                        </div>
                        <form onSubmit={handleCreateFS} className="p-6">
                            <div className="grid grid-cols-2 gap-5 mb-5">
                                <div className="col-span-2">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Nama Event (+ Keterangan Opsional)</label>
                                    <input type="text" required placeholder="Contoh: Payday Flash Sale" value={fsForm.name} onChange={e => setFsForm({ ...fsForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-800" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Waktu Mulai</label>
                                    <input type="datetime-local" required value={fsForm.startDate} onChange={e => setFsForm({ ...fsForm, startDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-sm text-slate-800" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Waktu Berakhir (Countdown)</label>
                                    <input type="datetime-local" required value={fsForm.endDate} onChange={e => setFsForm({ ...fsForm, endDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-sm text-slate-800" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Pilih Produk</label>
                                    <select required value={fsForm.selectedProduct} onChange={e => setFsForm({ ...fsForm, selectedProduct: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-800">
                                        <option value="" disabled>-- Pilih Produk --</option>
                                        {productsData?.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Tipe Diskon</label>
                                    <select value={fsForm.discountType} onChange={e => setFsForm({ ...fsForm, discountType: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 text-slate-800">
                                        <option value="PERCENTAGE">Diskon Persen (%)</option>
                                        <option value="FLAT">Harga Custom / Rupiah Kasar</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">
                                        {fsForm.discountType === 'PERCENTAGE' ? 'Diskon (Misal 20%)' : 'Harga Final (Rp)'}
                                    </label>
                                    <input type="number" required placeholder={fsForm.discountType === 'PERCENTAGE' ? '20' : '85000'} value={fsForm.discountType === 'PERCENTAGE' ? fsForm.discountValue : fsForm.salePrice} onChange={e => {
                                        if (fsForm.discountType === 'PERCENTAGE') setFsForm({ ...fsForm, discountValue: e.target.value });
                                        else setFsForm({ ...fsForm, salePrice: e.target.value });
                                    }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-slate-800" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-md">
                                Jadwalkan Flash Sale
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
