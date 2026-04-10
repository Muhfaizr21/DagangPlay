"use client";
import { getApiUrl } from '@/lib/api';
import React, { use } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import MerchantStorefront from "@/components/MerchantStorefront";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function MerchantSlugStore({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const baseUrl = getApiUrl();

    // Fetch merchant config specifically by slug
    const { data: config, error, isLoading } = useSWR(`${baseUrl}/public/orders/config?slug=${params.slug}`, fetcher);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="min-h-screen bg-[#050B18] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-black mb-4">404</h1>
                <p className="text-slate-400">Toko tidak ditemukan atau sudah tidak aktif.</p>
                <a href="/" className="mt-8 text-indigo-500 hover:underline">Kembali ke Beranda</a>
            </div>
        );
    }

    return <MerchantStorefront config={config} />;
}
