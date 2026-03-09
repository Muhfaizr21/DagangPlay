"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');

        if (!token || !userData) {
            router.push('/admin/login');
            return;
        }

        const parsed = JSON.parse(userData);
        if (parsed.role !== 'RESELLER') {
            router.push('/admin/login');
            return;
        }

        setUser(parsed);
    }, [router]);

    if (!user) return <div className="p-10 flex items-center justify-center">Authenticating...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <div className="w-64 bg-slate-900 text-white min-h-screen p-5">
                <h2 className="text-xl font-bold mb-8">Panel Reseller</h2>
                <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 bg-indigo-600 rounded-lg">Dashboard</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg">Harga Khusus</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg">Riwayat Top-Up</button>
                </div>
                <div className="absolute bottom-5 left-5">
                    <button onClick={() => { localStorage.clear(); router.push('/admin/login'); }} className="text-red-400 text-sm flex items-center gap-2 hover:text-red-300">
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex-1 p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h1 className="text-2xl font-bold text-slate-800">Hi, {user.name}</h1>
                    <p className="text-slate-500 mt-2">Selamat datang di Panel Reseller Anda.</p>

                    <div className="mt-8 grid grid-cols-2 gap-6">
                        <div className="p-6 bg-cyan-50 border border-cyan-100 rounded-xl">
                            <p className="text-cyan-800 font-bold">Saldo Tersedia</p>
                            <h3 className="text-3xl font-black text-cyan-600 mt-2">Rp 0</h3>
                            <button className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold">Topup Saldo</button>
                        </div>
                        <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl">
                            <p className="text-purple-800 font-bold">Total Transaksi Selesai</p>
                            <h3 className="text-3xl font-black text-purple-600 mt-2">0</h3>
                            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold">Lihat Riwayat</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
