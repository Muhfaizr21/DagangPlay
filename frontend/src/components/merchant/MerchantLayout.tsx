"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import {
    LayoutDashboard, Package, ShoppingCart, Settings, Bell,
    LogOut, Zap, CreditCard, Ticket, Activity, Tag, Palette,
    GraduationCap, MessageSquare, ExternalLink, ChevronDown,
    TrendingUp, Search, Lock, Users
} from 'lucide-react';

const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/merchant' },
        ]
    },
    {
        label: 'Bisnis',
        items: [
            { label: 'Katalog Produk', icon: Package, href: '/merchant/products' },
            { label: 'Pesanan & Transaksi', icon: ShoppingCart, href: '/merchant/orders' },
            { label: 'Member & Reseller', icon: Users, href: '/merchant/resellers' },
            { label: 'Promo & Voucher', icon: Tag, href: '/merchant/promos' },
        ]
    },
    {
        label: 'Keuangan',
        items: [
            { label: 'Keuangan & Saldo', icon: CreditCard, href: '/merchant/finance' },
            { label: 'Laporan & Analytics', icon: TrendingUp, href: '/merchant/reports' },
        ]
    },
    {
        label: 'Toko',
        items: [
            { label: 'Tampilan Toko', icon: Palette, href: '/merchant/content' },
            { label: 'Pengaturan', icon: Settings, href: '/merchant/settings' },
            { label: 'Subscription', icon: Zap, href: '/merchant/subscription' },
        ]
    },
    {
        label: 'Bantuan',
        items: [
            { label: 'Live Chat', icon: MessageSquare, href: '/merchant/chat' },
            { label: 'Support & Tiket', icon: Ticket, href: '/merchant/support' },
            { label: 'Reseller Academy', icon: GraduationCap, href: '/merchant/academy', minPlan: 'SUPREME', lockLabel: 'Khusus SUPREME' },
        ]
    }
];

const PLAN_LEVELS: Record<string, number> = { FREE: 0, PRO: 1, LEGEND: 2, SUPREME: 3 };

