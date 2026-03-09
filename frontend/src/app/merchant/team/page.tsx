"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { Users, UserPlus, Trash2, Edit3, Shield, Mail, Phone, Lock } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantTeamPage() {
    const { data: teamMembers, mutate } = useSWR('http://localhost:3001/merchant/team', fetcher);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', role: 'MEMBER'
    });

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.post('http://localhost:3001/merchant/team', form, { headers: { Authorization: `Bearer ${token}` } });
            alert('Staff berhasil ditambahkan!');
            setIsAddModalOpen(false);
            setForm({ name: '', email: '', phone: '', password: '', role: 'MEMBER' });
            mutate();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menambahkan staff');
        }
    };

    const handleRemoveMember = async (id: string) => {
        if (!confirm('Hapus akses staff ini ke toko Anda?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`http://localhost:3001/merchant/team/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            mutate();
        } catch (err) {
            alert('Gagal menghapus staff');
        }
    };

    return (
        <MerchantLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Tim Toko</h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola staf admin dan kasir yang memiliki akses ke toko Anda.</p>
                </div>

                <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] transition-all hover:-translate-y-0.5 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Tambah Staff
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500" /> Daftar Anggota Tim Aktif</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Nama Staf</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Kontak</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Peran & Akses</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Bergabung</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {!teamMembers ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : teamMembers.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-500"><Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />Belum ada anggota tim lain selain Anda.</td></tr>
                            ) : (
                                teamMembers.map((member: any) => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                    {member.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{member.user.name}</p>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase mt-1 block w-fit">ID: {member.id.substring(member.id.length - 6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs text-slate-600 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {member.user.email}</p>
                                            {member.user.phone && <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1"><Phone className="w-3 h-3 text-slate-400" /> {member.user.phone}</p>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 flex w-fit items-center gap-1 rounded text-xs font-bold ${member.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                                <Shield className="w-3 h-3" /> {member.role === 'ADMIN' ? 'Administrator' : 'Staf Operasional'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-medium text-slate-600">{new Date(member.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </td>
                                        <td className="p-4 flex gap-2 justify-end items-center">
                                            <button className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-colors" title="Edit Akses">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleRemoveMember(member.id)} className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg transition-colors" title="Bongkar Akses">
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

            {/* Modal Add Member */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-[450px] overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 pr-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
                                    <UserPlus className="w-5 h-5 text-indigo-600" /> Tambah Anggota Tim
                                </h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-light">&times;</button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Daftarkan akun staf baru untuk membantu mengelola toko Anda.</p>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Nama Lengkap</label>
                                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="Ahmad Kasir" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Email Staff</label>
                                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="ahmad@toko.com" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">No. WhatsApp</label>
                                        <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="62812..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2 flex items-center gap-1.5"><Lock className="w-3 h-3" /> Password Akun</label>
                                    <input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="Minimal 6 karakter" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Pilih Wewenang Akses (Role)</label>
                                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700">
                                        <option value="MEMBER">Staf Operasional Terbatas</option>
                                        <option value="ADMIN">Admin Penuh (Spt Owner)</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-2">*Staf terbatas tidak bisa akses keuangan dan penarikan saldo.</p>
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                                Daftarkan Staff
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
