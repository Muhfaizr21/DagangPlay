"use client";
import React, { useState, useEffect } from "react";
import { IGamepad, IStar } from "@/components/Icons";

export const LuxuryAnnouncement = ({ announcements }: any) => {
    if (!announcements?.length) return null;
    return (
        <div className="relative w-full py-3 bg-white/[0.01] border-y border-white/[0.04] backdrop-blur-3xl overflow-hidden group">
            <div className="flex animate-marquee-slow whitespace-nowrap">
                {announcements.map((a: any, i: number) => (
                    <span key={i} className="mx-20 text-[10px] font-bold uppercase tracking-[.25em] text-white/40 flex items-center gap-4">
                        <span className="w-1 h-1 rounded-full bg-gold shadow-[0_0_10px_rgba(201,168,76,0.6)]" />
                        {a.content}
                        <span className="w-1 h-1 rounded-full bg-gold shadow-[0_0_10px_rgba(201,168,76,0.6)]" />
                    </span>
                ))}
                {announcements.map((a: any, i: number) => (
                    <span key={`dup-${i}`} className="mx-20 text-[10px] font-bold uppercase tracking-[.25em] text-white/40 flex items-center gap-4">
                        <span className="w-1 h-1 rounded-full bg-gold shadow-[0_0_10px_rgba(201,168,76,0.6)]" />
                        {a.content}
                        <span className="w-1 h-1 rounded-full bg-gold shadow-[0_0_10px_rgba(201,168,76,0.6)]" />
                    </span>
                ))}
            </div>
        </div>
    );
};

export const PaymentTicker = () => {
    const methods = ["QRIS", "BCA", "BNI", "MANDIRI", "OVO", "DANA", "GOPAY", "LINKAJA", "ALFAMART", "INDOMARET"];
    return (
        <div className="py-4 border-y border-white/[0.02] bg-black/40 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap opacity-10 hover:opacity-100 transition-opacity duration-700">
                {[...methods, ...methods, ...methods].map((m, i) => (
                    <span key={i} className="mx-8 text-[8px] font-black tracking-[.6em] text-white uppercase italic">{m}</span>
                ))}
            </div>
        </div>
    );
};

export const PremiumSlider = ({ banners }: any) => {
    const [curr, setCurr] = useState(0);
    useEffect(() => {
        if (!banners?.length) return;
        const itv = setInterval(() => setCurr(c => (c + 1) % banners.length), 8000);
        return () => clearInterval(itv);
    }, [banners]);

    if (!banners?.length) return (
        <div className="w-full h-[250px] md:h-[400px] bento-card flex items-center justify-center relative rounded-[3rem]">
            <div className="shimmer-bg absolute inset-0 opacity-20" />
            <p className="font-heading text-[9px] uppercase tracking-[1em] text-white/5 italic">PROMO EKSKLUSIF</p>
        </div>
    );

    return (
        <div className="relative w-full h-[250px] md:h-[400px] bento-card overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-[3rem]">
            {banners.map((b: any, i: number) => (
                <div key={i} className={`absolute inset-0 transition-all duration-[2s] transform ease-in-out ${i === curr ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}>
                    <img src={b.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[3s]" alt="Banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent"></div>
                </div>
            ))}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
                {banners.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurr(i)} className={`h-1 cursor-pointer transition-all duration-700 rounded-full ${i === curr ? "w-10 bg-gold shadow-[0_0_15px_#C9A84C]" : "w-1.5 bg-white/10 hover:bg-white/30"}`} />
                ))}
            </div>
        </div>
    );
};