const PLAN_COLORS: Record<string, string> = {
    FREE: 'bg-slate-100 text-slate-600',
    PRO: 'bg-blue-50 text-blue-700',
    LEGEND: 'bg-violet-50 text-violet-700',
    SUPREME: 'bg-amber-50 text-amber-700',
};

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantLayout({ children, demoUser }: { children: React.ReactNode, demoUser?: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: chatData } = useSWR(`${baseUrl}/chat/merchant`, fetcher, { refreshInterval: 10000 });
    const { data: merchantSettings } = useSWR(`${baseUrl}/merchant/settings`, fetcher);
    const unreadCount = chatData?.messages?.filter((m: any) => m.isAdmin && !m.isRead).length || 0;
    const currentSlug = user?.merchantSlug || merchantSettings?.slug;

    useEffect(() => {
        if (demoUser) {
            setUser(demoUser);
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');
        if (!token || !userData) { router.push('/merchant/login'); return; }
        const parsed = JSON.parse(userData);
        if (parsed.role === 'SUPER_ADMIN' || parsed.role === 'ADMIN_STAFF') {
            // Super admin token doesn't belong here — clear and ask for merchant login
            localStorage.clear();
            router.replace('/merchant/login');
            return;
        }
        if (parsed.role !== 'MERCHANT') {
            localStorage.clear();
            router.replace('/merchant/login'); 
            return; 
        }
        setUser(parsed);
        setIsLoading(false);
    }, [router, demoUser]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                    <span className="text-sm text-gray-400 font-medium">Memuat...</span>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        if (demoUser || user?.email === 'demo@dagangplay.com') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            router.replace('/reseller');
            return;
        }
        
        const token = localStorage.getItem('admin_token');
        try {
            await axios.post(`${baseUrl}/api/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch { }
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.replace('/merchant/login');
    };

    const planColor = PLAN_COLORS[user?.plan || 'FREE'];

    return (
        <div className="min-h-screen bg-[#080A10] flex text-[#F8FAFC]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' }}>

            {/* ─── Sidebar ─── */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-[#080A10] border-r border-[#ffffff0f] flex flex-col z-30 shadow-[1px_0_0_0_#ffffff08]">

                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-[#ffffff0f] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#111520] border border-[#ffffff1a] flex items-center justify-center overflow-hidden">
                            <img src="/dagang.png" alt="Logo" className="w-full h-full object-contain p-0.5" onError={(e: any) => e.target.style.display='none'} />
                        </div>
                        <div>
                            <span className="text-[15px] font-bold text-white tracking-tight italic">DagangPlay</span>
                            <span className="ml-1.5 text-[9px] font-bold text-[#00D8FF] uppercase tracking-widest">OS</span>
                        </div>
                    </div>
                </div>

                {/* User Card */}
                <div className="px-4 py-4 border-b border-[#ffffff0f] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#00D8FF]/10 border border-[#00D8FF]/30 text-[#00D8FF] flex items-center justify-center text-sm font-bold shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-[11px] text-[#8A94A6] truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/10 text-white border border-white/20`}>
                            {user?.plan || 'FREE'}
                        </span>
                    </div>
                </div>

                {/* View Store CTA */}
                <div className="px-4 py-3 border-b border-[#ffffff0f] shrink-0">
                    <a
                        href={currentSlug ? `/?merchant=${currentSlug}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 w-full py-2.5 bg-[#00D8FF] hover:bg-white text-black text-[12px] font-bold uppercase tracking-widest rounded-xl transition-colors shadow-[0_0_15px_rgba(0,216,255,0.4)]`}
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Lihat Website Toko
                    </a>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 scrollbar-hide">
                    {NAV_GROUPS.map(group => (
                        <div key={group.label}>
                            <p className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
                            <div className="space-y-0.5">
                                {group.items.map((item: any) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href ||
                                        (pathname.startsWith(item.href) && item.href !== '/merchant');
                                    const isLocked = item.minPlan && PLAN_LEVELS[user?.plan || 'FREE'] < PLAN_LEVELS[item.minPlan];

                                    if (isLocked) {
                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => {
                                                    router.push('/merchant/subscription');
                                                }}
                                                title={`Upgrade ke ${item.minPlan} untuk mengakses ${item.label}`}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#8A94A6] hover:bg-[#FF3366]/10 hover:text-[#FF3366] transition-all group opacity-70`}
                                            >
                                                <Icon className="w-4 h-4 shrink-0 text-[#8A94A6] group-hover:text-[#FF3366]" />
                                                <span className="flex-1 text-left">{item.label}</span>
                                                <span className="flex items-center gap-1 bg-[#FF3366]/20 text-[#FF3366] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-[#FF3366]/40">
                                                    <Lock className="w-2.5 h-2.5" />
                                                    {item.minPlan}
                                                </span>
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            key={item.href}
                                            onClick={() => {
                                                router.push(item.href);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${
                                                isActive
                                                    ? 'bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 font-semibold shadow-sm'
                                                    : 'text-[#8A94A6] hover:bg-white/5 hover:text-white font-medium'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00D8FF]' : 'text-[#8A94A6]'}`} />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {item.href === '/merchant/chat' && unreadCount > 0 && (
                                                <span className="bg-[#FF3366] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(255,51,102,0.6)]">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-[#ffffff0f] shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#8A94A6] hover:bg-[#FF3366]/10 hover:text-[#FF3366] hover:border hover:border-[#FF3366]/30 border border-transparent transition-colors group"
                    >
                        <LogOut className="w-4 h-4 text-[#8A94A6] group-hover:text-[#FF3366]" />
                        Keluar / Logout
                    </button>
                </div>
            </aside>

            {/* ─── Main ─── */}
            <main className="flex-1 ml-64 flex flex-col min-h-screen relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(123,44,191,0.1)_0%,_transparent_50%)] pointer-events-none" />

                {/* Topbar */}
                <header className="h-16 bg-[#080A10]/90 border-b border-[#ffffff0f] backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 shrink-0">
                    <div className="relative hidden md:block group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D8FF] to-[#7B2CBF] rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-500" />
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6]" />
                            <input
                                type="text"
                                placeholder="Cari transaksi, produk, ID..."
                                className="w-72 pl-9 pr-4 py-2 bg-[#111520] border border-white/10 rounded-xl text-[13px] text-white placeholder-[#8A94A6] focus:outline-none focus:ring-1 focus:ring-[#00D8FF] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Notification */}
                        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[#8A94A6] hover:bg-white/10 hover:text-white transition-colors">
                            <Bell className="w-4.5 h-4.5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3366] shadow-[0_0_8px_rgba(255,51,102,0.8)] rounded-full" />
                            )}
                        </button>

                        <div className="w-px h-5 bg-[#ffffff1a]" />

                        {/* User pill */}
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#111520] hover:bg-white/10 hover:border-white/30 cursor-pointer transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                            <div className="w-7 h-7 rounded-lg bg-[#00D8FF]/20 border border-[#00D8FF]/40 text-[#00D8FF] text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(0,216,255,0.3)]">
                                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-[12px] font-bold text-white leading-tight italic">{user?.name}</p>
                                <p className="text-[10px] text-[#00D8FF] uppercase tracking-widest font-black">Merchant Admin</p>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-[#8A94A6] hidden sm:block" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-6 relative z-10">
                    {children}
                </div>

                {/* Floating Action Button for Demo */}
                {user?.email === 'demo@dagangplay.com' && (
                    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-8 duration-500">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-6 py-4 bg-[#FF3366] text-white text-[13px] font-black italic uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(255,51,102,0.4)] hover:bg-white hover:text-[#FF3366] hover:-translate-y-1 transition-all outline-none"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            AKHIRI DEMO & KEMBALI
                            <LogOut className="w-4 h-4 ml-1 opacity-80" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
