"use client";
import React, { useEffect, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

function useCount(target: number, active: boolean, ms = 2000) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!active) return;
        let cur = 0; const tick = target / (ms / 16);
        const t = setInterval(() => { cur += tick; if (cur >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(cur)); }, 16);
        return () => clearInterval(t);
    }, [active, target, ms]);
    return val;
}

export default function Stats() {
    const { ref, v } = useReveal();
    const STATS = [
        { target: 500000, suffix: "+", label: "Total Transaksi", fmt: (n: number) => `${Math.floor(n / 1000)}K` },
        { target: 100, suffix: "+", label: "Game Tersedia", fmt: (n: number) => String(n) },
        { target: 50000, suffix: "+", label: "Pelanggan Aktif", fmt: (n: number) => `${Math.floor(n / 1000)}K` },
        { target: 999, suffix: "%", label: "Uptime Server", fmt: (n: number) => n === 999 ? "99.9" : (n / 10).toFixed(1) },
    ];

    const vals = [
        useCount(STATS[0].target, v),
        useCount(STATS[1].target, v),
        useCount(STATS[2].target, v),
        useCount(STATS[3].target, v)
    ];

    return (
        <section className="py-16 border-gold-t border-gold-b" style={{ background: "linear-gradient(180deg,#060e25,#0a1735)" }}>
            <div className="container mx-auto px-6">
                <div ref={ref} className={`grid grid-cols-2 md:grid-cols-4 gap-8 reveal ${v ? "visible" : ""}`}>
                    {STATS.map((s, i) => (
                        <div key={i} className="text-center">
                            <p className="font-heading text-gradient-gold text-5xl md:text-6xl mb-1">{s.fmt(vals[i])}{s.suffix}</p>
                            <p className="font-body text-slate-400 text-xs uppercase tracking-widest">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
