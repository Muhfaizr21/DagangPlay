"use client";
import { useEffect, useState } from "react";
import useSWR from 'swr';
import axios from 'axios';
import Stats from "@/components/Stats";
import { useReveal } from "@/hooks/useReveal";
import {
  IGamepad, IMenu, IClose, IStar
} from "@/components/Icons";
import {
  NAV, FEATURES, STEPS, TESTI, FOOTCOLS, SOCIALS
} from "@/data/constants";
import BannerSlider from "@/components/BannerSlider";
import AnnouncementBar from "@/components/AnnouncementBar";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

// ─── Hero Component ───────────────────────────────────────────────
const Hero = ({ banners, theme }: { banners: any[], theme?: string }) => {
  const { ref, v } = useReveal();
  const isLight = theme === 'light';
  return (
    <section id="beranda" className={`${isLight ? 'bg-slate-50' : 'grid-bg'} relative min-h-[85vh] flex items-center overflow-hidden`}>
      {!isLight && (
        <>
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[.17] pointer-events-none"
            style={{ background: "radial-gradient(circle,#38D9F5,transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[.12] pointer-events-none"
            style={{ background: "radial-gradient(circle,#C9A84C,transparent 70%)", filter: "blur(80px)" }} />
        </>
      )}
      {isLight && (
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #38D9F511 0%, transparent 50%), radial-gradient(circle at 80% 70%, #C9A84C11 0%, transparent 50%)' }} />
      )}

      <div className="container mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
        <div ref={ref} className={`reveal ${v ? "visible" : ""}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-cyan/30 bg-cyan/[.08]">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="font-body text-cyan text-xs">Platform Top Up #1 Terpercaya</span>
          </div>
          <h1 className="font-heading leading-[.95] mb-3 text-shadow-cyan" style={{ fontSize: "clamp(3rem,6vw,4.5rem)" }}>
            <span className={`${isLight ? 'text-slate-900' : 'text-white'} block`}>TOP UP GAMES</span>
          </h1>
          <h2 className="font-heading text-gradient-gold leading-[.95] mb-6" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>
            TERCEPAT & TERMURAH
          </h2>
          <p className={`font-body text-base leading-relaxed max-w-lg mb-8 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Ribuan produk voucher & top up untuk <span className="text-cyan font-semibold">100+ game populer</span>. Proses otomatis nonstop 24 jam.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#produk" className="btn-mint text-sm px-7 py-3.5">🎮 Top Up Sekarang</a>
            <a href="#reseller" className="btn-outline-cyan text-sm px-7 py-3.5">💼 Jadi Reseller</a>
          </div>
        </div>

        <div className={`reveal flex justify-center w-full lg:max-w-none ${v ? "visible" : ""}`}>
          <BannerSlider banners={banners} />
        </div>
      </div>
    </section>
  );
};

// ─── Home Page ────────────────────────────────────────────────────
export default function Home() {
  const [mOpen, setMOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fetch Public Content
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const { data: config } = useSWR(`${baseUrl}/public/orders/config?t=${new Date().getTime()}`, fetcher);
  const { data: contentData } = useSWR(`${baseUrl}/public/products/content`, fetcher);
  const { data: categories, error: categoriesError } = useSWR(`${baseUrl}/public/products/categories`, fetcher);
  const banners = contentData?.banners || [];
  const announcements = contentData?.announcements || [];

  const activeTheme = config?.theme?.active || 'dark';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (config?.name) {
      document.title = `${config.name} – ${config.tagline || 'Top Up Games Tercepat & Termurah'}`;
    }
  }, [config]);

  // Dynamic Theme Styling
  const themeClasses: Record<string, any> = {
    dark: {
      body: "bg-[#020818] text-white",
      navbar: scrolled ? "bg-[#020818]/88 shadow-2xl shadow-black/50 nav-blur" : "bg-transparent",
      featureSec: "bg-gradient-to-b from-navy-mid to-navy-dark",
      productSec: "bg-navy-deep",
      howSec: "bg-gradient-to-b from-navy-dark to-navy-deep",
      testiSec: "bg-navy-mid",
      ctaSec: "linear-gradient(135deg,#020818,#0a1a3a 50%,#020818)",
      footer: "bg-navy-deep"
    },
    light: {
      body: "bg-white text-slate-800",
      navbar: scrolled ? "bg-white/90 shadow-lg nav-blur border-b border-slate-100" : "bg-transparent",
      featureSec: "bg-slate-50",
      productSec: "bg-white",
      howSec: "bg-slate-50",
      testiSec: "bg-white",
      ctaSec: "linear-gradient(135deg,#f8fafc,#e2e8f0 50%,#f8fafc)",
      footer: "bg-slate-50 text-slate-900 border-t border-slate-200"
    }
  };

  const t = themeClasses[activeTheme] || themeClasses.dark;
  const isLight = activeTheme === 'light';

  useEffect(() => {
    console.log(`[FRONTEND] Active Theme: ${activeTheme}, isLight: ${isLight}`);
  }, [activeTheme, isLight]);

  return (
    <div id="top" className={`${t.body} min-h-screen overflow-x-hidden`}>
      {/* Dynamic Navbar */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${t.navbar}`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 group no-underline">
            <span className={isLight ? "text-indigo-600" : "text-gold drop-shadow-[0_0_8px_rgba(201,168,76,.7)]"}>
              {config?.logo ? <img src={config.logo} alt="Logo" className="w-8 h-8 object-contain" /> : <IGamepad />}
            </span>
            <span className={`font-heading tracking-[.12em] text-2xl uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>{config?.name || "DAGANGPLAY"}</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
                className={`font-body text-sm transition-all duration-200 relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-cyan hover:after:w-full ${isLight ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-300 hover:text-cyan'}`}>
                {l}
              </a>
            ))}
          </nav>

          <a href="#produk" className="btn-mint hidden md:inline-flex text-sm px-5 py-2.5">Mulai Top Up</a>

          <button className={`md:hidden p-1 border-none bg-transparent cursor-pointer ${isLight ? 'text-slate-900' : 'text-white'}`}
            onClick={() => setMOpen(!mOpen)}>
            {mOpen ? <IClose /> : <IMenu />}
          </button>
        </div>
      </header>

      <div className="pt-16">
        <AnnouncementBar announcements={announcements} theme={activeTheme} />
      </div>

      <Hero banners={banners} theme={activeTheme} />
      <Stats theme={activeTheme} />

      {/* Features Section */}
      <section id="tentang-kami" className={`py-24 relative ${t.featureSec}`}>
        <div className="container mx-auto px-6 text-center mb-16">
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Keunggulan Platform</p>
          <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            KENAPA PILIH <span className="text-gradient-gold">{config?.name?.toUpperCase() || "DAGANGPLAY"}?</span>
          </h2>
          <span className="sep-gold" />
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className={`rounded-2xl p-6 border transition-all hover:-translate-y-1 ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'glass-card'}`}>
              <div className="flex mb-4" style={{ color: f.c }}>{f.icon}</div>
              <h3 className={`font-syne font-extrabold text-lg mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{f.title}</h3>
              <p className={`font-body text-sm leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products Catalog */}
      <section id="produk" className={`py-24 relative ${t.productSec}`}>
        <div className="container mx-auto px-6 relative z-10 text-center mb-16">
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Koleksi Lengkap</p>
          <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            GAME <span className="text-gradient-gold">POPULER</span>
          </h2>
          <p className="font-body text-slate-500 text-sm">Top up langsung, proses instan</p>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categoriesError ? (
            <div className="col-span-full text-center py-20">
              <p className="text-red-500 font-bold mb-2">Gagal memuat produk ⚠️</p>
              <button onClick={() => window.location.reload()} className="text-cyan underline text-sm border-none bg-transparent cursor-pointer">Coba Refresh</button>
            </div>
          ) : !categories ? (
            <div className={`col-span-full text-center py-20 flex flex-col items-center gap-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className="w-10 h-10 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin"></div>
              <span>Sedang menyiapkan katalog game terbaik untuk Anda...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className={`col-span-full text-center py-20 font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Katalog produk sedang dalam pemeliharaan. Kembali sesaat lagi.
            </div>
          ) : categories.map((c: any, i: number) => (
            <a href={`/produk/${c.slug}`} key={c.id} className="group rounded-2xl overflow-hidden cursor-pointer border border-transparent hover:border-cyan/40 hover:-translate-y-1 transition-all duration-300 block shadow-sm">
              <div className="h-40 flex items-center justify-center relative overflow-hidden bg-slate-800">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="font-heading text-4xl text-white opacity-40">{c.name.substring(0, 2)}</span>
                )}
              </div>
              <div className={isLight ? "p-4 bg-white" : "p-4 bg-navy-mid"}>
                <p className={`font-body text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{c.name}</p>
                <div className="flex justify-between items-center mt-1 text-[10px]">
                  <span className="text-mint font-bold italic">✓ Instan</span>
                  <span className="text-slate-400 font-bold">{c.skuCount || 0} Item</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className={`py-24 overflow-hidden relative ${t.howSec}`}>
        <div className="container mx-auto px-6 text-center mb-20">
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Mudah & Cepat</p>
          <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl ${isLight ? 'text-slate-900' : 'text-white'}`}>CARA <span className="text-gradient-gold">TOP UP</span></h2>
        </div>
        <div className="container mx-auto px-6 relative flex flex-col md:flex-row items-center gap-12 md:gap-0">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center text-center px-6 relative">
              <span className="font-heading absolute -top-8 opacity-[.06] text-8xl md:text-9xl select-none pointer-events-none" style={{ color: s.c }}>{s.num}</span>
              <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-5 border-2" style={{ background: `${s.c}18`, borderColor: `${s.c}55`, color: s.c }}>{s.icon}</div>
              <h3 className={`font-syne font-extrabold text-xl mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.title}</h3>
              <p className={`font-body text-sm leading-relaxed max-w-[200px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 ${t.testiSec}`}>
        <div className="container mx-auto px-6 text-center mb-16">
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-3">Testimoni</p>
          <h2 className={`font-heading text-4xl md:text-5xl lg:text-6xl ${isLight ? 'text-slate-900' : 'text-white'}`}>DIPERCAYA <span className="text-gradient-gold">RIBUAN GAMER</span></h2>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTI.map((t, i) => (
            <div key={i} className={`rounded-2xl p-6 flex flex-col border ${isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'glass-card'}`}>
              <div className="flex gap-1 mb-4">{Array.from({ length: t.stars }).map((_, j) => <IStar key={j} />)}</div>
              <p className={`font-body text-sm leading-relaxed italic flex-1 mb-6 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-sm text-navy-deep bg-gradient-to-br from-gold to-cyan">{t.init}</div>
                <div>
                  <p className={`font-body text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.name}</p>
                  <span className="text-[10px] text-mint font-bold uppercase tracking-wider">✓ Verified Buyer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section id="reseller" className="py-24 relative overflow-hidden" style={{ background: t.ctaSec }}>
        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="font-body text-cyan text-xs uppercase tracking-[.2em] mb-4">Program Reseller</p>
          <h2 className={`font-heading text-4xl md:text-6xl lg:text-7xl leading-tight mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>SIAP MULAI JUALAN<br /><span className="text-gradient-gold">VOUCHER GAMES?</span></h2>
          <p className={`font-body text-base md:text-lg max-w-xl mx-auto mb-10 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Daftar gratis, langsung aktif, komisi menggiurkan. Bergabung dengan <span className="text-cyan font-semibold">50.000+ reseller</span> kami sekarang.</p>
          <a href="/reseller" className="btn-gold text-base md:text-lg px-10 py-4 tracking-wide shadow-gold">🚀 Lihat Program Reseller Lengkap</a>
        </div>
      </section>

      <footer id="kontak" className={`pt-16 pb-8 ${t.footer}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <span className={isLight ? "text-indigo-600" : "text-gold"}>{config?.logo ? <img src={config.logo} alt="Logo" className="w-6 h-6 object-contain" /> : <IGamepad />}</span>
                <span className={`font-heading text-2xl tracking-[.1em] uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>{config?.name || "DAGANGPLAY"}</span>
              </div>
              <p className="font-body text-slate-500 text-sm leading-relaxed max-w-xs mb-5">
                {config?.tagline || "Platform top up & voucher game terpercaya. Proses otomatis, harga terbaik, layanan 24/7."}
              </p>
              <div className="flex items-center gap-2.5">
                {SOCIALS.map((s, i) => (
                  <a key={i} href={s.href} aria-label={s.label} className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${isLight ? 'text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-600' : 'text-cyan border-cyan/25 hover:bg-cyan/10 hover:border-cyan'}`}>{s.icon}</a>
                ))}
              </div>
            </div>
            {FOOTCOLS.map((col, i) => (
              <div key={i}>
                <h4 className={`font-body text-xs font-semibold uppercase tracking-widest mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>{col.title}</h4>
                <ul className="space-y-2.5 list-none p-0 m-0">
                  {col.links.map(l => <li key={l}><a href="#" className="font-body text-sm text-slate-500 hover:text-cyan transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {config?.name || "DagangPlay"}. {!config?.whiteLabel && !config?.isOfficial && <span className="opacity-50 ml-1">Powered by DagangPlay</span>}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <a href="#" className="hover:text-cyan transition-colors">Syarat & Ketentuan</a>
              <a href="#" className="hover:text-cyan transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
