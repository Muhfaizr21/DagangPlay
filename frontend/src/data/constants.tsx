import React, { ReactNode } from "react";
import {
    IBolt, IMoney, IGameCtrl, IShield, IChart, IChat, IController, IDoc, ICheck, IIG, ITW, IWA, ITG
} from "@/components/Icons";

export const NAV = ["Beranda", "Produk", "Tentang Kami", "Reseller", "Kontak"];

export interface HeroCard {
    name: string;
    abbr: string;
    accent: string;
    bg: string;
    anim: string;
    delay: string;
}

export const HERO_CARDS: HeroCard[] = [
    { name: "Mobile Legends", abbr: "ML", accent: "#4FC3F7", bg: "#0d2a4f", anim: "float", delay: "0s" },
    { name: "PUBG Mobile", abbr: "PB", accent: "#FFA726", bg: "#2e1f08", anim: "float2", delay: "0.5s" },
    { name: "Free Fire", abbr: "FF", accent: "#EF5350", bg: "#1f0f08", anim: "float3", delay: "1.0s" },
    { name: "Genshin Impact", abbr: "GI", accent: "#CE93D8", bg: "#12182e", anim: "float", delay: "1.4s" },
    { name: "Valorant", abbr: "VA", accent: "#FF6B6B", bg: "#1f0808", anim: "float2", delay: "0.7s" },
];

export interface Product {
    name: string;
    abbr: string;
    from: string;
    to: string;
    accent: string;
}

export const PRODUCTS: Product[] = [
    { name: "Mobile Legends", abbr: "ML", from: "#1a4a9a", to: "#0a1a6a", accent: "#4FC3F7" },
    { name: "Free Fire", abbr: "FF", from: "#8a1a1a", to: "#4a0808", accent: "#FF7043" },
    { name: "PUBG Mobile", abbr: "PB", from: "#7a5a10", to: "#3a2a03", accent: "#FFA726" },
    { name: "Genshin Impact", abbr: "GI", from: "#2a1a5a", to: "#100836", accent: "#CE93D8" },
    { name: "Valorant", abbr: "VA", from: "#7a1a1a", to: "#3a0606", accent: "#FF6B6B" },
    { name: "Roblox", abbr: "RO", from: "#5a1a1a", to: "#2a0808", accent: "#FFA726" },
    { name: "Steam Wallet", abbr: "ST", from: "#1a2a4a", to: "#0a1428", accent: "#66B2FF" },
    { name: "Google Play", abbr: "GP", from: "#1a5a2a", to: "#083010", accent: "#00E5A0" },
];

export interface Feature {
    icon: ReactNode;
    title: string;
    desc: string;
    c: string;
}

export const FEATURES: Feature[] = [
    { icon: <IBolt />, title: "Proses Otomatis 24/7", desc: "Transaksi selesai dalam hitungan detik, kapanpun dimanapun.", c: "#38D9F5" },
    { icon: <IMoney />, title: "Harga Termurah", desc: "Harga kompetitif terbaik, margin reseller paling menggiurkan.", c: "#C9A84C" },
    { icon: <IGameCtrl />, title: "100+ Produk Game", desc: "Semua game populer tersedia lengkap dalam satu platform.", c: "#38D9F5" },
    { icon: <IShield />, title: "Sistem Anti Gagal", desc: "Jaminan uang kembali jika transaksi gagal diproses.", c: "#00E5A0" },
    { icon: <IChart />, title: "Dashboard Canggih", desc: "Pantau semua transaksi secara real-time kapan saja.", c: "#C9A84C" },
    { icon: <IChat />, title: "Support WhatsApp 24/7", desc: "Tim CS profesional siap membantu kamu 7 hari seminggu.", c: "#00E5A0" },
];

export interface Step {
    icon: ReactNode;
    num: string;
    title: string;
    desc: string;
    c: string;
}

export const STEPS: Step[] = [
    { icon: <IController />, num: "01", title: "Pilih Game", desc: "Cari dan pilih game favoritmu dari 100+ pilihan.", c: "#C9A84C" },
    { icon: <IDoc />, num: "02", title: "Isi Data", desc: "Masukkan ID game dan pilih nominal top up.", c: "#38D9F5" },
    { icon: <ICheck />, num: "03", title: "Bayar & Selesai", desc: "Bayar dan item langsung masuk ke akunmu secara otomatis.", c: "#00E5A0" },
];

export interface Testimonial {
    init: string;
    name: string;
    city: string;
    text: string;
    stars: number;
}

export const TESTI: Testimonial[] = [
    { init: "AR", name: "Ahmad Rizki", city: "Jakarta", text: "Top up ML cuma butuh 3 detik! Harganya juga paling murah dibanding platform lain, gak bikin kantong jebol.", stars: 5 },
    { init: "SN", name: "Siti Nuraini", city: "Surabaya", text: "Udah jadi reseller 6 bulan, komisinya beneran gede. Dashboard gampang dipake, laporan transaksi real-time keren!", stars: 5 },
    { init: "BW", name: "Budi Wahyono", city: "Bandung", text: "Pernah gagal sekali, langsung direfund tanpa ribet. CS-nya responsif banget via WhatsApp. Highly recommended!", stars: 5 },
];

export interface FooterCol {
    title: string;
    links: string[];
}

export const FOOTCOLS: FooterCol[] = [
    { title: "Tentang Kami", links: ["Tentang DagangPlay", "Tim Kami", "Karir", "Blog"] },
    { title: "Produk", links: ["Top Up Game", "Voucher", "Pulsa & Data", "Tagihan"] },
    { title: "Reseller", links: ["Daftar Reseller", "Dashboard", "Komisi", "Panduan"] },
];

export interface Social {
    icon: ReactNode;
    href: string;
    label: string;
}

export const SOCIALS: Social[] = [
    { icon: <IIG />, href: "#", label: "Instagram" },
    { icon: <ITW />, href: "#", label: "Twitter" },
    { icon: <IWA />, href: "#", label: "WhatsApp" },
    { icon: <ITG />, href: "#", label: "Telegram" },
];
