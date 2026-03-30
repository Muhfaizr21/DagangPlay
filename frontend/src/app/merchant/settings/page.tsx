"use client";

import React, { useState } from 'react';
import MerchantLayout from '../../../components/merchant/MerchantLayout';
import useSWR from 'swr';
import axios from 'axios';
import { Settings, Globe, CreditCard, Webhook, Save, ShieldAlert, BarChart2, Lock, Activity, Zap } from 'lucide-react';

const fetcher = (url: string) => {
    const token = localStorage.getItem('admin_token');
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

function MarkupSettings({ baseUrl }: { baseUrl: string }) {
    const { data: general, mutate: mutateGeneral } = useSWR(`${baseUrl}/merchant/settings/general`, fetcher);
    const [markup, setMarkup] = useState('0');
    const [resellerDiscount, setResellerDiscount] = useState('0');
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        if (general) {
            const m = general.find((s: any) => s.key === 'MARKUP_PERCENTAGE');
            if (m) setMarkup(m.value);
            const r = general.find((s: any) => s.key === 'RESELLER_DISCOUNT');
            if (r) setResellerDiscount(r.value);
        }
    }, [general]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/settings/general`, [
                { key: 'MARKUP_PERCENTAGE', value: markup },
                { key: 'RESELLER_DISCOUNT', value: resellerDiscount }
            ], { headers: { Authorization: `Bearer ${token}` } });
            alert('Markup otomatis berhasil diperbarui!');
            mutateGeneral();
        } catch (err) {
            alert('Gagal menyimpan markup');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Markup Otomatis (Anti-Loss 2.0)
            </h3>
            <div className="mb-6 mt-4 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                <p className="text-sm text-amber-800 leading-relaxed">
                    Fitur ini akan secara otomatis memperbarui harga jual Anda setiap kali harga modal dari supplier naik/turun. 
                    Sistem akan menjaga keuntungan Anda tetap stabil berdasarkan persentase yang Anda tentukan.
                </p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Target Profit (%)</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={markup} 
                            onChange={e => setMarkup(e.target.value)} 
                            className="w-32 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-lg text-slate-800" 
                        />
                        <span className="text-slate-500 font-bold">% dari Modal Supplier</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                    <label className="block text-[12px] font-black text-indigo-600 mb-2 uppercase tracking-wider">Potongan Harga Reseller (IDR)</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={resellerDiscount} 
                            onChange={e => setResellerDiscount(e.target.value)} 
                            className="w-32 px-4 py-3 bg-indigo-50/30 rounded-xl border border-indigo-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-lg text-indigo-700" 
                        />
                        <span className="text-slate-500 font-bold">Rupiah (Flat per Item)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 italic">*Contoh: Jika diatur 500, maka setiap item yang dibeli User "RESELLER" akan otomatis lebih murah Rp 500 dari harga umum.</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? 'Menyimpan...' : 'Aktifkan Markup Otomatis'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MerchantSettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    // Data Fetching
    const { data: settings, mutate: mutateSettings } = useSWR(`${baseUrl}/merchant/settings`, fetcher);
    // const { data: channels, mutate: mutateChannels } = useSWR(`${baseUrl}/merchant/settings/payment-channels`, fetcher);
    // const { data: webhooks, mutate: mutateWebhooks } = useSWR(`${baseUrl}/merchant/settings/webhooks`, fetcher);

    // Form States
    const [profileForm, setProfileForm] = useState({ name: '', tagline: '', description: '', contactEmail: '', contactPhone: '', contactWhatsapp: '', address: '', logo: '', bannerImage: '' });
    const [domainForm, setDomainForm] = useState({ domain: '' });
    const [seoForm, setSeoForm] = useState({ googleAnalytics: '', facebookPixel: '', tiktokPixel: '' });

    // Merchant Plan
    const [merchantPlan, setMerchantPlan] = useState('PRO');

    // Populate on load
    React.useEffect(() => {
        const userData = localStorage.getItem('admin_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setMerchantPlan(parsed.plan || 'PRO');
        }

        if (settings) {
            setProfileForm({
                name: settings.name || '',
                tagline: settings.tagline || '',
                description: settings.description || '',
                contactEmail: settings.contactEmail || '',
                contactPhone: settings.contactPhone || '',
                contactWhatsapp: settings.contactWhatsapp || '',
                address: settings.address || '',
                logo: settings.logo || '',
                bannerImage: settings.bannerImage || '',
            });
            setDomainForm({ domain: settings.domain || '' });
            setSeoForm({ googleAnalytics: settings.googleAnalytics || '', facebookPixel: settings.facebookPixel || '', tiktokPixel: settings.tiktokPixel || '' });
        }
    }, [settings]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/settings/profile`, profileForm, { headers: { Authorization: `Bearer ${token}` } });
            alert('Profil berhasil diperbarui!');
            mutateSettings();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan profil');
        }
    };

    const handleSaveDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${baseUrl}/merchant/settings/domain`, domainForm, { headers: { Authorization: `Bearer ${token}` } });
            alert('Domain berhasil diperbarui! Pastikan Anda sudah setting CNAME/A Record di DNS provider Anda.');
            mutateSettings();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan domain');
        }
    };

    const handleSaveSeo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            // Assuming endpoint exists or will exist
            // await axios.put((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/merchant/settings/seo', seoForm, { headers: { Authorization: `Bearer ${token}` } });
            alert('Pengaturan SEO & Pixel berhasil disimpan! (Mockup)');
        } catch (err: any) {
            alert('Gagal menyimpan pengaturan SEO & Pixel');
        }
    };

    return (
        <MerchantLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Pengaturan Toko</h1>
                <p className="text-slate-500 text-sm mt-1">Atur profil, domain, pembayaran, dan integrasi webhook toko Anda.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col gap-1">
                        <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Settings className="w-4 h-4" /> Profil & Kontak
                        </button>
                        <button onClick={() => window.location.href='/merchant/settings/domain'} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'domain' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Globe className="w-4 h-4" /> Custom Domain
                        </button>
                        <button onClick={() => setActiveTab('payment')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'payment' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <CreditCard className="w-4 h-4" /> Metode Pembayaran
                        </button>
                        <button onClick={() => setActiveTab('seo')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'seo' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <BarChart2 className="w-4 h-4" /> SEO & Meta Pixel
                        </button>
                        <button onClick={() => setActiveTab('webhook')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'webhook' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Webhook className="w-4 h-4" /> Webhook & API
                        </button>
                        <button onClick={() => setActiveTab('markup')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'markup' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <Activity className="w-4 h-4" /> Markup Otomatis
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow">
                    {/* ... (existing tabs) */}
                    
                    {/* Markup Otomatis */}
                    {activeTab === 'markup' && <MarkupSettings baseUrl={baseUrl} />}
                    
                    {/* Profil & Kontak */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Profil Bisnis & Kontak</h3>
                            <form onSubmit={handleSaveProfile} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Nama Toko</label>
                                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">URL Logo Toko</label>
                                        <input type="url" placeholder="https://..." value={profileForm.logo} onChange={e => setProfileForm({ ...profileForm, logo: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">URL Banner Toko</label>
                                        <input type="url" placeholder="https://..." value={profileForm.bannerImage} onChange={e => setProfileForm({ ...profileForm, bannerImage: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Tagline (Opsional)</label>
                                        <input type="text" value={profileForm.tagline} onChange={e => setProfileForm({ ...profileForm, tagline: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Email Kontak</label>
                                        <input type="email" value={profileForm.contactEmail} onChange={e => setProfileForm({ ...profileForm, contactEmail: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Nomor Telepon</label>
                                        <input type="text" value={profileForm.contactPhone} onChange={e => setProfileForm({ ...profileForm, contactPhone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Nomor WhatsApp CS</label>
                                        <input type="text" value={profileForm.contactWhatsapp} onChange={e => setProfileForm({ ...profileForm, contactWhatsapp: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800" placeholder="628..." />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Deskripsi Toko</label>
                                        <textarea value={profileForm.description} onChange={e => setProfileForm({ ...profileForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800"></textarea>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-[12px] font-bold text-slate-500 mb-2">Alamat Fisik (Opsional)</label>
                                        <textarea value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800"></textarea>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Custom Domain */}
                    {activeTab === 'domain' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-600" /> Custom Domain
                            </h3>
                            <div className="mb-6 mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                <p className="text-sm text-blue-800 leading-relaxed mb-3">
                                    Untuk menggunakan domain Anda sendiri (contoh: <b>topupdewa.com</b>), silakan arahkan DNS record dari penyedia domain Anda: <br />
                                    - <b>A Record:</b> Arahkan ke IP <code>103.145.226.12</code><br />
                                    - <b>CNAME:</b> Arahkan <code>www</code> ke domain utama Anda.
                                </p>

                                {merchantPlan !== 'SUPREME' ? (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-[13px] font-bold border border-red-200 flex items-start gap-2">
                                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Plan Anda ({merchantPlan}) hanya mendukung klaim domain akhiran .my.id atau .biz.id. Upgrade ke SUPREME untuk bebas pakai domain Premium TLD (.com, .id, dll).</span>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-[13px] font-bold border border-emerald-200 flex items-start gap-2">
                                        <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Status SUPREME: Anda bebas menghubungkan Custom Domain Premium TLD (.com, .net, dll).</span>
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleSaveDomain}>
                                <div className="mb-6">
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Nama Domain</label>
                                    <input type="text" value={domainForm.domain} onChange={e => setDomainForm({ ...domainForm, domain: e.target.value })} placeholder="Contoh: topupdewa.com" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-slate-800" />
                                </div>
                                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                                    Verifikasi & Simpan
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Payment Channels (Mockup) */}
                    {activeTab === 'payment' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center py-16">
                            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Modul Payment Channels</h3>
                            <p className="text-slate-500 px-8 text-sm max-w-md mx-auto">Pengaturan aktif/non-aktifkan payment gateway seperti QRIS, Virtual Account, Retail, dan E-Wallet akan tersedia di sini.</p>
                        </div>
                    )}

                    {/* Seo & Meta Pixel */}
                    {activeTab === 'seo' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-indigo-600" /> SEO & Meta Pixel
                            </h3>
                            <div className="mb-6 flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                                <p className="text-sm text-indigo-800">Tambahkan ID Pixel untuk melacak aktivitas kunjungan dan konversi di web toko Anda. Fitur ini tersedia untuk semua Tier (Pro, Legend, Supreme).</p>
                            </div>
                            <form onSubmit={handleSaveSeo} className="space-y-5">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Google Analytics (G-XXXXX)</label>
                                    <input type="text" value={seoForm.googleAnalytics} onChange={e => setSeoForm({ ...seoForm, googleAnalytics: e.target.value })} placeholder="Contoh: G-12345ABCDE" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-sm text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">Facebook Pixel ID</label>
                                    <input type="text" value={seoForm.facebookPixel} onChange={e => setSeoForm({ ...seoForm, facebookPixel: e.target.value })} placeholder="Contoh: 123456789012345" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-sm text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-500 mb-2">TikTok Pixel ID</label>
                                    <input type="text" value={seoForm.tiktokPixel} onChange={e => setSeoForm({ ...seoForm, tiktokPixel: e.target.value })} placeholder="Contoh: CE123ABCDEF456" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-sm text-slate-800" />
                                </div>
                                <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                                    <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                                        <Save className="w-4 h-4" /> Simpan Pengaturan SEO
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Webhook (Mockup) */}
                    {activeTab === 'webhook' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 text-center py-16">
                            <Webhook className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Integrasi Webhook</h3>
                            <p className="text-slate-500 px-8 text-sm max-w-md mx-auto">Kami akan mengirim data transaksi secara realtime ke endpoint aplikasi Anda. Modul sedang dalam pengembangan.</p>
                        </div>
                    )}
                </div>
            </div>
        </MerchantLayout>
    );
}
