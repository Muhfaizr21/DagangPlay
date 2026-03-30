"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    Plus,
    Search,
    Tag,
    Calendar,
    Users,
    Percent,
    Banknote,
    Hash,
    MoreVertical,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    ArrowRight,
    X,
    Clock,
    Ticket
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.data);
};

export default function PromoManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);
    const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'PERCENTAGE',
        value: 0,
        maxDiscount: 0,
        minPurchase: 0,
        quota: 0,
        startDate: '',
        endDate: '',
        appliesTo: 'ALL',
        forRole: 'ALL',
        isActive: true
    });

    const { data: promos, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/promos?search=${searchTerm}`,
        fetcher
    );

    const { data: report } = useSWR((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/promos/report', fetcher);

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleToggle = async (id: string) => {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/promos/${id}/toggle`);
            mutate();
            showToast('Berhasil', 'Status promo diperbarui');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus promo ini?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/promos/${id}`);
            mutate();
            showToast('Terhapus', 'Promo berhasil dihapus');
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPromo) {
                await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/admin/promos/${editingPromo.id}`, formData);
                showToast('Update Sukses', 'Data promo telah diperbarui');
            } else {
                await axios.post((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/admin/promos', formData);
                showToast('Berhasil', 'Promo baru telah dibuat');
            }
            setShowModal(false);
            setEditingPromo(null);
            mutate();
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Error saving promo', 'error');
        }
    };

    const openCreateModal = () => {
        setEditingPromo(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            type: 'PERCENTAGE',
            value: 0,
            maxDiscount: 0,
            minPurchase: 0,
            quota: 0,
            startDate: '',
            endDate: '',
            appliesTo: 'ALL',
            forRole: 'ALL',
            isActive: true
        });
        setShowModal(true);
    };

    const openEditModal = (promo: any) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            name: promo.name,
            description: promo.description || '',
            type: promo.type,
            value: Number(promo.value),
            maxDiscount: Number(promo.maxDiscount || 0),
            minPurchase: Number(promo.minPurchase || 0),
            quota: Number(promo.quota || 0),
            startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
            endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
            appliesTo: promo.appliesTo,
            forRole: promo.forRole,
            isActive: promo.isActive
        });
        setShowModal(true);
    };

    return (
        <AdminLayout>
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
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Promo & Diskon</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Buat kode promo global atau khusus merchant untuk meningkatkan transaksi.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="h-[42px] px-5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-5 h-5" /> Buat Promo Baru
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Penggunaan</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{report?.totalTimesUsed || 0} Kali</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Efektivitas Diskon</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">Rp {report?.totalDiscountGiven?.toLocaleString('id-ID') || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <Tag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Promo Terpopuler</p>
                    <p className="text-lg font-bold text-slate-800 mt-1 truncate">{report?.topPromos?.[0]?.code || 'N/A'}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kode atau nama promo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                    <th className="px-6 py-4">Kode / Nama</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4">Target</th>
                                    <th className="px-6 py-4">Kuota / Terpakai</th>
                                    <th className="px-6 py-4">Periode</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {promos?.map((promo: any) => (
                                    <tr key={promo.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                                    {promo.type === 'PERCENTAGE' ? '%' : 'Rp'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-[14px]">{promo.code}</p>
                                                    <p className="text-[11px] text-slate-500 line-clamp-1">{promo.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-700 text-[13px]">
                                                {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `Rp ${Number(promo.value).toLocaleString()}`}
                                            </p>
                                            {promo.maxDiscount && <p className="text-[10px] text-slate-400 mt-0.5">Maks: Rp {Number(promo.maxDiscount).toLocaleString()}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] inline-flex items-center w-fit px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 uppercase tracking-tighter">
                                                    {promo.merchant ? 'Khusus Merchant' : 'Global (Platform)'}
                                                </span>
                                                <span className="text-[10px] inline-flex items-center w-fit px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200 uppercase tracking-tighter">
                                                    Role: {promo.forRole}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: promo.quota ? `${(promo.usedCount / promo.quota) * 100}%` : '0%' }}
                                                />
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-600">
                                                {promo.usedCount} <span className="text-slate-400">/ {promo.quota || '∞'}</span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-[11px] font-medium uppercase tracking-tight">
                                                    {promo.startDate ? new Date(promo.startDate).toLocaleDateString('id-ID') : 'Start'}
                                                    <ArrowRight className="w-3 h-3 inline mx-1 opacity-50" />
                                                    {promo.endDate ? new Date(promo.endDate).toLocaleDateString('id-ID') : 'End'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleToggle(promo.id)} className="transition-transform active:scale-90">
                                                {promo.isActive ? (
                                                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                                                ) : (
                                                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(promo)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                >
                                                    <Plus className="w-4 h-4 rotate-45" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {promos?.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Ticket className="w-12 h-12 text-slate-200 mb-4" />
                                                <p className="text-slate-400 font-medium">Belum ada promo yang dibuat.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                    {editingPromo ? `Edit Promo: ${editingPromo.code}` : 'Buat Promo Baru'}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">Lengkapi parameter promo di bawah ini dengan benar.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[50vh] overflow-y-auto px-1 scrollbar-hide mb-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest border-b border-indigo-50 pb-2">Identitas Promo</h4>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">KODE PROMO (CAPITAL)</label>
                                        <input
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                            placeholder="DPPROMO2024"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nama Promo (Internal)</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                            placeholder="Diskon Akhir Tahun"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">TIPE DISKON</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'PERCENTAGE' })}
                                                className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-2 ${formData.type === 'PERCENTAGE' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <Percent className="w-3 h-3" /> Persentase
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'FIXED' })}
                                                className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-2 ${formData.type === 'FIXED' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <Banknote className="w-3 h-3" /> Flat (Rp)
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Value</label>
                                            <input
                                                required
                                                type="number"
                                                value={formData.value}
                                                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Maks Diskon</label>
                                            <input
                                                type="number"
                                                value={formData.maxDiscount}
                                                onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                                placeholder="0 = ∞"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Availability & Targeting */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-orange-500 uppercase tracking-widest border-b border-orange-50 pb-2">Target & Kuota</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Target User</label>
                                            <select
                                                value={formData.forRole}
                                                onChange={(e) => setFormData({ ...formData, forRole: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                                            >
                                                <option value="ALL">Semua User</option>
                                                <option value="CUSTOMER">Customer Saja</option>
                                                <option value="RESELLER">Reseller Saja</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Kebutuhan Kuota</label>
                                            <input
                                                type="number"
                                                value={formData.quota}
                                                onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                                                placeholder="Total Pemakaian"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Min Pembelian (Rp)</label>
                                        <input
                                            type="number"
                                            value={formData.minPurchase}
                                            onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Tanggal Mulai</label>
                                            <input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Tanggal Berakhir</label>
                                            <input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-3 bg-indigo-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition"
                                >
                                    {editingPromo ? 'Simpan Perubahan' : 'Luncurkan Promo Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
