"use client";
import { getApiUrl } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { 
    Users, 
    UserPlus, 
    Search, 
    MoreVertical, 
    ShieldCheck, 
    Crown, 
    Settings,
    Tag,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
} from 'lucide-react';

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
};

export default function MerchantResellersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [toastMsg, setToastMsg] = useState<{ title: string, desc: string, type: 'success' | 'error' } | null>(null);
    
    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [resellerDiscount, setResellerDiscount] = useState(0);
    const [memberForm, setMemberForm] = useState({ name: '', phone: '' });
    const [editingUser, setEditingUser] = useState<any>(null);

    // Fetching data
    const baseUrl = getApiUrl();
    const { data: users, mutate, isLoading } = useSWR(
        `${baseUrl}/merchant/members?search=${searchTerm}&role=${roleFilter}`, 
        fetcher
    );
    const { data: ranking } = useSWR(`${baseUrl}/merchant/members/ranking`, fetcher);
    const { data: currentSettings } = useSWR(`${baseUrl}/merchant/settings/general`, fetcher);

    useEffect(() => {
        if (currentSettings) {
            const discount = currentSettings.find((s: any) => s.key === 'RESELLER_DISCOUNT');
            if (discount) setResellerDiscount(parseInt(discount.value) || 0);
        }
    }, [currentSettings]);

    const showToast = (title: string, desc: string, type: 'success' | 'error' = 'success') => {
        setToastMsg({ title, desc, type });
        setTimeout(() => setToastMsg(null), 3000);
    }

    const handleToggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'RESELLER' ? 'CUSTOMER' : 'RESELLER';
        const action = newRole === 'RESELLER' ? 'Upgrade ke Reseller' : 'Downgrade ke Member';
        
        if (!confirm(`Konfirmasi ${action}?`)) return;

        try {
            await axios.patch(`${baseUrl}/merchant/members/${userId}/role`, 
                { role: newRole },
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            mutate();
            showToast('Berhasil', `Status member berhasil diubah menjadi ${newRole}`);
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Gagal mengubah status', 'error');
        }
    };

    const handleSaveDiscount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`${baseUrl}/merchant/settings/general`, 
                [{ key: 'RESELLER_DISCOUNT', value: resellerDiscount.toString() }],
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            showToast('Berhasil', 'Potongan harga reseller berhasil diperbarui.');
            setShowPriceModal(false);
        } catch (err: any) {
            showToast('Gagal', 'Gagal menyimpan pengaturan', 'error');
        }
    };

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${baseUrl}/merchant/members`, 
                memberForm,
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            mutate();
            showToast('Berhasil', 'Member baru berhasil ditambahkan.');
            setShowCreateModal(false);
            setMemberForm({ name: '', phone: '' });
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Gagal menambahkan member', 'error');
        }
    };

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            await axios.put(`${baseUrl}/merchant/members/${editingUser.id}`, 
                memberForm,
                { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
            );
            mutate();
            showToast('Berhasil', 'Data member berhasil diperbarui.');
            setShowEditModal(false);
            setEditingUser(null);
            setMemberForm({ name: '', phone: '' });
        } catch (err: any) {
            showToast('Gagal', err.response?.data?.message || 'Gagal memperbarui member', 'error');
        }
    };

    return (
        <MerchantLayout>
            {toastMsg && (
                <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-top-4">
                    <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <div>
                            <p className="font-black text-sm">{toastMsg.title}</p>
                            <p className="text-xs opacity-80">{toastMsg.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen <span className="text-indigo-600">Member & Reseller</span></h1>
                    <p className="text-[14px] text-slate-500 font-medium mt-1">Daftarkan nomor WA member untuk mendapatkan harga khusus reseller secara otomatis.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="h-[46px] px-6 bg-indigo-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <UserPlus className="w-4.5 h-4.5" />
                        DAFTARKAN MEMBER
                    </button>
                </div>
            </div>

            {/* TOP STATS / RANKING */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-[32px] border-2 border-slate-50 p-7 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <Crown className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-slate-800 text-lg">Top 5 Reseller Teraktif</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {ranking?.map((res: any, idx: number) => (
                            <div key={res.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{res.name}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{res.totalTrx} Transaksi</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600">Rp {res.totalOmset.toLocaleString('id-ID')}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">OMSET TOTAL</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-[32px] p-7 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10">
                        <div className="p-3 bg-white/20 w-fit rounded-2xl mb-6">
                            <Tag className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black leading-tight mb-2">Reseller Pricing Override</h3>
                        <p className="text-xs text-indigo-100 font-medium leading-relaxed opacity-80">
                            Potongan saat ini: <span className="font-bold text-white bg-indigo-500/50 px-2 py-0.5 rounded-lg border border-white/20 ml-1">Rp {resellerDiscount.toLocaleString('id-ID')}</span>
                        </p>
                        <p className="text-[11px] text-indigo-100/70 font-medium mt-3 leading-relaxed">
                            Reseller otomatis dapat harga Rp {resellerDiscount.toLocaleString('id-ID')} lebih murah di setiap produk.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowPriceModal(true)}
                        className="mt-8 py-4 bg-white text-indigo-600 font-black text-sm rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] shadow-lg"
                    >
                        ATUR HARGA KHUSUS
                    </button>
                </div>
            </div>

            {/* MAIN LIST */}
            <div className="bg-white border-2 border-slate-50 shadow-2xl shadow-slate-200/20 rounded-[32px] overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Cari Member/Reseller..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none pl-5 pr-10 py-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-[13px] font-black text-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer transition-all"
                        >
                            <option value="">SEMUA ROLE</option>
                            <option value="CUSTOMER">MEMBER BIASA</option>
                            <option value="RESELLER">RESELLER RESMI</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] leading-none">
                                <th className="px-8 py-5">Identitas Member</th>
                                <th className="px-8 py-5">Role / Level</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center opacity-30">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-black">Memuat data...</p>
                                    </td>
                                </tr>
                            ) : users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-indigo-50/20 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-white border-2 border-slate-50 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-black text-slate-800 leading-tight">{user.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] font-medium text-slate-400 uppercase">{user.phone || user.email}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                    <span className="text-[10px] font-bold text-slate-400">Total Trx: {user._count?.ordersAsCustomer || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {user.role === 'RESELLER' ? (
                                            <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-black border border-indigo-100 flex items-center gap-1.5 w-fit">
                                                <ShieldCheck className="w-3.5 h-3.5" /> RESELLER
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 text-[11px] font-black border border-slate-100 flex items-center gap-1.5 w-fit">
                                                MEMBER
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-400 shadow-red-100'} shadow-lg`}></div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setMemberForm({ name: user.name, phone: user.phone });
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2.5 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all"
                                                title="Edit Data Member"
                                            >
                                                <Settings className="w-4.5 h-4.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleRole(user.id, user.role)}
                                                className={`p-2.5 rounded-xl transition-all ${user.role === 'RESELLER' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                                title={user.role === 'RESELLER' ? "Downgrade ke Member" : "Upgrade ke Reseller"}
                                            >
                                                {user.role === 'RESELLER' ? <Crown className="w-4.5 h-4.5" /> : <UserPlus className="w-4.5 h-4.5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Member Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight">Edit <span className="text-indigo-600">Member</span></h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">ID: {editingUser?.id.substring(0,8)}... (History Aman)</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateMember} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Nama Member</label>
                                <input 
                                    type="text" required
                                    value={memberForm.name}
                                    onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Nomor WhatsApp</label>
                                <input 
                                    type="text" required
                                    value={memberForm.phone}
                                    onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                />
                                <p className="text-[10px] text-amber-600 font-bold mt-2 italic px-1">
                                    * Mengubah nomor WA tidak menghapus riwayat transaksi member ini.
                                </p>
                            </div>

                            <button type="submit" className="w-full h-14 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">
                                SIMPAN PERUBAHAN
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Create Member Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight">Daftarkan <span className="text-indigo-600">Member Manual</span></h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">Input data nomor WA pembeli</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateMember} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Nama Member</label>
                                <input 
                                    type="text" required
                                    value={memberForm.name}
                                    onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                    placeholder="Contoh: Budi MLBB"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Nomor WhatsApp</label>
                                <input 
                                    type="text" required
                                    value={memberForm.phone}
                                    onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                    placeholder="08123456789"
                                />
                            </div>

                            <button type="submit" className="w-full h-14 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">
                                SIMPAN MEMBER BARU
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Price Override Modal */}
            {showPriceModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <Tag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 tracking-tight">Atur Diskon <span className="text-indigo-600">Reseller</span></h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">Berlaku untuk semua Reseller Toko</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPriceModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveDiscount} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Nominal Potongan (IDR)</label>
                                <div className="relative">
                                    <input 
                                        type="number" required
                                        value={resellerDiscount}
                                        onChange={e => setResellerDiscount(parseInt(e.target.value) || 0)}
                                        className="w-full h-14 pl-6 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold italic mt-2 leading-relaxed">
                                    * Harga jual otomatis dikurangi Rp {resellerDiscount.toLocaleString('id-ID')} khusus untuk Reseller terverifikasi.
                                </p>
                            </div>

                            <button type="submit" className="w-full h-14 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">
                                SIMPAN PERUBAHAN HARGA
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
