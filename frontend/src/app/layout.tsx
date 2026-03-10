import type { Metadata } from "next";
// import { Bebas_Neue, Syne, DM_Sans } from "next/font/google";
import "./globals.css";

/*
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const syne = Syne({
  weight: ["800"],
  subsets: ["latin"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
});
*/

export const metadata: Metadata = {
  title: "DagangPlay – Top Up Games Tercepat & Termurah",
  description:
    "Platform top up voucher game terpercaya. 100+ game tersedia, proses otomatis 24/7, harga termurah. Mobile Legends, Free Fire, PUBG, Genshin Impact dan masih banyak lagi.",
  keywords: "top up game, voucher game, mobile legends, free fire, pubg, genshin impact, top up murah",
  openGraph: {
    title: "DagangPlay – Top Up Games Tercepat & Termurah",
    description: "Platform top up voucher game terpercaya. Proses otomatis 24/7.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
