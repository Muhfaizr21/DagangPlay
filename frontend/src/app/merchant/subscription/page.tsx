"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { CreditCard, CheckCircle, Clock, Search, Zap, Check, ArrowRight, Shield, Download } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantSubscriptionPage() {
    const { data: status, mutate: mutateStatus } = useSWR('http://localhost:3001/merchant/subscription', fetcher);
    const { data: invoices, mutate: mutateInvoices } = useSWR('http://localhost:3001/merchant/subscription/invoices', fetcher);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [proofUrl, setProofUrl] = useState('');

    const handleCreateInvoice = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            // Assuming default upgrade to PRO plan
            await axios.post('http://localhost:3001/merchant/subscription/invoices', { plan: 'PRO', amount: 250000 }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Tagihan pembayaran berhasil dibuat!');
            mutateStatus();
            mutateInvoices();
        } catch (err: any) {
            alert('Gagal membuat tagihan');
        }
    };

    const handleUploadProof = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`http://localhost:3001/merchant/subscription/invoices/${selectedInvoice.id}/proof`, { proofUrl }, { headers: { Authorization: `Bearer ${token}` } });
            alert('Bukti transfer berhasil diupload. Harap tunggu konfirmasi admin.');
            setIsUploadModalOpen(false);
            setProofUrl('');
            mutateInvoices();
        } catch (err: any) {
            alert('Gagal mengupload bukti transfer');
        }
    };

    return (
        <MerchantLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Subscription & Billing</h1>
                <p className="text-slate-500 text-sm mt-1">Kelola paket langganan DagangPlay Anda dan riwayat penagihan.</p>
            </div>

            {!status ? (
                <div className="py-20 text-center text-slate-500">Memuat status langganan...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Plan */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl w-fit">
                                    {status.plan === 'VIP' ? <Shield className="w-6 h-6 text-yellow-300" /> : <Zap className="w-6 h-6 text-white" />}
                                </div>
                                {status.isActive ? (
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-500/30">Aktif</span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider rounded border border-red-500/30">Expired</span>
                                )}
                            </div>

                            <p className="text-indigo-200 text-xs font-bold mt-6 uppercase tracking-wider">Plan Langganan</p>
                            <h2 className="text-3xl font-black mt-1 uppercase">{status.plan} PACKAGE</h2>

                            {status.planExpiredAt ? (
                                <p className="text-sm mt-4 text-indigo-100/80">Valid hingga: <b className="text-white">{new Date(status.planExpiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</b></p>
                            ) : (
                                <p className="text-sm mt-4 text-indigo-100/80">Belum ada paket aktif.</p>
                            )}

                            <button onClick={handleCreateInvoice} className="mt-8 w-full py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-md flex items-center justify-center gap-2">
                                Beli / Perpanjang Paket <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Plan Features */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Fitur {status.plan}</h3>
                            <ul className="space-y-3">
                                {['Bebas pilih ratusan produk Digiflazz', 'Markup harga per target user', 'Gratis Custom Domain', 'Hingga 500 Reseller Aktif'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <div className="p-0.5 bg-emerald-50 text-emerald-500 rounded mt-0.5"><Check className="w-3 h-3" /></div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                                <a href="#" className="text-indigo-600 font-bold text-sm hover:underline">Lihat perbandingan semua paket</a>
                            </div>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-slate-400" /> Riwayat Penagihan (Invoice)
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100">
                                            <th className="p-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Invoice ID / Tanggal</th>
                                            <th className="p-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Item & Nominal</th>
                                            <th className="p-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                            <th className="p-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {!invoices ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-sm">Memuat data...</td></tr>
                                        ) : invoices.length === 0 ? (
                                            <tr><td colSpan={4} className="p-12 text-center text-slate-400">Belum ada riwayat tagihan.</td></tr>
                                        ) : (
                                            invoices.map((inv: any) => (
                                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-bold text-slate-700">{inv.invoiceNo}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{new Date(inv.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-slate-700 text-sm">Paket {inv.plan}</p>
                                                        <p className="text-xs font-medium text-emerald-600 mt-1">Rp {Number(inv.totalAmount).toLocaleString('id-ID')}</p>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {inv.status === 'PAID' ? (
                                                            <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-lg uppercase tracking-wider"><CheckCircle className="w-3 h-3 inline mr-1" /> PAID</span>
                                                        ) : inv.status === 'PENDING' ? (
                                                            <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold rounded-lg uppercase tracking-wider"><Clock className="w-3 h-3 inline mr-1" /> DIPROSES</span>
                                                        ) : (
                                                            <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-lg uppercase tracking-wider">BELUM BAYAR</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 flex gap-2 justify-end">
                                                        <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors" title="Download PDF">
                                                            <Download className="w-4 h-4" />
                                                        </button>

                                                        {inv.status === 'UNPAID' && (
                                                            <button
                                                                onClick={() => { setSelectedInvoice(inv); setIsUploadModalOpen(true); }}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                                                            >
                                                                Upload Bukti
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Bukti Modal */}
            {isUploadModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-[400px] overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Upload Bukti Bayar</h3>
                            <button onClick={() => { setIsUploadModalOpen(false); setSelectedInvoice(null); }} className="text-slate-400 hover:text-slate-600 text-xl font-light">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                <p className="text-xs text-slate-500 mb-1">Total Tagihan:</p>
                                <p className="text-xl font-black text-slate-800">Rp {Number(selectedInvoice.totalAmount).toLocaleString('id-ID')}</p>
                                <p className="text-xs font-bold text-slate-600 mt-2 bg-white px-2 py-1 rounded inline-block border border-slate-200">ID: {selectedInvoice.invoiceNo}</p>
                            </div>
                            <form onSubmit={handleUploadProof}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">URL Bukti Transfer (Image Link)</label>
                                        <input type="url" required value={proofUrl} onChange={e => setProofUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                                    </div>
                                    <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                                        Kirim untuk Verifikasi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </MerchantLayout>
    );
}
