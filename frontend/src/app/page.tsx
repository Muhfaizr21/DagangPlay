"use client";
import { useEffect, useState, memo } from "react";
import Stats from "@/components/Stats";
import { useReveal } from "@/hooks/useReveal";
import {
  IGamepad, IMenu, IClose, IStar
} from "@/components/Icons";
import {
  NAV, HERO_CARDS, PRODUCTS, FEATURES, STEPS, TESTI, FOOTCOLS, SOCIALS
} from "@/data/constants";

// ─── Navbar ────────────────────────────────────────────────────────
const Navbar = ({ scrolled, mOpen, setMOpen }: { scrolled: boolean, mOpen: boolean, setMOpen: (v: boolean) => void }) => (
  <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "nav-blur shadow-2xl shadow-black/50" : "bg-transparent"}`}
    style={scrolled ? { backgroundColor: "rgba(2,8,24,.88)" } : {}}>
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#top" className="flex items-center gap-2.5 group no-underline">
        <span className="text-gold drop-shadow-[0_0_8px_rgba(201,168,76,.7)] group-hover:drop-shadow-[0_0_14px_rgba(201,168,76,.9)] transition-all">
          <IGamepad />
        </span>
        <span className="font-heading text-white tracking-[.12em] text-2xl">DAGANGPLAY</span>
      </a>

      <nav className="hidden md:flex items-center gap-8">
        {NAV.map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
            className="font-body text-sm text-slate-300 hover:text-cyan transition-colors duration-200 relative
              after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0
              after:bg-cyan after:transition-all after:duration-300 hover:after:w-full">
            {l}
          </a>
        ))}
      </nav>

      <a href="#produk" className="btn-mint hidden md:inline-flex text-sm px-5 py-2.5">Mulai Top Up</a>

      <button className="md:hidden text-white p-1 border-none bg-transparent cursor-pointer"
        onClick={() => setMOpen(!mOpen)} aria-label="Menu">
        {mOpen ? <IClose /> : <IMenu />}
      </button>
    </div>

    {mOpen && (
      <div className="md:hidden nav-blur border-t border-cyan/10 px-6 py-4 flex flex-col gap-3"
        style={{ background: "rgba(2,8,24,.96)" }}>
        {NAV.map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
            onClick={() => setMOpen(false)}
            className="font-body text-sm text-slate-400 hover:text-cyan transition-colors py-1">
            {l}
          </a>
        ))}
        <a href="#produk" onClick={() => setMOpen(false)}
          className="btn-mint text-sm px-5 py-2.5 text-center mt-2">
          Mulai Top Up
        </a>
      </div>
    )}
  </header>
);

// ─── Hero ──────────────────────────────────────────────────────────
const Hero = () => {
  const { ref, v } = useReveal();
  return (
    <section id="beranda" className="grid-bg relative min-h-screen flex items-center overflow-hidden pt-16">
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[.17] pointer-events-none"
        style={{ background: "radial-gradient(circle,#38D9F5,transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[.12] pointer-events-none"
        style={{ background: "radial-gradient(circle,#C9A84C,transparent 70%)", filter: "blur(80px)" }} />

      <div className="container mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div ref={ref} className={`reveal ${v ? "visible" : ""}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-cyan/30 bg-cyan/[.08]">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="font-body text-cyan text-xs">Platform Top Up #1 Terpercaya</span>
          </div>
          <h1 className="font-heading leading-[.95] mb-3 text-shadow-cyan" style={{ fontSize: "clamp(3.5rem,7vw,5.5rem)" }}>
            <span className="text-white block">TOP UP GAMES</span>
          </h1>
          <h2 className="font-heading text-gradient-gold leading-[.95] mb-6" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
            TERCEPAT & TERMURAH
          </h2>
          <p className="font-body text-slate-400 text-base md:text-lg leading-relaxed max-w-lg mb-8">
            Ribuan produk voucher & top up untuk <span className="text-cyan font-semibold">100+ game populer</span>. Proses otomatis nonstop 24 jam.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#produk" className="btn-mint text-sm px-7 py-3.5">🎮 Top Up Sekarang</a>
            <a href="#reseller" className="btn-outline-cyan text-sm px-7 py-3.5">💼 Jadi Reseller</a>
          </div>
        </div>

        <div className="relative h-[460px] hidden md:block">
          {HERO_CARDS.map((c, i) => (
            <div key={c.name} className="tilt-card glass-card absolute rounded-2xl p-4 flex items-center gap-3 w-52"
              style={{
                top: `${[8, 22, 42, 60, 76][i]}%`,
                left: `${[0, 42, 5, 44, 18][i]}%`,
                animationName: c.anim, animationDuration: `${3.5 + i * .5}s`,
                animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
                animationDelay: c.delay,
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-heading text-base"
                style={{ background: `linear-gradient(135deg,${c.bg},${c.accent}33)`, border: `1px solid ${c.accent}44`, color: c.accent }}>
                {c.abbr}
              </div>
              <div className="overflow-hidden">
                <p className="font-body text-white text-sm font-semibold truncate">{c.name}</p>
                <span className="font-body inline-flex items-center gap-1 text-[10px] text-mint bg-mint/10 px-2 py-0.5 rounded-full mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  Tersedia
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <div className="w-px h-10 bg-gradient-to-b from-transparent via-cyan to-transparent animate-pulse" />
        <p className="font-body text-cyan text-[10px] tracking-[.25em]">SCROLL</p>
      </div>
    </section>
  );
};

// ─── Features ──────────────────────────────────────────────────────
const Features = () => {
  const { ref, v } = useReveal();
  return (
    <section id="tentang-kami" className="py-24 relative" style={{ background: "linear-gradient(180deg,#0a1735,#050f24)" }}>
      <div className="container mx-auto px-6">
        <div ref={ref} className={`text-center mb-16 reveal ${v ? "visible" : ""}`}>
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Keunggulan Platform</p>
          <h2 className="font-heading text-white text-4xl md:text-5xl lg:text-6xl mb-4">
            KENAPA PILIH <span className="text-gradient-gold">DAGANGPLAY?</span>
          </h2>
          <span className="sep-gold" />
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal ${v ? "visible" : ""}`}>
          {FEATURES.map((f, i) => (
            <div key={i} className="glass-card rounded-2xl p-6" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="flex mb-4" style={{ color: f.c, filter: `drop-shadow(0 0 8px ${f.c}66)` }}>{f.icon}</div>
              <h3 className="font-syne text-white font-extrabold text-lg mb-2">{f.title}</h3>
              <p className="font-body text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Products ──────────────────────────────────────────────────────
const Products = () => {
  const { ref, v } = useReveal();
  return (
    <section id="produk" className="py-24 relative bg-navy-deep">
      <div className="container mx-auto px-6 relative z-10">
        <div ref={ref} className={`text-center mb-16 reveal ${v ? "visible" : ""}`}>
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Koleksi Lengkap</p>
          <h2 className="font-heading text-white text-4xl md:text-5xl lg:text-6xl mb-2">
            GAME <span className="text-gradient-gold">POPULER</span>
          </h2>
          <p className="font-body text-slate-500 text-sm">Top up langsung, proses instan</p>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 reveal ${v ? "visible" : ""}`}>
          {PRODUCTS.map((g, i) => (
            <div key={i} className="group rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-cyan/40 hover:-translate-y-1 transition-all duration-300" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="h-36 flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg,${g.from},${g.to})` }}>
                <span className="font-heading text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300" style={{ color: g.accent }}>{g.abbr}</span>
              </div>
              <div className="p-3" style={{ background: "#0d1c3d" }}>
                <p className="font-body text-white text-sm font-semibold">{g.name}</p>
                <span className="font-body inline-flex items-center gap-1 text-[10px] text-mint mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint inline-block" /> Top Up Tersedia
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── How it Works ──────────────────────────────────────────────────
const HowItWorks = () => {
  const { ref, v } = useReveal();
  return (
    <section className="py-24 overflow-hidden relative" style={{ background: "linear-gradient(180deg,#050f24,#020818)" }}>
      <div className="container mx-auto px-6">
        <div ref={ref} className={`text-center mb-20 reveal ${v ? "visible" : ""}`}>
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Mudah & Cepat</p>
          <h2 className="font-heading text-white text-4xl md:text-5xl lg:text-6xl">CARA <span className="text-gradient-gold">TOP UP</span></h2>
        </div>
        <div className={`relative flex flex-col md:flex-row items-center gap-12 md:gap-0 reveal ${v ? "visible" : ""}`}>
          <div className="hidden md:block absolute top-[80px] left-1/2 -translate-x-1/2 w-2/3 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(201,168,76,.3),#38D9F5,rgba(201,168,76,.3),transparent)" }} />
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center text-center px-6 relative">
              <span className="font-heading absolute -top-8 opacity-[.04] text-8xl md:text-9xl select-none pointer-events-none" style={{ color: s.c }}>{s.num}</span>
              <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-5 border-2 hover:scale-110 transition-transform duration-300" style={{ background: `${s.c}18`, borderColor: `${s.c}55`, color: s.c, filter: `drop-shadow(0 0 14px ${s.c}44)` }}>{s.icon}</div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-xs mb-3 text-navy-deep" style={{ background: s.c }}>{i + 1}</div>
              <h3 className="font-syne text-white font-extrabold text-xl mb-2">{s.title}</h3>
              <p className="font-body text-slate-400 text-sm leading-relaxed max-w-[200px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Testimonials ──────────────────────────────────────────────────
const Testimonials = () => {
  const { ref, v } = useReveal();
  return (
    <section className="py-24" style={{ background: "#0a1735" }}>
      <div className="container mx-auto px-6">
        <div ref={ref} className={`text-center mb-16 reveal ${v ? "visible" : ""}`}>
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Testimoni</p>
          <h2 className="font-heading text-white text-4xl md:text-5xl lg:text-6xl">DIPERCAYA <span className="text-gradient-gold">RIBUAN GAMER</span></h2>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 reveal ${v ? "visible" : ""}`}>
          {TESTI.map((t, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 flex flex-col" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="flex gap-1 mb-4">{Array.from({ length: t.stars }).map((_, j) => <IStar key={j} />)}</div>
              <p className="font-body text-slate-300 text-sm leading-relaxed italic flex-1 mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-sm text-navy-deep" style={{ background: "linear-gradient(135deg,#C9A84C,#38D9F5)" }}>{t.init}</div>
                  <div>
                    <p className="font-body text-white text-sm font-semibold">{t.name}</p>
                    <p className="font-body text-slate-500 text-xs">{t.city}</p>
                  </div>
                </div>
                <span className="font-body text-[10px] text-mint border border-mint/30 bg-mint/[.08] px-2.5 py-0.5 rounded-full">✓ Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Footer ────────────────────────────────────────────────────────
const Footer = () => (
  <footer id="kontak" className="pt-16 pb-8 border-gold-t bg-navy-deep">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-gold"><IGamepad /></span>
            <span className="font-heading text-white text-2xl tracking-[.1em]">DAGANGPLAY</span>
          </div>
          <p className="font-body text-slate-500 text-sm leading-relaxed max-w-xs mb-5">Platform top up & voucher game terpercaya. Proses otomatis, harga terbaik, layanan 24/7.</p>
          <div className="flex items-center gap-2.5">
            {SOCIALS.map((s, i) => (
              <a key={i} href={s.href} aria-label={s.label} className="w-9 h-9 rounded-full flex items-center justify-center text-cyan border border-cyan/25 hover:bg-cyan/10 hover:border-cyan transition-all duration-300">{s.icon}</a>
            ))}
          </div>
        </div>
        {FOOTCOLS.map((col, i) => (
          <div key={i}>
            <h4 className="font-body text-white text-xs font-semibold uppercase tracking-widest mb-4">{col.title}</h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {col.links.map(l => <li key={l}><a href="#" className="font-body text-sm text-slate-500 hover:text-cyan transition-colors duration-200">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-xs text-slate-600">© {new Date().getFullYear()} DagangPlay. All rights reserved.</p>
        <div className="flex items-center gap-5">
          {["Kebijakan Privasi", "Syarat & Ketentuan", "Bantuan"].map(item => (
            <a key={item} href="#" className="font-body text-xs text-slate-600 hover:text-cyan transition-colors duration-200">{item}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── Home Page ────────────────────────────────────────────────────
export default function Home() {
  const [mOpen, setMOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div id="top" className="bg-navy-deep text-white overflow-x-hidden">
      <Navbar scrolled={scrolled} mOpen={mOpen} setMOpen={setMOpen} />
      <Hero />
      <Stats />
      <Features />
      <Products />
      <HowItWorks />
      <Testimonials />

      {/* CTA Banner */}
      <section id="reseller" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#020818,#0a1a3a 50%,#020818)" }}>
        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-4">Program Reseller</p>
          <h2 className="font-heading text-white text-4xl md:text-6xl lg:text-7xl leading-tight mb-4">SIAP MULAI JUALAN<br /><span className="text-gradient-gold">VOUCHER GAMES?</span></h2>
          <p className="font-body text-slate-400 text-base md:text-lg max-w-xl mx-auto mb-10">Daftar gratis, langsung aktif, komisi menggiurkan. Bergabung dengan <span className="text-cyan font-semibold">50.000+ reseller</span> kami sekarang.</p>
          <a href="/reseller" className="btn-gold text-base md:text-lg px-10 py-4 tracking-wide">🚀 Lihat Program Reseller Lengkap</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
