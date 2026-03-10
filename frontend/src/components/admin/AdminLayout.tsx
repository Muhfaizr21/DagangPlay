"use client";
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Store,
    Users,
    Gamepad2,
    ReceiptText,
    Wallet, // Changed from WalletCards
    Bell,   // Changed from LifeBuoy
    Settings,
    LogOut,
    Zap,
    Server,
    Network,
    Tag,
    CreditCard,
    Megaphone,
    ShieldAlert,
    LifeBuoy,
    Box,
    GraduationCap
} from 'lucide-react';

const MENU_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/content', label: 'Web Konten & Broadcast', icon: Megaphone },
    { href: '/admin/merchants', label: 'Manajemen Merchant', icon: Store },
    { href: '/admin/marketing', label: 'Marketing Academy', icon: GraduationCap },
    { href: '/admin/subscriptions', label: 'SaaS Subscriptions', icon: CreditCard },
    { href: '/admin/products', label: 'Produk & Kategori', icon: Gamepad2 },
    { href: '/admin/products/pricing', label: 'Manajemen Tier Harga', icon: Tag },
    { href: '/admin/digiflazz', label: 'Digiflazz Product', icon: Box },
    { href: '/admin/suppliers', label: 'Manajemen Supplier', icon: Server },
    { href: '/admin/transactions', label: 'Transaksi', icon: ReceiptText },
    { href: '/admin/finance', label: 'Deposit & Keuangan', icon: Wallet },
    { href: '/admin/promos', label: 'Promo & Diskon', icon: Megaphone }, // Changed from Tag to avoid conflict
    { href: '/admin/support', label: 'Support Ticket', icon: LifeBuoy },
    { href: '/admin/security', label: 'Keamanan & Audit', icon: ShieldAlert },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#fafafa] flex text-slate-800 font-body selection:bg-blue-500/20">
            {/* Sidebar - Clean White */}
            <aside className="w-64 border-r border-slate-200/60 bg-white flex flex-col z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 shadow-sm flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="font-heading tracking-[.05em] text-lg font-bold text-slate-900">DAGANGPLAY</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu Utama</p>
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-[13px] transition-all duration-200 group
                  ${isActive
                                        ? 'bg-indigo-50/80 text-indigo-700'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon strokeWidth={2} className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Profile Card Bottom */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                            SA
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">Super Admin</p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">Admin Hak Penuh</p>
                        </div>
                    </div>
                    <Link href="/admin/login" className="mt-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 group">
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" strokeWidth={2} />
                        Logout Akun
                    </Link>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header - Soft border logic */}
                <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Dynamic Breadcrumbs based on path could go here */}
                        <div className="flex items-center gap-2 text-[13px]">
                            <span className="text-slate-400">Admin</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-800 font-medium">Dashboard</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors relative p-2 bg-slate-50 hover:bg-indigo-50 rounded-full">
                            <Bell className="w-4 h-4" strokeWidth={2} />
                            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </button>
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors relative p-2 bg-slate-50 hover:bg-indigo-50 rounded-full">
                            <Settings className="w-4 h-4" strokeWidth={2} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
