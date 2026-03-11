"use client";
import React, { useState } from "react";
import { Lock } from "lucide-react";
import MerchantStorefront from "@/components/home/MerchantStorefront";

// Mock Data Pro
const MOCK_BANNERS = [
    { image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" },
    { image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" },
    { image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop" }
];

const MOCK_PRODUCTS = [
    { id: 1, name: "Mobile Legends", categoryName: "Game", image: "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1933&auto=format&fit=crop", slug: "mlbb" },
    { id: 2, name: "Free Fire", categoryName: "Game", image: "https://images.unsplash.com/photo-1580234811497-9bd7fd0f37a9?q=80&w=2067&auto=format&fit=crop", slug: "ff" },
    { id: 3, name: "PUBG Mobile", categoryName: "Game", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1957&auto=format&fit=crop", slug: "pubgm" },
    { id: 4, name: "Genshin Impact", categoryName: "Game", image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1974&auto=format&fit=crop", slug: "genshin" },
    { id: 5, name: "Valorant Points", categoryName: "Game", image: "https://images.unsplash.com/photo-1605895767110-23771d4030bb?q=80&w=1974&auto=format&fit=crop", slug: "valorant" },
    { id: 6, name: "Honkai Star Rail", categoryName: "Game", image: "https://images.unsplash.com/photo-1627335600241-11a0d86f338b?q=80&w=2070&auto=format&fit=crop", slug: "hsr" },
    { id: 7, name: "DANA Balance", categoryName: "E-Wallet", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop", slug: "dana" },
    { id: 8, name: "OVO Cash", categoryName: "E-Wallet", image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop", slug: "ovo" },
    { id: 9, name: "GOPAY", categoryName: "E-Wallet", image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2071&auto=format&fit=crop", slug: "gopay" },
    { id: 10, name: "LinkAja", categoryName: "E-Wallet", image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop", slug: "linkaja" },
    { id: 11, name: "Telkomsel Pulsa", categoryName: "Pulsa", image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=2070&auto=format&fit=crop", slug: "telkomsel" },
    { id: 12, name: "Indosat Ooredoo", categoryName: "Pulsa", image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop", slug: "indosat" },
    { id: 13, name: "XL Axiata", categoryName: "Pulsa", image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1974&auto=format&fit=crop", slug: "xl" },
    { id: 14, name: "Spotify Premium", categoryName: "Aplikasi", image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1974&auto=format&fit=crop", slug: "spotify" },
    { id: 15, name: "Netflix UHD", categoryName: "Aplikasi", image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop", slug: "netflix" },
    { id: 16, name: "Disney+ Hotstar", categoryName: "Aplikasi", image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop", slug: "disney" },
    { id: 17, name: "Youtube Premium", categoryName: "Aplikasi", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop", slug: "youtube" },
    { id: 18, name: "Point Blank", categoryName: "Game", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop", slug: "pb" },
];

export default function StoreDemoPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="relative">
            {/* Demo Header Banner */}
            <div className="bg-gold text-black py-2 px-4 text-center text-[10px] font-black uppercase tracking-[.4em] sticky top-0 z-[100] border-b border-black flex items-center justify-center gap-4">
                <Lock size={12} /> MODE PREVIEW TOKO - VIEW ONLY <Lock size={12} />
            </div>

            <main className="relative">
                {/* Subtle Click Interceptor para demo */}
                <div
                    className="absolute inset-x-0 top-0 bottom-0 z-40 bg-transparent cursor-not-allowed"
                    onClick={() => alert("Ini adalah tampilan Demo Toko Reseller DagangPlay.")}
                />

                <MerchantStorefront
                    config={{
                        name: "DEMO STORE",
                        slug: "demo",
                        logo: null
                    }}
                    contentData={{
                        banners: MOCK_BANNERS
                    }}
                    filteredProducts={MOCK_PRODUCTS}
                    search={search}
                    setSearch={setSearch}
                />
            </main>
        </div>
    );
}
