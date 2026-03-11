"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import PlatformLanding from "@/components/home/PlatformLanding";
import MerchantStorefront from "@/components/home/MerchantStorefront";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [mOpen, setMOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const [slug, setSlug] = useState<string | null>(null);
  const [domainMask, setDomainMask] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mParam = params.get('merchant');
    const domainMaskParam = params.get('domain_mask');

    // LOGIKA MULTI-TENANT:
    // 1. Cek query param ?merchant= (untuk testing)
    // 2. Cek ?domain_mask= (dari middleware custom domain routing)
    // 3. Cek hostname 
    const hostname = window.location.hostname;
    const isMainDomain = hostname === 'dagangplay.com' || hostname === 'localhost';

    if (mParam) {
      setSlug(mParam);
    } else if (domainMaskParam) {
      setDomainMask(domainMaskParam);
    } else if (!isMainDomain) {
      setDomainMask(hostname);
    }
  }, []);

  const configUrl = slug
    ? `${baseUrl}/public/orders/config?slug=${slug}`
    : domainMask ? `${baseUrl}/public/orders/config?domain=${domainMask}` : `${baseUrl}/public/orders/config`;

  const { data: config, isLoading: configLoading } = useSWR(configUrl, fetcher);

  const contentUrl = slug
    ? `${baseUrl}/public/products/content?merchant=${slug}`
    : domainMask ? `${baseUrl}/public/products/content?domain=${domainMask}` : `${baseUrl}/public/products/content`;

  const catalogUrl = slug
    ? `${baseUrl}/public/products/full-catalog?merchant=${slug}`
    : domainMask ? `${baseUrl}/public/products/full-catalog?domain=${domainMask}` : `${baseUrl}/public/products/full-catalog`;


  const { data: contentData } = useSWR(contentUrl, fetcher);
  const { data: catalog } = useSWR(catalogUrl, fetcher);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (config?.name) {
      document.title = `${config.name.replace(/OFFICIAL STORE/gi, "").trim()} | Top Up Game Murah & Legal 24 Jam`;
    }
  }, [config]);

  if (configLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-12 h-12 border-[2px] border-white/5 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  // Flatten catalog
  const allProducts = catalog?.flatMap((cat: any) =>
    cat.products.map((p: any) => ({ ...p, categoryName: cat.name }))
  ) || [];

  const filteredProducts = allProducts.filter((p: any) => {
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.categoryName?.toLowerCase().includes(s);
  });

  // Switch between Platform (Corporate) and Merchant (Storefront)
  if (config && !config.isOfficial) {
    return (
      <MerchantStorefront
        config={config}
        contentData={contentData}
        filteredProducts={filteredProducts}
        search={search}
        setSearch={setSearch}
      />
    );
  }

  return (
    <PlatformLanding
      config={config}
      contentData={contentData}
      filteredProducts={filteredProducts}
      search={search}
      setSearch={setSearch}
      catalog={catalog}
      announcements={contentData?.announcements || []}
      scrolled={scrolled}
      mOpen={mOpen}
      setMOpen={setMOpen}
    />
  );
}
