"use client";
import { getApiUrl } from '@/lib/api';

import React, { useState, useEffect, Suspense } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";


const CompanyProfile = dynamic(() => import("@/components/home/CompanyProfile"), {
  loading: () => <div className="min-h-screen bg-[#020617] flex items-center justify-center animate-pulse text-white font-black uppercase tracking-[.45em] italic">DagangPlay Corp...</div>
});

const MerchantStorefront = dynamic(() => import("@/components/home/MerchantStorefront"), {
  loading: () => <div className="min-h-screen bg-[#05070A] flex items-center justify-center animate-pulse"><img src="/dagang.png" className="w-24 h-24 object-contain grayscale invert opacity-20" /></div>
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());


function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [mOpen, setMOpen] = useState(false);

  const baseUrl = getApiUrl();

  const searchParams = useSearchParams();
  
  // Reactive Domain/Merchant Detection
  const [merchantState, setMerchantState] = useState<{
    slug: string | null;
    domain: string | null;
    showStore: boolean;
    isMainDomain: boolean;
  }>({
    slug: null,
    domain: null,
    showStore: false,
    isMainDomain: true
  });

  useEffect(() => {
    const mParam = searchParams.get('merchant');
    const domainMaskParam = searchParams.get('domain_mask');
    const viewParam = searchParams.get('view');
    const rawHostname = window.location.hostname;
    const cleanHostname = rawHostname.split(':')[0];
    
    // Strict match untuk main domain, sehingga subdomain (.dagangplay.com) akan ditangkap sebagai toko/store
    const isMain = cleanHostname === 'dagangplay.com' || 
                   cleanHostname === 'www.dagangplay.com' || 
                   cleanHostname === 'localhost' || 
                   cleanHostname === '127.0.0.1' || 
                   cleanHostname.includes('trycloudflare.com') ||
                   cleanHostname.includes('vercel.app');

    let slug = mParam;
    let domain = domainMaskParam;
    let showStore = !!(mParam || domainMaskParam || !isMain || viewParam === 'store');

    setMerchantState({
      slug,
      domain,
      showStore,
      isMainDomain: isMain
    });
  }, [searchParams]);

  const { slug, domain, showStore } = merchantState;

  const configUrl = slug
    ? `${baseUrl}/public/orders/config?slug=${slug}`
    : domain ? `${baseUrl}/public/orders/config?domain=${domain}` : `${baseUrl}/public/orders/config`;

  const swrConfig = { revalidateOnFocus: false, dedupingInterval: 10000 };
  const { data: config, isLoading: configLoading } = useSWR(configUrl, fetcher, swrConfig);

  const contentUrl = slug
    ? `${baseUrl}/public/products/content?merchant=${slug}`
    : domain ? `${baseUrl}/public/products/content?domain=${domain}` : `${baseUrl}/public/products/content`;

  const catalogUrl = slug
    ? `${baseUrl}/public/products/full-catalog?merchant=${slug}`
    : domain ? `${baseUrl}/public/products/full-catalog?domain=${domain}` : `${baseUrl}/public/products/full-catalog`;

  const merchantsUrl = `${baseUrl}/public/orders/merchants`;

  const { data: contentData, isLoading: contentLoading } = useSWR(contentUrl, fetcher, swrConfig);
  const { data: catalog, isLoading: catalogLoading } = useSWR(catalogUrl, fetcher, swrConfig);
  const { data: merchants, isLoading: merchantsLoading } = useSWR(merchantsUrl, fetcher, swrConfig);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (config?.name) {
      document.title = `${config.name.replace(/OFFICIAL STORE/gi, "").trim()} | Top Up Game Murah & Legal 24 Jam`;
      
      if (config.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = config.favicon;
      }
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

  // FINAL ROUTING LOGIC
  // 1. If Official Platform and not in Store View -> Show Official Company Profile (Landing Perusahaan)
  // We prioritize showing the Landing Page if we are on a main domain and no specific store is requested
  const isPlatformView = config?.isOfficial || (merchantState.isMainDomain && !merchantState.slug && !merchantState.domain);
  
  if (isPlatformView && !showStore) {
    return <CompanyProfile scrolled={scrolled} catalog={catalog} merchants={merchants} />;
  }

  // 2. If Merchant is Suspended or Expired (SaaS Protection)
  if (config && (config.isSuspended || config.isExpired)) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">{config.name}</h1>
          <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8">
            {config.message || "Toko sedang dalam perbaikan / ditangguhkan karena belum bayar langganan masa aktif."}
          </p>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/10 pt-6">
            Powered by DagangPlay SaaS
          </div>
        </div>
      </div>
    );
  }

  // 3. Default: Show Merchant Storefront (for actual merchants OR if official store view is requested)
  return (
    <MerchantStorefront
      config={config}
      contentData={contentData}
      filteredProducts={filteredProducts}
      search={search}
      setSearch={setSearch}
      isLoading={catalogLoading || contentLoading}
    />
  );
}


export default function HomeWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center animate-pulse text-white font-black uppercase tracking-[.45em] italic">DagangPlay Engine...</div>}>
      <Home />
    </Suspense>
  );
}
