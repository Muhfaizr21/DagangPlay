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
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FCBF49] shadow-[0_0_10px_#FCBF49]" />
                        {a.content}
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F77F00] shadow-[0_0_10px_#F77F00]" />
                    </span>
                ))}
                {announcements.map((a: any, i: number) => (
                    <span key={`dup-${i}`} className="mx-20 text-[10px] font-bold uppercase tracking-[.25em] text-white/40 flex items-center gap-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FCBF49] shadow-[0_0_10px_#FCBF49]" />
                        {a.content}
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F77F00] shadow-[0_0_10px_#F77F00]" />
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
        <div className="w-full h-[250px] md:h-[400px] border border-white/10 flex items-center justify-center relative rounded-[3rem] bg-[#001D2D]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D62828]/5 to-[#F77F00]/5" />
            <p className="font-heading text-[10px] uppercase font-black tracking-[1em] text-white/10 italic">PROMO EKSKLUSIF</p>
        </div>
    );

    return (
        <div className="relative w-full h-[250px] md:h-[400px] overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-[3rem]">
            {banners.map((b: any, i: number) => (
                <div key={i} className={`absolute inset-0 transition-all duration-[2s] transform ease-in-out ${i === curr ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}>
                    <img src={b.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[3s]" alt="Banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001D2D] via-transparent to-transparent opacity-80"></div>
                </div>
            ))}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {banners.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurr(i)} className={`h-1.5 cursor-pointer transition-all duration-700 rounded-full ${i === curr ? "w-12 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "w-2 bg-white/20 hover:bg-white/40"}`} />
                ))}
            </div>
        </div>
    );
};
