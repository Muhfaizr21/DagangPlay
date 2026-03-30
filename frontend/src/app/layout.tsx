import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

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

import { AxiosInterceptorSetup } from "@/lib/AxiosInterceptor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${poppins.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="font-inter">
        <AxiosInterceptorSetup />
        {children}
      </body>
    </html>
  );
}
