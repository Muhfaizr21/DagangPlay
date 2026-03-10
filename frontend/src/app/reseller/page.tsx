"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShieldCheck, Zap, Coins, TrendingUp, CheckCircle2,
    MonitorPlay, Layout, Search, ArrowRight, ChevronDown,
    Star, Check, ArrowUpRight, Minus, Play, BarChart3,
    Users, Globe, Sparkles, ChevronRight
} from 'lucide-react';
import PriceCatalog from '@/components/PriceCatalog';

/* ─────────────────────────────────────────────────────
   DESIGN: "Luxury Fintech Command Center"
   — Deep navy #0A1628 as dominant base
   — Pure white sections for contrast rhythm
   — True black #060A0F for depth panels
   — Gold #E8B84B as single precious accent
   — Plus Jakarta Sans: bold, geometric, modern
   — Asymmetric hero with diagonal clip
   — Floating stat cards with layered depth shadows
   — Editorial typography scale
───────────────────────────────────────────────────── */

const Styles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700;1,800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy:      #0A1628;
      --navy-mid:  #0D1E38;
      --navy-lit:  #132544;
      --navy-soft: #1A3260;
      --white:     #FFFFFF;
      --off:       #F4F6FA;
      --black:     #060A0F;
      --black2:    #0C1118;
      --gold:      #E8B84B;
      --gold-dim:  rgba(232,184,75,0.15);
      --gold-glow: rgba(232,184,75,0.3);
      --slate:     rgba(255,255,255,0.07);
      --slate2:    rgba(255,255,255,0.04);
      --border-n:  rgba(255,255,255,0.08);
      --border-w:  rgba(10,22,40,0.1);
      --text-dim:  rgba(255,255,255,0.55);
      --text-mute: rgba(255,255,255,0.3);
      --navy-text: #2D4A6E;
      --body-text: #4A5568;
      --ff: 'Plus Jakarta Sans', sans-serif;
      --sh: 0 24px 60px rgba(6,10,15,0.5), 0 4px 20px rgba(6,10,15,0.3);
      --sh2: 0 40px 80px rgba(6,10,15,0.6);
      --r4: 4px; --r8: 8px; --r12: 12px; --r16: 16px; --r24: 24px;
    }

    html { scroll-behavior: smooth; }
    body { background: var(--navy); font-family: var(--ff); }

    .root { font-family: var(--ff); background: var(--navy); color: var(--white); overflow-x: hidden; }

    /* ── NAV ── */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      height: 64px; padding: 0 2.5rem;
      display: flex; align-items: center;
      background: rgba(10,22,40,0.85);
      backdrop-filter: blur(24px) saturate(160%);
      border-bottom: 1px solid var(--border-n);
    }
    .nav::after {
      content: '';
      position: absolute; bottom: -1px; left: 2.5rem; right: 2.5rem;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(232,184,75,0.4), transparent);
    }
    .nav-brand { display: flex; align-items: center; gap: .75rem; text-decoration: none; margin-right: auto; }
    .nav-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--gold), #d4a030);
      border-radius: var(--r8);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 13px; color: var(--navy);
      box-shadow: 0 4px 16px var(--gold-glow);
      letter-spacing: -.03em;
    }
    .nav-name { font-weight: 800; font-size: 1.05rem; color: var(--white); letter-spacing: -.01em; }
    .nav-links { display: flex; gap: .25rem; margin-right: 1rem; }
    .nav-lk {
      padding: .5rem .875rem; border-radius: var(--r8);
      font-size: .8rem; font-weight: 500; color: var(--text-dim);
      text-decoration: none; letter-spacing: .01em;
      transition: color .15s, background .15s;
    }
    .nav-lk:hover { color: var(--white); background: var(--slate); }
    .nav-login {
      height: 36px; padding: 0 1.1rem;
      border: 1px solid var(--border-n); border-radius: var(--r8);
      color: var(--text-dim); font-size: .8rem; font-weight: 500;
      background: transparent; text-decoration: none;
      display: flex; align-items: center; margin-right: .5rem;
      transition: all .15s;
    }
    .nav-login:hover { color: var(--white); border-color: rgba(255,255,255,0.2); background: var(--slate); }
    .nav-cta {
      height: 36px; padding: 0 1.25rem;
      background: var(--gold); color: var(--navy);
      font-weight: 700; font-size: .8rem; border-radius: var(--r8);
      text-decoration: none; display: flex; align-items: center; gap: .35rem;
      box-shadow: 0 4px 20px var(--gold-glow);
      transition: all .2s;
    }
    .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 30px var(--gold-glow); background: #f0c55a; }

    /* ── HERO ── */
    .hero {
      min-height: 100vh;
      background: var(--navy);
      position: relative; overflow: hidden;
      padding-top: 64px;
      display: flex; flex-direction: column;
    }

    /* Mesh background */
    .hero-mesh {
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 80% 60% at 70% 50%, rgba(19,37,68,0.8) 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 20% 80%, rgba(232,184,75,0.06) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 90% 10%, rgba(13,30,56,0.9) 0%, transparent 60%);
    }
    /* Grid lines */
    .hero-grid {
      position: absolute; inset: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 72px 72px;
    }
    /* Diagonal cut at bottom */
    .hero-cut {
      position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
      background: var(--white);
      clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
    }

    .hero-inner {
      flex: 1; display: grid; grid-template-columns: 1fr 1fr;
      max-width: 1280px; margin: 0 auto; width: 100%;
      padding: 5rem 2.5rem 4rem;
      gap: 4rem; align-items: center;
      position: relative; z-index: 2;
    }

    /* Left */
    .hero-left {}
    .hero-tag {
      display: inline-flex; align-items: center; gap: .5rem;
      padding: .35rem .875rem;
      background: var(--gold-dim);
      border: 1px solid rgba(232,184,75,0.3);
      border-radius: 999px;
      font-size: .72rem; font-weight: 700; color: var(--gold);
      letter-spacing: .06em; text-transform: uppercase;
      margin-bottom: 1.75rem;
    }
    .hero-tag-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--gold); box-shadow: 0 0 8px var(--gold);
      animation: blink 2s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

    .hero-h1 {
      font-size: clamp(2.8rem, 5vw, 4.5rem);
      font-weight: 800; line-height: 1.06;
      letter-spacing: -.03em; color: var(--white);
      margin-bottom: 1.5rem;
    }
    .hero-h1 .hl {
      background: linear-gradient(135deg, var(--gold) 0%, #f5d280 50%, var(--gold) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .hero-p {
      font-size: 1rem; color: var(--text-dim);
      line-height: 1.75; max-width: 440px;
      margin-bottom: 2.5rem; font-weight: 400;
    }

    .hero-btns { display: flex; gap: .75rem; margin-bottom: 3rem; flex-wrap: wrap; }
    .btn-gold {
      display: inline-flex; align-items: center; gap: .5rem;
      padding: .875rem 1.75rem;
      background: var(--gold); color: var(--navy);
      font-weight: 700; font-size: .9rem; border-radius: var(--r12);
      text-decoration: none; border: none; cursor: pointer;
      box-shadow: 0 4px 24px var(--gold-glow);
      transition: all .2s;
    }
    .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 10px 36px var(--gold-glow); background: #f0c55a; }
    .btn-ghost-w {
      display: inline-flex; align-items: center; gap: .5rem;
      padding: .875rem 1.5rem;
      background: var(--slate); color: var(--white);
      font-weight: 600; font-size: .9rem; border-radius: var(--r12);
      text-decoration: none; border: 1px solid var(--border-n);
      transition: all .2s; cursor: pointer;
    }
    .btn-ghost-w:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.18); }

    .hero-stats { display: flex; gap: 2rem; flex-wrap: wrap; }
    .hero-stat {}
    .hero-sv {
      font-size: 1.75rem; font-weight: 800; letter-spacing: -.03em;
      color: var(--white);
    }
    .hero-sv .g { color: var(--gold); }
    .hero-sl { font-size: .72rem; color: var(--text-mute); font-weight: 500; margin-top: .1rem; letter-spacing: .03em; }
    .hero-divider { width: 1px; background: var(--border-n); align-self: stretch; }

    /* Right: Dashboard card */
    .hero-right { position: relative; }
    .dash-card {
      background: var(--black2);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: var(--r24);
      overflow: hidden;
      box-shadow: var(--sh2);
      position: relative;
    }
    .dash-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(232,184,75,0.5), transparent);
    }
    .dash-top {
      padding: 1rem 1.25rem;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      background: rgba(255,255,255,0.02);
    }
    .dash-top-l { display: flex; align-items: center; gap: .625rem; }
    .dot-row { display: flex; gap: .35rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dash-title { font-size: .72rem; font-weight: 600; color: var(--text-mute); letter-spacing: .04em; }
    .dash-live {
      display: flex; align-items: center; gap: .35rem;
      font-size: .68rem; font-weight: 700; color: #4ade80;
      background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2);
      padding: .2rem .625rem; border-radius: 999px;
    }
    .dash-live::before { content:''; width:5px;height:5px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80; }

    .dash-metrics {
      display: grid; grid-template-columns: repeat(3,1fr);
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .dash-m {
      padding: 1rem 1.25rem;
      border-right: 1px solid rgba(255,255,255,0.04);
    }
    .dash-m:last-child { border-right: none; }
    .dash-ml { font-size: .65rem; font-weight: 600; color: var(--text-mute); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .3rem; }
    .dash-mv { font-size: 1.1rem; font-weight: 800; color: var(--white); }
    .dash-md { font-size: .65rem; font-weight: 600; color: #4ade80; margin-top: .15rem; }

    .dash-chart { padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .dash-cl { font-size: .65rem; color: var(--text-mute); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .875rem; font-weight: 600; }
    .chart-bars { display: flex; align-items: flex-end; gap: 3px; height: 72px; }
    .cbar {
      flex: 1; border-radius: 2px 2px 0 0;
      background: rgba(255,255,255,0.07);
      transition: background .2s;
    }
    .cbar.on { background: var(--gold); }
    .cbar:hover { background: rgba(255,255,255,0.15); }

    .dash-trx-list {}
    .dash-trx-hd {
      padding: .75rem 1.25rem;
      font-size: .65rem; font-weight: 600; color: var(--text-mute);
      text-transform: uppercase; letter-spacing: .06em;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      display: flex; justify-content: space-between;
    }
    .trx-row {
      display: grid; grid-template-columns: 1.2fr 1.8fr .8fr 1fr;
      padding: .625rem 1.25rem;
      font-size: .72rem; color: var(--text-dim);
      border-bottom: 1px solid rgba(255,255,255,0.02);
      align-items: center; transition: background .15s;
    }
    .trx-row:hover { background: rgba(255,255,255,0.03); }
    .trx-row:last-child { border-bottom: none; }
    .trx-id { color: var(--text-mute); font-size: .65rem; }
    .trx-badge {
      display: inline-flex; align-items: center;
      padding: .15rem .5rem; border-radius: 999px;
      font-size: .6rem; font-weight: 700;
    }
    .trx-ok { background: rgba(74,222,128,0.1); color: #4ade80; }
    .trx-pend { background: rgba(232,184,75,0.12); color: var(--gold); }
    .trx-amt { font-weight: 700; color: var(--white); text-align: right; }

    /* Floating WoF card */
    .wof-float {
      position: absolute; bottom: -20px; left: -30px;
      background: var(--white);
      border-radius: var(--r16);
      padding: .875rem 1rem;
      box-shadow: 0 20px 60px rgba(6,10,15,0.4);
      min-width: 220px; z-index: 10;
    }
    .wof-label { font-size: .62rem; font-weight: 700; color: var(--navy-text); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .625rem; }
    .wof-row { display: flex; flex-direction: column; gap: .4rem; }
    .wof-item { display: flex; align-items: center; gap: .5rem; }
    .wof-av { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
    .wof-name { font-size: .75rem; font-weight: 600; color: var(--navy); }
    .wof-amt { font-size: .7rem; font-weight: 700; color: var(--gold); margin-left: auto; }

    /* ── MARQUEE STRIP ── */
    .strip {
      background: var(--navy-soft);
      height: 44px; overflow: hidden;
      display: flex; align-items: center;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .strip-track {
      display: flex; gap: 3rem;
      animation: marquee 30s linear infinite;
      white-space: nowrap;
    }
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .strip-item {
      display: flex; align-items: center; gap: .5rem;
      font-size: .75rem; font-weight: 600; color: rgba(255,255,255,0.6);
    }
    .strip-dot { color: var(--gold); opacity: .5; }

    /* ── WHITE SECTION (features, compare, faq) ── */
    .sec-white { background: var(--white); }
    .sec-navy { background: var(--navy); }
    .sec-dark { background: var(--black); }
    .sec-offwhite { background: var(--off); }

    /* ── SECTION HEADER ── */
    .s-eyebrow {
      display: inline-flex; align-items: center; gap: .5rem;
      font-size: .72rem; font-weight: 700; letter-spacing: .08em;
      text-transform: uppercase; margin-bottom: .875rem;
    }
    .s-eyebrow.gold { color: var(--gold); }
    .s-eyebrow.navy { color: var(--navy-soft); }
    .s-eyebrow.line::after { content:''; display:block; width:24px; height:2px; background:currentColor; border-radius:1px; }

    .s-h2-white {
      font-size: clamp(2rem, 3.5vw, 3rem);
      font-weight: 800; letter-spacing: -.03em; line-height: 1.1;
      color: var(--white); margin-bottom: 1rem;
    }
    .s-h2-white em { font-style: normal; color: var(--gold); }
    .s-h2-dark {
      font-size: clamp(2rem, 3.5vw, 3rem);
      font-weight: 800; letter-spacing: -.03em; line-height: 1.1;
      color: var(--navy); margin-bottom: 1rem;
    }
    .s-h2-dark em { font-style: normal; color: var(--navy-soft); }
    .s-p-white { font-size: .9rem; color: var(--text-dim); line-height: 1.75; max-width: 500px; }
    .s-p-dark { font-size: .9rem; color: var(--body-text); line-height: 1.75; max-width: 500px; }

    .s-wrap { max-width: 1280px; margin: 0 auto; padding: 5.5rem 2.5rem; }
    .s-wrap-sm { max-width: 1280px; margin: 0 auto; padding: 4rem 2.5rem; }

    /* ── FEATURES ── */
    .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3.5rem; }
    .feat-card {
      background: var(--white);
      border: 1px solid var(--border-w);
      border-radius: var(--r16);
      padding: 2rem;
      transition: all .25s;
      position: relative; overflow: hidden;
      box-shadow: 0 2px 12px rgba(10,22,40,0.06);
    }
    .feat-card::before {
      content: '';
      position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--navy), var(--navy-soft));
      transform: scaleX(0); transform-origin: left;
      transition: transform .3s;
    }
    .feat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(10,22,40,0.12); }
    .feat-card:hover::before { transform: scaleX(1); }
    .feat-icon-wrap {
      width: 48px; height: 48px; border-radius: var(--r12);
      background: linear-gradient(135deg, var(--navy), var(--navy-soft));
      display: flex; align-items: center; justify-content: center;
      color: var(--gold); margin-bottom: 1.25rem;
      box-shadow: 0 8px 20px rgba(10,22,40,0.2);
    }
    .feat-title { font-size: 1.05rem; font-weight: 700; color: var(--navy); margin-bottom: .5rem; letter-spacing: -.01em; }
    .feat-desc { font-size: .84rem; color: var(--body-text); line-height: 1.7; }

    /* ── DEMO ── */
    .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 3.5rem; }
    .demo-card {
      background: var(--navy-lit);
      border: 1px solid var(--border-n);
      border-radius: var(--r16);
      overflow: hidden;
      transition: all .25s;
    }
    .demo-card:hover { transform: translateY(-3px); box-shadow: 0 30px 60px rgba(6,10,15,0.4); border-color: rgba(232,184,75,0.2); }
    .demo-thumb {
      aspect-ratio: 16/9; position: relative; overflow: hidden;
      background: var(--navy-mid);
    }
    .demo-thumb-bg { position: absolute; inset: 0; padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
    .demo-mock-bar { height: 20px; background: rgba(255,255,255,0.05); border-radius: var(--r4); }
    .demo-mock-grid { flex: 1; display: grid; grid-template-columns: .8fr 2fr; gap: .5rem; }
    .demo-mock-side { background: rgba(255,255,255,0.04); border-radius: var(--r4); }
    .demo-mock-main { display: flex; flex-direction: column; gap: .35rem; }
    .demo-mock-row { background: rgba(255,255,255,0.04); border-radius: var(--r4); flex: 1; }
    .demo-overlay {
      position: absolute; inset: 0; background: rgba(10,22,40,0.6);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .2s;
    }
    .demo-card:hover .demo-overlay { opacity: 1; }
    .demo-play-btn {
      width: 52px; height: 52px; border-radius: 50%;
      background: var(--gold); color: var(--navy);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 30px var(--gold-glow);
    }
    .demo-body { padding: 1.5rem; }
    .demo-tag { font-size: .68rem; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: .08em; margin-bottom: .4rem; }
    .demo-title { font-size: 1.15rem; font-weight: 700; color: var(--white); margin-bottom: .3rem; letter-spacing: -.01em; }
    .demo-desc { font-size: .82rem; color: var(--text-dim); margin-bottom: 1.1rem; }
    .demo-link {
      display: inline-flex; align-items: center; gap: .35rem;
      font-size: .8rem; font-weight: 600; color: var(--gold);
      text-decoration: none; transition: gap .15s;
    }
    .demo-link:hover { gap: .55rem; }

    /* ── CALCULATOR ── */
    .calc-wrap {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 2rem; margin-top: 3.5rem;
    }
    .calc-panel {
      background: var(--white);
      border: 1px solid var(--border-w);
      border-radius: var(--r16);
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(10,22,40,0.06);
    }
    .plan-row { display: flex; gap: .5rem; margin-bottom: 2rem; }
    .plan-btn {
      flex: 1; padding: .625rem;
      background: var(--off); border: 1.5px solid transparent;
      border-radius: var(--r8); color: var(--body-text);
      font-weight: 600; font-size: .8rem;
      cursor: pointer; transition: all .2s;
      font-family: var(--ff);
    }
    .plan-btn.active {
      background: var(--navy); color: var(--white);
      border-color: var(--navy);
      box-shadow: 0 4px 16px rgba(10,22,40,0.25);
    }
    .c-label {
      font-size: .72rem; font-weight: 700; color: var(--navy-text);
      text-transform: uppercase; letter-spacing: .05em;
      margin-bottom: .4rem; display: flex; justify-content: space-between; align-items: center;
    }
    .c-chip {
      background: rgba(10,22,40,0.08); color: var(--navy-soft);
      padding: .15rem .5rem; border-radius: var(--r4);
      font-size: .7rem; font-weight: 700;
    }
    .c-field { position: relative; margin-bottom: 1.5rem; }
    .c-pfx { position: absolute; left: .875rem; top: 50%; transform: translateY(-50%); font-size: .72rem; font-weight: 600; color: var(--navy-text); }
    .c-input {
      width: 100%; padding: .75rem .875rem .75rem 2.75rem;
      background: var(--off); border: 1.5px solid rgba(10,22,40,0.1);
      border-radius: var(--r8); color: var(--navy);
      font-weight: 700; font-size: .95rem; font-family: var(--ff);
      outline: none; transition: border-color .15s;
    }
    .c-input:focus { border-color: var(--navy-soft); background: var(--white); }
    .c-input[readonly] { cursor: default; color: var(--body-text); }
    .c-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; outline: none; cursor: pointer; accent-color: var(--navy); margin-top: .5rem; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--navy); box-shadow: 0 2px 8px rgba(10,22,40,0.3); }
    .range-meta { display: flex; justify-content: space-between; margin-top: .35rem; font-size: .68rem; color: var(--body-text); }

    .result-panel {
      background: linear-gradient(145deg, var(--navy) 0%, var(--navy-soft) 100%);
      border-radius: var(--r16); padding: 2rem;
      display: flex; flex-direction: column; justify-content: space-between;
      position: relative; overflow: hidden;
      box-shadow: 0 20px 60px rgba(10,22,40,0.4);
    }
    .result-panel::before {
      content: '';
      position: absolute; top: -40px; right: -40px;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(232,184,75,0.15), transparent 70%);
      pointer-events: none;
    }
    .r-label { font-size: .72rem; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: .08em; margin-bottom: .5rem; }
    .r-val {
      font-size: clamp(2rem, 3.5vw, 3rem);
      font-weight: 800; letter-spacing: -.03em; line-height: 1.05;
      color: var(--white); margin-bottom: .5rem;
    }
    .r-note { font-size: .75rem; color: var(--text-mute); margin-bottom: 1.75rem; }
    .r-tags { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 2rem; }
    .r-tag {
      font-size: .7rem; font-weight: 600;
      color: rgba(255,255,255,0.5);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      padding: .3rem .75rem; border-radius: 999px;
    }

    /* ── PLANS ── */
    .billing-toggle-wrap {
      display: flex; align-items: center; gap: 1rem;
      margin-bottom: 2.5rem; flex-wrap: wrap;
    }
    .b-toggle {
      display: flex; background: rgba(255,255,255,0.06);
      border: 1px solid var(--border-n);
      border-radius: 999px; padding: .3rem;
    }
    .b-tab {
      padding: .45rem 1.25rem; border-radius: 999px;
      background: transparent; color: var(--text-dim);
      font-weight: 600; font-size: .8rem;
      border: none; cursor: pointer; transition: all .2s;
      font-family: var(--ff); position: relative;
    }
    .b-tab.on { background: var(--white); color: var(--navy); box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
    .b-save {
      font-size: .7rem; font-weight: 700; color: var(--gold);
      background: var(--gold-dim); border: 1px solid rgba(232,184,75,0.25);
      padding: .3rem .875rem; border-radius: 999px;
    }

    .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; align-items: end; }

    .plan-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border-n);
      border-radius: var(--r16);
      overflow: hidden; transition: all .25s;
    }
    .plan-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.14); }
    .plan-card.featured {
      background: var(--white);
      border-color: transparent;
      transform: translateY(-12px);
      box-shadow: 0 40px 80px rgba(6,10,15,0.5);
    }
    .plan-card.featured:hover { transform: translateY(-16px); }

    .plan-chip {
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      padding: .625rem;
      background: var(--gold); color: var(--navy);
      font-size: .7rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
    }
    .plan-body { padding: 2rem; }
    .plan-name { font-size: 1.5rem; font-weight: 800; letter-spacing: -.02em; margin-bottom: .3rem; }
    .plan-name.dark { color: var(--navy); }
    .plan-name.light { color: var(--white); }
    .plan-desc { font-size: .8rem; padding-bottom: 1.5rem; border-bottom: 1px solid; margin-bottom: 1.5rem; }
    .plan-desc.dark { color: var(--body-text); border-color: rgba(10,22,40,0.08); }
    .plan-desc.light { color: var(--text-dim); border-color: var(--border-n); }
    .plan-orig { font-size: .78rem; text-decoration: line-through; margin-bottom: .2rem; }
    .plan-orig.dark { color: #a0aec0; }
    .plan-orig.light { color: var(--text-mute); }
    .plan-price { font-size: 2rem; font-weight: 800; letter-spacing: -.04em; line-height: 1; margin-bottom: .3rem; }
    .plan-price.dark { color: var(--navy); }
    .plan-price.light { color: var(--white); }
    .plan-period { font-size: .72rem; font-weight: 600; margin-bottom: 1.5rem; }
    .plan-period.dark { color: var(--body-text); }
    .plan-period.light { color: var(--text-dim); }
    .plan-cta {
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      width: 100%; padding: .8rem;
      border-radius: var(--r8); font-weight: 700; font-size: .85rem;
      text-decoration: none; margin-bottom: 1.75rem;
      transition: all .2s; border: none; cursor: pointer;
      font-family: var(--ff);
    }
    .plan-cta.navy-fill { background: var(--navy); color: var(--white); box-shadow: 0 4px 18px rgba(10,22,40,0.35); }
    .plan-cta.navy-fill:hover { background: var(--navy-soft); transform: translateY(-1px); }
    .plan-cta.gold-fill { background: var(--gold); color: var(--navy); box-shadow: 0 4px 18px var(--gold-glow); }
    .plan-cta.gold-fill:hover { background: #f0c55a; transform: translateY(-1px); }
    .plan-cta.ghost-w { background: rgba(255,255,255,0.06); color: var(--white); border: 1px solid var(--border-n); }
    .plan-cta.ghost-w:hover { background: rgba(255,255,255,0.1); }
    .plan-feats { display: flex; flex-direction: column; gap: .75rem; }
    .pf { display: flex; align-items: flex-start; gap: .5rem; font-size: .82rem; }
    .pf.off { opacity: .35; }
    .pf-i { flex-shrink: 0; margin-top: 1px; }
    .pf-on-navy { color: var(--navy-soft); }
    .pf-on-gold { color: var(--gold); }
    .pf-off-c { color: #a0aec0; }
    .pf-text-dark { color: var(--navy); }
    .pf-text-light { color: var(--text-dim); }

    /* ── COMPARISON TABLE ── */
    .cmp { border: 1px solid var(--border-w); border-radius: var(--r16); overflow: hidden; margin-top: 3rem; }
    .cmp-head { display: grid; grid-template-columns: 2fr 1fr 1fr; background: var(--navy); }
    .cmp-th { padding: 1rem 1.5rem; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
    .cmp-th.label { color: rgba(255,255,255,0.4); }
    .cmp-th.bad { color: #f87171; text-align: center; border-left: 1px solid var(--border-n); }
    .cmp-th.good { color: var(--gold); text-align: center; border-left: 1px solid var(--border-n); }
    .cmp-row { display: grid; grid-template-columns: 2fr 1fr 1fr; border-bottom: 1px solid var(--border-w); transition: background .15s; }
    .cmp-row:hover { background: rgba(10,22,40,0.03); }
    .cmp-row:last-child { border-bottom: none; }
    .cmp-td { padding: .875rem 1.5rem; font-size: .84rem; color: var(--navy); font-weight: 500; }
    .cmp-td.bad { color: #ef4444; border-left: 1px solid var(--border-w); text-align: center; }
    .cmp-td.good { color: #16a34a; border-left: 1px solid var(--border-w); text-align: center; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: .3rem; }
    .cmp-foot { display: grid; grid-template-columns: 2fr 1fr 1fr; background: var(--navy); }
    .cmp-ft { padding: 1.1rem 1.5rem; }
    .cmp-ft.label { font-size: .72rem; font-weight: 700; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: .06em; display: flex; align-items: center; }
    .cmp-ft.bad { border-left: 1px solid var(--border-n); text-align: center; }
    .cmp-ft.good { border-left: 1px solid var(--border-n); text-align: center; }
    .cmp-ft-val { font-size: 1.1rem; font-weight: 800; }
    .cmp-ft-val.red { color: #f87171; }
    .cmp-ft-val.green { color: var(--gold); }

    /* ── ACADEMY ── */
    .academy-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; margin-top: 3.5rem; }
    .ac-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border-n);
      border-radius: var(--r16);
      padding: 1.75rem;
      cursor: pointer; position: relative; overflow: hidden;
      transition: all .25s;
    }
    .ac-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(232,184,75,0.3); transform: translateY(-3px); }
    .ac-num {
      font-size: 3.5rem; font-weight: 800; color: rgba(255,255,255,0.06);
      line-height: 1; margin-bottom: 1.25rem; letter-spacing: -.04em;
      transition: color .25s;
    }
    .ac-card:hover .ac-num { color: rgba(232,184,75,0.15); }
    .ac-icon { color: var(--gold); margin-bottom: .875rem; }
    .ac-title { font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: .35rem; letter-spacing: -.01em; }
    .ac-desc { font-size: .78rem; color: var(--text-dim); line-height: 1.6; }
    .ac-arrow { position: absolute; top: 1.5rem; right: 1.5rem; color: var(--text-mute); transition: color .2s, transform .2s; }
    .ac-card:hover .ac-arrow { color: var(--gold); transform: translate(2px,-2px); }

    /* ── TESTIMONIALS ── */
    .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3.5rem; }
    .testi-card {
      background: var(--white);
      border: 1px solid var(--border-w);
      border-radius: var(--r16);
      padding: 2rem;
      transition: all .25s;
      box-shadow: 0 2px 12px rgba(10,22,40,0.06);
    }
    .testi-card:hover { transform: translateY(-3px); box-shadow: 0 20px 50px rgba(10,22,40,0.1); }
    .testi-stars { display: flex; gap: .2rem; margin-bottom: 1rem; }
    .testi-quote {
      font-size: .87rem; color: var(--body-text); line-height: 1.75;
      margin-bottom: 1.5rem; font-style: italic;
      border-left: 3px solid var(--navy); padding-left: 1rem;
    }
    .testi-foot { display: flex; align-items: center; gap: .75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-w); }
    .testi-av {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--navy), var(--navy-soft));
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; color: var(--white); font-size: 1rem; flex-shrink: 0;
    }
    .testi-name { font-weight: 700; font-size: .85rem; color: var(--navy); }
    .testi-role { font-size: .72rem; color: var(--body-text); margin-top: .1rem; }

    /* ── FAQ ── */
    .faq-list { max-width: 720px; margin: 3rem auto 0; }
    .faq-item {
      border: 1px solid var(--border-w);
      border-radius: var(--r12); margin-bottom: .75rem;
      overflow: hidden; transition: border-color .2s;
      background: var(--white);
    }
    .faq-item[open] { border-color: var(--navy-soft); }
    .faq-q {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 1.5rem; cursor: pointer; list-style: none;
      font-weight: 600; font-size: .9rem; color: var(--navy);
      transition: background .15s;
    }
    .faq-q::-webkit-details-marker { display: none; }
    .faq-q:hover { background: var(--off); }
    .faq-icon { flex-shrink: 0; color: var(--navy-text); transition: transform .25s; }
    details[open] .faq-icon { transform: rotate(45deg); color: var(--navy-soft); }
    .faq-a {
      padding: 0 1.5rem 1.1rem;
      font-size: .83rem; color: var(--body-text); line-height: 1.75; font-weight: 400;
      border-top: 1px solid var(--border-w); padding-top: 1rem; margin: 0 1.5rem .25rem;
    }

    /* ── DOMAIN ── */
    .domain-box {
      max-width: 620px; margin: 2.5rem auto 0;
      display: flex;
      background: var(--white);
      border: 1.5px solid var(--border-w);
      border-radius: var(--r12);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(10,22,40,0.1);
      transition: border-color .2s;
    }
    .domain-box:focus-within { border-color: var(--navy-soft); box-shadow: 0 0 0 4px rgba(19,37,68,0.1); }
    .domain-ico { padding: 0 .875rem; color: var(--navy-text); display: flex; align-items: center; }
    .domain-in {
      flex: 1; padding: .875rem 0;
      background: transparent; border: none; outline: none;
      color: var(--navy); font-size: .9rem; font-family: var(--ff);
    }
    .domain-in::placeholder { color: #a0aec0; }
    .domain-sel {
      background: var(--off); border: none; border-left: 1px solid var(--border-w);
      color: var(--body-text); padding: 0 .875rem;
      font-family: var(--ff); font-size: .8rem; outline: none; cursor: pointer;
    }
    .domain-btn {
      padding: 0 1.5rem; background: var(--navy); color: var(--white); border: none; cursor: pointer;
      font-family: var(--ff); font-size: .82rem; font-weight: 700;
      display: flex; align-items: center; gap: .35rem; transition: background .15s;
    }
    .domain-btn:hover { background: var(--navy-soft); }

    /* ── CTA ── */
    .cta-section {
      background: linear-gradient(145deg, var(--black) 0%, var(--navy) 60%);
      padding: 8rem 2.5rem;
      text-align: center; position: relative; overflow: hidden;
    }
    .cta-section::before {
      content: '';
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 600px; height: 400px;
      background: radial-gradient(ellipse, rgba(232,184,75,0.08), transparent 70%);
      pointer-events: none;
    }
    .cta-h {
      font-size: clamp(2.2rem, 4.5vw, 4rem);
      font-weight: 800; letter-spacing: -.04em; line-height: 1.1;
      color: var(--white); max-width: 700px; margin: 0 auto 2.5rem;
      position: relative; z-index: 2;
    }
    .cta-h em { font-style: normal; color: var(--gold); }

    /* ── FOOTER ── */
    .footer {
      background: var(--black);
      padding: 1.5rem 2.5rem;
      display: flex; align-items: center; justify-content: space-between;
      border-top: 1px solid rgba(255,255,255,0.04);
      flex-wrap: wrap; gap: 1rem;
    }
    .footer-copy { font-size: .75rem; color: rgba(255,255,255,0.25); letter-spacing: .02em; }

    /* ANIMS */
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    .a1{animation:fadeUp .5s ease both .1s}.a2{animation:fadeUp .5s ease both .2s}.a3{animation:fadeUp .5s ease both .32s}.a4{animation:fadeUp .5s ease both .46s}.a5{animation:fadeUp .5s ease both .62s}

    @media(max-width:920px){
      .hero-inner{grid-template-columns:1fr;padding:3rem 1.5rem}
      .dash-card{display:none}
      .feat-grid,.plans-grid,.testi-grid,.academy-grid{grid-template-columns:1fr}
      .demo-grid,.calc-wrap{grid-template-columns:1fr}
      .cta-section{padding:5rem 1.5rem}
      .nav-links,.nav-login{display:none}
      .s-wrap,.s-wrap-sm{padding:4rem 1.5rem}
      .cmp-row{grid-template-columns:1fr}
    }
  `}</style>
);

const BARS = [28, 44, 36, 58, 45, 70, 54, 82, 64, 75, 60, 88, 70, 80, 65, 93, 76, 88];
const TRX = [
    { id: '#7821', game: 'MLBB 148 Diamonds', st: 'ok', amt: 'Rp 42.500' },
    { id: '#7820', game: 'Free Fire 70 Diamonds', st: 'ok', amt: 'Rp 11.000' },
    { id: '#7819', game: 'PUBG 60 UC', st: 'pend', amt: 'Rp 14.500' },
    { id: '#7818', game: 'MLBB 86 Diamonds', st: 'ok', amt: 'Rp 21.000' },
];
const WOF = [
    { name: "Fantasi Gamer", profit: "Rp27.8Jt", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fantasi" },
    { name: "Arb Store", profit: "Rp24.5Jt", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arb" },
    { name: "Rolly Store", profit: "Rp18.1Jt", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rolly" },
];
const STRIP = ["MLBB +2.1%", "Free Fire +1.8%", "PUBG M +3.2%", "Genshin -0.5%", "Honkai SR +4.1%", "COD Mobile +2.7%", "Total Trx Hari Ini 14,821", "Reseller Aktif 3,204"];
const RESELLER_PLANS = [{ id: 'PRO', name: 'Pro' }, { id: 'LEGEND', name: 'Legend' }, { id: 'SUPREME', name: 'Supreme' }];

export default function ResellerLandingPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('PRO');
    const [hargaModal, setHargaModal] = useState(37500);
    const [hargaJual, setHargaJual] = useState(40000);
    const [jumlahPenjualan, setJumlahPenjualan] = useState(20);
    const [sampleProducts, setSampleProducts] = useState<any[]>([]);
    const [billingCycle, setBillingCycle] = useState<'yearly' | 'quarterly'>('yearly');
    const MLBB: any = { pro: 39709, legend: 38773, supreme: 38023, normal: 40646 };

    useEffect(() => {
        const m = MLBB[selectedPlan.toLowerCase()] || MLBB.pro;
        setHargaModal(m); setHargaJual(Math.ceil(m * 1.08 / 500) * 500);
    }, [selectedPlan]);

    const [plans, setPlans] = useState<any>({
        PRO: { price: 74917, maxProducts: 50, customDomain: true, multiUser: false, whiteLabel: false, customFeatures: [], description: "Mulai bisnis dengan mudah!" },
        LEGEND: { price: 82250, maxProducts: 500, customDomain: true, multiUser: true, whiteLabel: false, customFeatures: [], description: "Naik level, untung berlipat!" },
        SUPREME: { price: 99917, maxProducts: 99999, customDomain: true, multiUser: true, whiteLabel: true, customFeatures: [], description: "Fitur terlengkap, untung maksimal!" },
    });

    const gpd = (p: number) => {
        if (!p) p = 0; const o = p * 2.5;
        if (billingCycle === 'yearly') return { original: o, discounted: p, label: '/ tahun', mo: p / 12 };
        const q = Math.round(p * .3); return { original: o * .3, discounted: q, label: '/ 3 bulan', mo: q / 3 };
    };

    useEffect(() => {
        setIsMounted(true);
        const fb = [
            { name: 'Mobile Legends 86 Diamonds', normal: 19500, pro: 18800, legend: 18500, supreme: 18100, img: 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png' },
            { name: 'Free Fire 70 Diamonds', normal: 10000, pro: 9500, legend: 9300, supreme: 9000, img: 'https://cdn.unipin.com/images/icon_product_channels/1598282333-icon-ff.png' },
            { name: 'PUBG M 60 UC', normal: 14000, pro: 13500, legend: 13200, supreme: 12800, img: 'https://cdn.unipin.com/images/icon_product_channels/1593414902-icon-pubgm.png' },
        ];
        fetch(`http://localhost:3001/public/subscriptions/plans/features?t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache,no-store,must-revalidate', 'Pragma': 'no-cache' } })
            .then(r => r.json()).then(d => { if (d?.PRO) setPlans(d) }).catch(() => { });
        fetch('http://localhost:3001/public/products/reseller-prices')
            .then(r => r.json())
            .then(d => {
                if (Array.isArray(d) && d.length > 0) { setSampleProducts(d); const f = d[0]; const im = f.pro || f.normal || 0; setHargaModal(im); setHargaJual(Math.ceil(im * 1.1 / 100) * 100); }
                else setSampleProducts(fb);
            }).catch(() => setSampleProducts(fb));
    }, []);

    const profit = (hargaJual - hargaModal) * jumlahPenjualan * 30;
    const fmt = (n: number) => isMounted ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : `Rp ${n}`;

    const Feat = ({ on, text, light, accent }: { on: boolean, text: string, light: boolean, accent?: boolean }) => (
        <div className={`pf${on ? '' : ' off'}`}>
            {on
                ? <Check size={14} className={`pf-i ${light ? 'pf-on-gold' : 'pf-on-navy'}`} />
                : <Minus size={14} className="pf-i pf-off-c" />}
            <span className={light ? 'pf-text-light' : 'pf-text-dark'} style={accent && on ? { fontWeight: 700 } : {}}>{text}</span>
        </div>
    );

    return (
        <div className="root">
            <Styles />

            {/* NAV */}
            <nav className="nav">
                <Link href="/" className="nav-brand">
                    <div className="nav-icon">DP</div>
                    <span className="nav-name">DagangPlay</span>
                </Link>
                <div className="nav-links">
                    <a href="#features" className="nav-lk">Fitur</a>
                    <a href="#pricing" className="nav-lk">Harga Modal</a>
                    <a href="#demo" className="nav-lk">Demo</a>
                </div>
                <Link href="/admin/login" className="nav-login">Masuk</Link>
                <Link href="/reseller/register" className="nav-cta">Daftar Reseller <ArrowUpRight size={13} /></Link>
            </nav>

            {/* HERO */}
            <section className="hero">
                <div className="hero-mesh" />
                <div className="hero-grid" />
                <div className="hero-inner">
                    <div className="hero-left">
                        <div className="hero-tag a1"><span className="hero-tag-dot" />&nbsp;Platform Reseller #1 Indonesia</div>
                        <h1 className="hero-h1 a2">
                            Buat Web Top Up.<br />
                            <span className="hl">Tidur Pun<br />Cuan Masuk.</span>
                        </h1>
                        <p className="hero-p a3">Sistem otomatis kami yang bekerja keras. Kamu yang terima profitnya. Tanpa deposit, tanpa ribet — langsung jalan dari hari pertama.</p>
                        <div className="hero-btns a4">
                            <Link href="/reseller/register" className="btn-gold">Mulai Sekarang <ArrowRight size={15} /></Link>
                            <a href="#pricing" className="btn-ghost-w">Cek Harga Modal</a>
                        </div>
                        <div className="hero-stats a5">
                            <div className="hero-stat">
                                <div className="hero-sv">Rp<span className="g">1,9M</span></div>
                                <div className="hero-sl">Total Omzet Reseller</div>
                            </div>
                            <div className="hero-divider" />
                            <div className="hero-stat">
                                <div className="hero-sv">Rp<span className="g">40M+</span></div>
                                <div className="hero-sl">Nilai Transaksi</div>
                            </div>
                            <div className="hero-divider" />
                            <div className="hero-stat">
                                <div className="hero-sv"><span className="g">14K+</span></div>
                                <div className="hero-sl">Trx Hari Ini</div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Mockup */}
                    <div className="hero-right">
                        <div className="dash-card">
                            <div className="dash-top">
                                <div className="dash-top-l">
                                    <div className="dot-row">
                                        <div className="dot" style={{ background: '#ff5f57' }} />
                                        <div className="dot" style={{ background: '#febc2e' }} />
                                        <div className="dot" style={{ background: '#28c840' }} />
                                    </div>
                                    <span className="dash-title">Dashboard Reseller — Bulan Ini</span>
                                </div>
                                <span className="dash-live">Live</span>
                            </div>
                            <div className="dash-metrics">
                                {[{ l: 'Omzet', v: 'Rp27.8Jt', d: '▲ 12.4%' }, { l: 'Transaksi', v: '1,284', d: '▲ 8.1%' }, { l: 'Profit Bersih', v: 'Rp4.2Jt', d: '▲ 19.7%' }].map((m, i) => (
                                    <div key={i} className="dash-m">
                                        <div className="dash-ml">{m.l}</div>
                                        <div className="dash-mv">{m.v}</div>
                                        <div className="dash-md">{m.d}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="dash-chart">
                                <div className="dash-cl">Transaksi 18 Hari Terakhir</div>
                                <div className="chart-bars">
                                    {BARS.map((h, i) => <div key={i} className={`cbar${i === BARS.length - 1 ? ' on' : ''}`} style={{ height: `${h}%` }} />)}
                                </div>
                            </div>
                            <div className="dash-trx-list">
                                <div className="dash-trx-hd"><span>Transaksi Terbaru</span><span>auto-refresh</span></div>
                                {TRX.map((t, i) => (
                                    <div key={i} className="trx-row">
                                        <span className="trx-id">{t.id}</span>
                                        <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.6)' }}>{t.game}</span>
                                        <span className={`trx-badge ${t.st === 'ok' ? 'trx-ok' : 'trx-pend'}`}>{t.st === 'ok' ? 'Sukses' : 'Proses'}</span>
                                        <span className="trx-amt">{t.amt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Floating WoF */}
                        <div className="wof-float">
                            <div className="wof-label">🏆 Top Reseller Bulan Ini</div>
                            <div className="wof-row">
                                {WOF.map((r, i) => (
                                    <div key={i} className="wof-item">
                                        <img src={r.img} alt={r.name} className="wof-av" />
                                        <span className="wof-name">{r.name}</span>
                                        <span className="wof-amt">{r.profit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STRIP */}
            <div className="strip">
                <div className="strip-track">
                    {[...STRIP, ...STRIP].map((s, i) => (
                        <span key={i} className="strip-item">{s}<span className="strip-dot"> ✦ </span></span>
                    ))}
                </div>
            </div>

            {/* FEATURES */}
            <div className="sec-white" id="features">
                <div className="s-wrap">
                    <div style={{ maxWidth: 560 }}>
                        <div className="s-eyebrow navy line">Kenapa DagangPlay?</div>
                        <h2 className="s-h2-dark">Sistem yang Bekerja<br /><em>Lebih Keras Darimu</em></h2>
                        <p className="s-p-dark">Fokus ke jualan. Server, teknis, stok, payment — semua kami yang urus sampai beres.</p>
                    </div>
                    <div className="feat-grid">
                        {[
                            { icon: <Coins size={20} />, title: "Tanpa Modal Deposit", desc: "Mulai tanpa setoran awal. Jualan produk digital tanpa risiko kehilangan modal sepeserpun." },
                            { icon: <TrendingUp size={20} />, title: "Bebas Atur Margin", desc: "Tentukan sendiri margin keuntunganmu. 20%, 50%, atau 100%? Strategi ada di tanganmu." },
                            { icon: <ShieldCheck size={20} />, title: "All-in-One Siap Pakai", desc: "Website, domain, server, dan payment gateway sudah terpasang. Tinggal bawa pelanggan." },
                        ].map((f, i) => (
                            <div key={i} className="feat-card">
                                <div className="feat-icon-wrap">{f.icon}</div>
                                <div className="feat-title">{f.title}</div>
                                <div className="feat-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* DEMO */}
            <div className="sec-navy" id="demo">
                <div className="s-wrap">
                    <div style={{ maxWidth: 560 }}>
                        <div className="s-eyebrow gold line">Demo Live</div>
                        <h2 className="s-h2-white">Jangan Beli Kucing <em>Dalam Karung</em></h2>
                        <p className="s-p-white">Rasakan sendiri jadi owner. Login, atur harga, dan lihat betapa mudahnya sistem kami.</p>
                    </div>
                    <div className="demo-grid">
                        <div className="demo-card">
                            <div className="demo-thumb">
                                <div className="demo-thumb-bg">
                                    <div className="demo-mock-bar" />
                                    <div className="demo-mock-grid">
                                        <div className="demo-mock-side" />
                                        <div className="demo-mock-main">{[1, 2, 3].map(i => <div key={i} className="demo-mock-row" />)}</div>
                                    </div>
                                </div>
                                <div className="demo-overlay"><div className="demo-play-btn"><Play size={20} fill="currentColor" /></div></div>
                            </div>
                            <div className="demo-body">
                                <div className="demo-tag">Panel Admin</div>
                                <div className="demo-title">Demo Panel Reseller</div>
                                <div className="demo-desc">Jelajahi semua fitur dashboard reseller secara langsung</div>
                                <Link href="/admin/login" className="demo-link">Login Sebagai Admin <ArrowUpRight size={13} /></Link>
                            </div>
                        </div>
                        <div className="demo-card">
                            <div className="demo-thumb" style={{ background: 'var(--navy-soft)' }}>
                                <div className="demo-thumb-bg">
                                    <div className="demo-mock-bar" style={{ background: 'rgba(255,255,255,0.08)' }} />
                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.35rem' }}>
                                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '4px' }} />)}
                                    </div>
                                </div>
                                <div className="demo-overlay"><div className="demo-play-btn"><Play size={20} fill="currentColor" /></div></div>
                            </div>
                            <div className="demo-body">
                                <div className="demo-tag">Storefront</div>
                                <div className="demo-title">Demo Tema Website</div>
                                <div className="demo-desc">Preview tampilan toko top up yang akan dilihat pelangganmu</div>
                                <a href="#" className="demo-link" style={{ color: 'rgba(255,255,255,0.5)' }}>Buka Demo <ArrowUpRight size={13} /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CALCULATOR */}
            <div className="sec-white">
                <div className="s-wrap">
                    <div style={{ maxWidth: 560 }}>
                        <div className="s-eyebrow navy line">Simulasi Profit</div>
                        <h2 className="s-h2-dark">Hitung <em>Cuan</em> Bulananmu</h2>
                        <p className="s-p-dark">Gunakan harga modal terbaik kami dan simulasikan penghasilan nyata kamu.</p>
                    </div>
                    <div className="calc-wrap">
                        <div className="calc-panel">
                            <div className="c-label" style={{ marginBottom: '.5rem' }}><span>Pilih Paket</span></div>
                            <div className="plan-row">
                                {RESELLER_PLANS.map(p => (
                                    <button key={p.id} className={`plan-btn${selectedPlan === p.id ? ' active' : ''}`} onClick={() => setSelectedPlan(p.id)}>{p.name}</button>
                                ))}
                            </div>
                            <div className="c-row">
                                <div>
                                    <div className="c-label"><span>Harga Modal {selectedPlan}</span></div>
                                    <div className="c-field">
                                        <span className="c-pfx">Rp</span>
                                        <input type="text" readOnly value={hargaModal.toLocaleString('id-ID')} className="c-input" />
                                    </div>
                                </div>
                                <div>
                                    <div className="c-label"><span>Harga Jual Kamu</span></div>
                                    <div className="c-field">
                                        <span className="c-pfx">Rp</span>
                                        <input type="number" value={hargaJual} onChange={e => setHargaJual(Number(e.target.value))} className="c-input" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="c-label">
                                    <span>Target Penjualan / Hari</span>
                                    <span className="c-chip">{jumlahPenjualan} Order</span>
                                </div>
                                <input type="range" min="1" max="500" value={jumlahPenjualan} onChange={e => setJumlahPenjualan(Number(e.target.value))} />
                                <div className="range-meta"><span>Santai (1)</span><span>Maksimal (500)</span></div>
                            </div>
                        </div>
                        <div className="result-panel">
                            <div>
                                <div className="r-label">Estimasi Profit / Bulan</div>
                                <div className="r-val">{fmt(profit)}</div>
                                <div className="r-note">Estimasi kotor. Belum dikurangi biaya operasional.</div>
                                <div className="r-tags">
                                    <span className="r-tag">Website Siap Pakai</span>
                                    <span className="r-tag">Tanpa Deposit</span>
                                    <span className="r-tag">Bayar Per Trx</span>
                                </div>
                            </div>
                            <Link href="/reseller/register" className="btn-gold" style={{ justifyContent: 'center', width: '100%', fontSize: '.9rem', padding: '1rem' }}>
                                Daftar Sekarang <ArrowRight size={15} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* PLANS */}
            <div className="sec-navy" id="subscription">
                <div className="s-wrap">
                    <div style={{ maxWidth: 560, marginBottom: '2.5rem' }}>
                        <div className="s-eyebrow gold line">Paket Langganan</div>
                        <h2 className="s-h2-white">Pilih Senjata <em>Bisnismu</em></h2>
                        <p className="s-p-white">Harga modal transparan. Semua sistem siap 100%, langsung jalan dari hari pertama.</p>
                    </div>
                    <div className="billing-toggle-wrap">
                        <div className="b-toggle">
                            <button className={`b-tab${billingCycle === 'quarterly' ? ' on' : ''}`} onClick={() => setBillingCycle('quarterly')}>3 Bulan</button>
                            <button className={`b-tab${billingCycle === 'yearly' ? ' on' : ''}`} onClick={() => setBillingCycle('yearly')}>Tahunan</button>
                        </div>
                        {billingCycle === 'yearly' && <span className="b-save">Hemat hingga 60%</span>}
                    </div>
                    <div className="plans-grid">
                        {/* PRO */}
                        <div className="plan-card">
                            <div className="plan-body">
                                <div className="plan-name light">Pro</div>
                                <div className="plan-desc light">{plans.PRO.description}</div>
                                <div className="plan-orig light">Rp {gpd(plans.PRO.price).original.toLocaleString('id-ID')}</div>
                                <div className="plan-price light">Rp {Math.round(gpd(plans.PRO.price).discounted).toLocaleString('id-ID')}</div>
                                <div className="plan-period light">{gpd(plans.PRO.price).label} · Rp {Math.round(gpd(plans.PRO.price).mo).toLocaleString('id-ID')}/bln</div>
                                <Link href="/reseller/register" className="plan-cta ghost-w">Daftar Sekarang <ArrowRight size={13} /></Link>
                                <div className="plan-feats">
                                    <div className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">Maks. <b>{plans.PRO.maxProducts.toLocaleString('id-ID')}</b> Produk</span></div>
                                    <Feat on={plans.PRO.customDomain} text="Custom Domain" light={true} />
                                    <Feat on={plans.PRO.multiUser} text="Multi User / Akun Staff" light={true} />
                                    <Feat on={plans.PRO.whiteLabel} text="White Label" light={true} />
                                    <div className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">Harga Modal Tier Pro</span></div>
                                    <div className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">Auto-Transfer (Tanpa Deposit)</span></div>
                                    {plans.PRO.customFeatures?.map((f: string, i: number) => f && <div key={i} className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">{f}</span></div>)}
                                </div>
                            </div>
                        </div>

                        {/* SUPREME */}
                        <div className="plan-card featured">
                            <div className="plan-chip"><Star size={12} fill="currentColor" /> Paling Banjir Cuan</div>
                            <div className="plan-body">
                                <div className="plan-name dark">Supreme</div>
                                <div className="plan-desc dark">{plans.SUPREME.description}</div>
                                <div className="plan-orig dark">Rp {gpd(plans.SUPREME.price).original.toLocaleString('id-ID')}</div>
                                <div className="plan-price dark" style={{ color: 'var(--navy)' }}>Rp {Math.round(gpd(plans.SUPREME.price).discounted).toLocaleString('id-ID')}</div>
                                <div className="plan-period dark">{gpd(plans.SUPREME.price).label} · Rp {Math.round(gpd(plans.SUPREME.price).mo).toLocaleString('id-ID')}/bln</div>
                                <Link href="/reseller/register" className="plan-cta navy-fill">Daftar Sekarang <Zap size={13} /></Link>
                                <div className="plan-feats">
                                    <div className="pf"><Check size={14} className="pf-i pf-on-navy" /><span className="pf-text-dark">Maks. <b>{plans.SUPREME.maxProducts.toLocaleString('id-ID')}</b> Produk</span></div>
                                    <Feat on={plans.SUPREME.customDomain} text="Custom Domain Bebas" light={false} />
                                    <Feat on={plans.SUPREME.multiUser} text="Multi User + Akun Staff" light={false} />
                                    <div className={`pf${plans.SUPREME.whiteLabel ? '' : ' off'}`}>{plans.SUPREME.whiteLabel ? <Check size={14} className="pf-i pf-on-navy" /> : <Minus size={14} className="pf-i pf-off-c" />}<span className="pf-text-dark" style={plans.SUPREME.whiteLabel ? { fontWeight: 700 } : {}}>{plans.SUPREME.whiteLabel ? 'Full White Label Brand Kamu' : 'White Label'}</span></div>
                                    <div className="pf"><Check size={14} className="pf-i pf-on-navy" /><span className="pf-text-dark" style={{ fontWeight: 700 }}>Harga Modal VIP — Termurah</span></div>
                                    <div className="pf"><Check size={14} className="pf-i pf-on-navy" /><span className="pf-text-dark">Auto-Transfer (Tanpa Deposit)</span></div>
                                    {plans.SUPREME.customFeatures?.map((f: string, i: number) => f && <div key={i} className="pf"><Check size={14} className="pf-i pf-on-navy" /><span className="pf-text-dark">{f}</span></div>)}
                                </div>
                            </div>
                        </div>

                        {/* LEGEND */}
                        <div className="plan-card">
                            <div className="plan-body">
                                <div className="plan-name light">Legend</div>
                                <div className="plan-desc light">{plans.LEGEND.description}</div>
                                <div className="plan-orig light">Rp {gpd(plans.LEGEND.price).original.toLocaleString('id-ID')}</div>
                                <div className="plan-price light">Rp {Math.round(gpd(plans.LEGEND.price).discounted).toLocaleString('id-ID')}</div>
                                <div className="plan-period light">{gpd(plans.LEGEND.price).label} · Rp {Math.round(gpd(plans.LEGEND.price).mo).toLocaleString('id-ID')}/bln</div>
                                <Link href="/reseller/register" className="plan-cta ghost-w">Daftar Sekarang <ArrowRight size={13} /></Link>
                                <div className="plan-feats">
                                    <div className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">Maks. <b>{plans.LEGEND.maxProducts.toLocaleString('id-ID')}</b> Produk</span></div>
                                    <Feat on={plans.LEGEND.customDomain} text="Custom Domain" light={true} />
                                    <Feat on={plans.LEGEND.multiUser} text="Multi User / Akun Staff" light={true} />
                                    <Feat on={plans.LEGEND.whiteLabel} text="White Label" light={true} />
                                    <div className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">Harga Modal Tier Legend</span></div>
                                    <div className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">Auto-Transfer (Tanpa Deposit)</span></div>
                                    {plans.LEGEND.customFeatures?.map((f: string, i: number) => f && <div key={i} className="pf"><Check size={14} className="pf-i pf-on-gold" /><span className="pf-text-light">{f}</span></div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CATALOG */}
            <div id="pricing" style={{ background: 'var(--off)', borderTop: '1px solid rgba(10,22,40,0.08)', borderBottom: '1px solid rgba(10,22,40,0.08)' }}>
                <PriceCatalog />
            </div>

            {/* DOMAIN */}
            <div className="sec-white">
                <div className="s-wrap-sm" style={{ textAlign: 'center' }}>
                    <div className="s-eyebrow navy line" style={{ justifyContent: 'center' }}>Amankan Domain</div>
                    <h2 className="s-h2-dark" style={{ textAlign: 'center' }}>Klaim Domain <em>Impianmu</em></h2>
                    <p className="s-p-dark" style={{ margin: '0 auto 0', textAlign: 'center' }}>Cek ketersediaan domain. Jika tersedia, klaim sebelum diambil orang lain.</p>
                    <div className="domain-box">
                        <div className="domain-ico"><Search size={14} /></div>
                        <input type="text" placeholder="nama-toko-kamu" className="domain-in" />
                        <select className="domain-sel"><option>.com</option><option>.id</option><option>.my.id</option><option>.store</option></select>
                        <button className="domain-btn"><Search size={12} /> Cek Domain</button>
                    </div>
                </div>
            </div>

            {/* COMPARISON */}
            <div className="sec-offwhite">
                <div className="s-wrap">
                    <div style={{ maxWidth: 560 }}>
                        <div className="s-eyebrow navy line">Perbandingan Biaya</div>
                        <h2 className="s-h2-dark">Kenapa Harus <em>DagangPlay?</em></h2>
                        <p className="s-p-dark">Bandingkan sendiri. Mana yang lebih masuk akal untuk bisnis kamu.</p>
                    </div>
                    <div className="cmp">
                        <div className="cmp-head">
                            <div className="cmp-th label">Komponen Biaya</div>
                            <div className="cmp-th bad">Bikin Web Sendiri</div>
                            <div className="cmp-th good">DagangPlay</div>
                        </div>
                        {[
                            { item: "Gaji Developer", own: "Rp10.000.000 × 12", dp: "Termasuk" },
                            { item: "Hosting & Domain", own: "Rp1.000.000", dp: "Termasuk" },
                            { item: "Theme / Template", own: "Rp500.000", dp: "Termasuk" },
                            { item: "Payment Gateway", own: "Rp1.000.000", dp: "Termasuk" },
                            { item: "Maintenance & Update", own: "Rp1.000.000", dp: "Termasuk" },
                            { item: "Biaya Tak Terduga", own: "Tidak Terduga", dp: "Termasuk" },
                        ].map((r, i) => (
                            <div key={i} className="cmp-row">
                                <div className="cmp-td">{r.item}</div>
                                <div className="cmp-td bad">{r.own}</div>
                                <div className="cmp-td good"><CheckCircle2 size={13} /> {r.dp}</div>
                            </div>
                        ))}
                        <div className="cmp-foot">
                            <div className="cmp-ft label">Total Tahun Pertama</div>
                            <div className="cmp-ft bad"><div className="cmp-ft-val red">± Rp 123.500.000</div></div>
                            <div className="cmp-ft good"><div className="cmp-ft-val green">Rp 0 – 750.000</div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACADEMY */}
            <div className="sec-navy">
                <div className="s-wrap">
                    <div style={{ maxWidth: 560 }}>
                        <div className="s-eyebrow gold line">DagangPlay Academy</div>
                        <h2 className="s-h2-white">Gak Bisa Jualan?<br /><em>Kami Bimbing</em> Sampai Pecah Telur</h2>
                        <p className="s-p-white">Sistem canggih plus ilmu marketing dari praktisi berpengalaman — gratis untuk semua reseller.</p>
                    </div>
                    <div className="academy-grid">
                        {[
                            { title: "Master Branding", desc: "Bangun brand yang kuat dan diingat pelanggan" },
                            { title: "Master Sales", desc: "Strategi closing yang terbukti menghasilkan" },
                            { title: "Master TikTok", desc: "Masuk FYP dan konvert jadi transaksi nyata" },
                            { title: "Master Instagram", desc: "Optimasi IG khusus bisnis top up game" },
                        ].map((m, i) => (
                            <div key={i} className="ac-card">
                                <div className="ac-num">0{i + 1}</div>
                                <div className="ac-icon"><MonitorPlay size={20} /></div>
                                <div className="ac-title">{m.title}</div>
                                <div className="ac-desc">{m.desc}</div>
                                <div className="ac-arrow"><ArrowUpRight size={16} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TESTIMONIALS */}
            <div className="sec-white">
                <div className="s-wrap">
                    <div style={{ maxWidth: 560 }}>
                        <div className="s-eyebrow navy line">Testimoni</div>
                        <h2 className="s-h2-dark">Kata Mereka yang<br />Sudah <em>Membuktikan</em></h2>
                    </div>
                    <div className="testi-grid">
                        {[
                            { name: "Budi Santoso", role: "Owner TopUp XYZ", text: "Gila sih DagangPlay, marginnya gede banget! Sebulan bisa dapet omset 50jt padahal gw cuma nyebar link di grup mabar." },
                            { name: "Siti Aminah", role: "Pelajar", text: "Awalnya iseng buat jajan, eh keterusan pas tau harganya murah. Prosesnya otomatis jadi gak ganggu waktu sekolah." },
                            { name: "Andi Wijaya", role: "Pemilik Warnet", text: "Integrasi sistemnya mantap. Warnet sepi tapi bisnis top up game jalan terus. Supportnya juga super responsif." },
                        ].map((t, i) => (
                            <div key={i} className="testi-card">
                                <div className="testi-stars">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={13} fill="#E8B84B" color="#E8B84B" />)}</div>
                                <p className="testi-quote">"{t.text}"</p>
                                <div className="testi-foot">
                                    <div className="testi-av">{t.name[0]}</div>
                                    <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="sec-offwhite">
                <div className="s-wrap" style={{ textAlign: 'center' }}>
                    <div className="s-eyebrow navy line" style={{ justifyContent: 'center' }}>FAQ</div>
                    <h2 className="s-h2-dark" style={{ textAlign: 'center' }}>Pertanyaan yang Paling <em>Sering Muncul</em></h2>
                    <div className="faq-list" style={{ textAlign: 'left' }}>
                        {[
                            { q: "Apakah ini beneran gratis?", a: "Ya, kami menyediakan paket FREE (Reseller Normal) selamanya, tanpa biaya pendaftaran." },
                            { q: "Apa bedanya Free dengan Pro/Legend/Supreme?", a: "Paket berbayar memberikan Harga Modal yang lebih murah, plus fitur-fitur prioritas eksklusif." },
                            { q: "Apakah saldo harus deposit dulu?", a: "Tidak. Kamu tidak wajib deposit saldo. Setiap pesanan bisa langsung dibayar per transaksi via Payment Gateway." },
                            { q: "Gimana cara narik keuntungan (withdraw)?", a: "Margin dari setiap transaksi masuk ke saldo DagangPlay kamu, bisa dicairkan ke rekening bank kapan saja." },
                        ].map((f, i) => (
                            <details key={i} className="faq-item">
                                <summary className="faq-q"><span>{f.q}</span><ChevronDown size={16} className="faq-icon" /></summary>
                                <div className="faq-a">{f.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <section className="cta-section">
                <div className="s-eyebrow gold line" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>Ayo Bergabung</div>
                <h2 className="cta-h">Siap Punya Kerajaan Bisnis<br />Top-Up <em>Sendiri?</em></h2>
                <Link href="/reseller/register" className="btn-gold" style={{ fontSize: '1rem', padding: '1rem 2.5rem', position: 'relative', zIndex: 2 }}>
                    Ambil Sekarang <ArrowUpRight size={17} />
                </Link>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                    <div className="nav-icon">DP</div>
                    <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '-.01em' }}>DagangPlay Partner Network</span>
                </div>
                <div className="footer-copy">© {new Date().getFullYear()} DagangPlay. All rights reserved.</div>
            </footer>
        </div>
    );
}