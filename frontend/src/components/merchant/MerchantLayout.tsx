"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Bell,
    Search,
    LogOut,
    ChevronDown,
    Zap,
    CreditCard,
    Ticket,
    Activity,
    Tag,
    Palette,
    GraduationCap,
    MessageSquare,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';

const MENU_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/merchant' },
    { label: 'Katalog Produk', icon: Package, href: '/merchant/products' },
    { label: 'Pesanan & Transaksi', icon: ShoppingCart, href: '/merchant/orders' },
    { label: 'Marketing Academy', icon: GraduationCap, href: '/merchant/academy', minPlan: 'SUPREME' },
    { label: 'Laporan & Analytics', icon: Activity, href: '/merchant/reports' },
    { label: 'Keuangan & Saldo', icon: CreditCard, href: '/merchant/finance' },
    { label: 'Promo & Voucher', icon: Tag, href: '/merchant/promos' },
    { label: 'Tampilan Toko', icon: Palette, href: '/merchant/content' },
    { label: 'Support & Tiket', icon: Ticket, href: '/merchant/support' },
    { label: 'Live Chat Admin', icon: MessageSquare, href: '/merchant/chat' },
    { label: 'Subscription & Billing', icon: Zap, href: '/merchant/subscription' },
    { label: 'Pengaturan Toko', icon: Settings, href: '/merchant/settings' },
];

const PLAN_LEVELS: Record<string, number> = {
    'FREE': 0,
    'PRO': 1,
    'LEGEND': 2,
    'SUPREME': 3
};

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function MerchantLayout({ children, title, demoUser }: { children: React.ReactNode, title?: string, demoUser?: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const { data: chatData } = useSWR(`${baseUrl}/chat/merchant`, fetcher, { refreshInterval: 10000 });
    const { data: merchantSettings } = useSWR(`${baseUrl}/merchant/settings`, fetcher);
    const merchantUnreadCount = chatData?.messages?.filter((m: any) => m.isAdmin && !m.isRead).length || 0;
    const currentSlug = user?.merchantSlug || merchantSettings?.slug;

    useEffect(() => {
        if (demoUser) {
            setUser(demoUser);
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');

        if (!token || !userData) {
            router.push('/admin/login');
            return;
        }

        const parsed = JSON.parse(userData);
        if (parsed.role !== 'MERCHANT') {
            router.push('/admin/login');
            return;
        }

        setUser(parsed);
        setIsLoading(false);
    }, [router, demoUser]);

    if (isLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>;
    }

    const handleLogout = () => {
        localStorage.clear();
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20 transition-transform duration-300">
                {/* Brand Area */}
                <div className="h-20 flex items-center px-8 border-b border-slate-100/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-sm">
                            <img src="/dagang.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-bold text-[18px] tracking-tight text-slate-900 leading-tight">DagangPlay</h1>
                            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-0.5">MERCHANT OS</p>
                        </div>
                    </div>
                </div>

                {/* Tenant Context */}
                <div className="px-6 py-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/60 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-200/50 shadow-inner">
                            {user?.name?.charAt(0) || 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-[11px] text-slate-500 truncate" title={user?.email}>{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 px-4 overflow-y-auto overflow-x-hidden pb-4 space-y-1 scrollbar-hide">
                    {/* View Website Feature */}
                    <div className="px-2 mb-6">
                        <a
                            href={currentSlug ? `/?merchant=${currentSlug}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group font-bold text-[13px]"
                        >
                            <ExternalLink size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            LIHAT WEBSITE TOKO
                        </a>
                    </div>

                    <div className="px-4 mb-3 mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu Utama</p>
                    </div>
                    {MENU_ITEMS.filter((item: any) => !item.minPlan || (PLAN_LEVELS[user?.plan || 'FREE'] >= PLAN_LEVELS[item.minPlan])).map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/merchant');

                        return (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 font-medium'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="text-[13px] flex-1">{item.label}</span>
                                {item.href === '/merchant/chat' && merchantUnreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                        {merchantUnreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-100/50">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 font-bold text-[13px] hover:bg-red-50 transition-colors group">
                        <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                        Keluar / Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-72 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 flex items-center justify-between px-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                    <div className="relative w-96 hidden md:block">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari transaksi, produk, ID..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border-transparent rounded-full text-sm font-medium text-slate-700 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-1"></div>

                        <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-[12px] font-bold text-slate-800 leading-tight">{user?.name}</p>
                                <p className="text-[11px] font-medium text-slate-500">Merchant Admin</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 mr-2" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
