"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Crown, Loader2 } from 'lucide-react';

export default function AdminDemoPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loginAsDemo = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
                const response = await axios.post(`${baseUrl}/api/auth/merchant/login`, {
                    email: 'demo@dagangplay.com',
                    password: 'demo123'
                });

                if (response.data?.access_token) {
                    localStorage.setItem('merchant_token', response.data.access_token);
                    localStorage.setItem('merchant_user', JSON.stringify(response.data.user));
                    localStorage.setItem('admin_token', response.data.access_token);
                    localStorage.setItem('admin_user', JSON.stringify(response.data.user));
                    
                    // Supaya tidak dianggap sesi lama, refresh config lokal atau hapus residual storage
                    // sebelum diarahkan ke merchant dashboard
                    setTimeout(() => {
                        window.location.href = '/merchant';
                    }, 500);
                } else {
                    setError('Terjadi kendala saat merakit sesi demo.');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Gagal tersambung ke server sinkronisasi demo.');
            }
        };

        loginAsDemo();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl max-w-sm w-full text-center border border-slate-100 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6">
                    <Crown className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                    Menyiapkan Demo...
                </h1>
                
                {error ? (
                    <div className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl mt-4">
                        {error}
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="block mt-4 text-xs text-slate-500 underline"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 mt-8 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-sm font-bold uppercase tracking-widest text-indigo-600/70">
                            Masuk ke Dashboard
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
