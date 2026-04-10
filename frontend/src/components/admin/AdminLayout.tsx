"use client";
import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import {
    LayoutDashboard,
    Store,
    Gamepad2,
    ReceiptText,
    Wallet,
    Bell,
    Settings,
    LogOut,
    Server,
    Tag,
    CreditCard,
    Megaphone,
    ShieldAlert,
    LifeBuoy,
    Box,
    GraduationCap,
    MessageSquare,
    Shield
} from 'lucide-react';

const MENU_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/merchants', label: 'Manajemen Merchant', icon: Store },
    { href: '/admin/control-center', label: 'Control Room (System)', icon: Shield },
    { href: '/admin/content', label: 'Web Konten & Broadcast', icon: MessageSquare },
    { href: '/admin/marketing', label: 'Marketing Academy', icon: GraduationCap },
    { href: '/admin/chat', label: 'Live Chat Merchant', icon: MessageSquare },
    { href: '/admin/subscriptions', label: 'SaaS Subscriptions', icon: CreditCard },
    { href: '/admin/products', label: 'Produk & Kategori', icon: Gamepad2 },
    { href: '/admin/products/pricing', label: 'Manajemen Tier Harga', icon: Tag },
    { href: '/admin/digiflazz', label: 'Digiflazz Product', icon: Box },
    { href: '/admin/suppliers', label: 'Manajemen Supplier', icon: Server },
    { href: '/admin/transactions', label: 'Transaksi', icon: ReceiptText },
    { href: '/admin/finance', label: 'Deposit & Keuangan', icon: Wallet },
    { href: '/admin/promos', label: 'Promo & Diskon', icon: Megaphone },
    { href: '/admin/support', label: 'Support Ticket', icon: LifeBuoy },
    { href: '/admin/security', label: 'Keamanan & Audit', icon: ShieldAlert },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

const fetcher = (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ── Route Guard: Only SUPER_ADMIN & ADMIN_STAFF can access /admin ──
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const userRaw = localStorage.getItem('admin_user');

        if (!token || !userRaw) {
            router.replace('/admin/login');
            return;
        }

        try {
            const user = JSON.parse(userRaw);
            setCurrentUser(user);

            if (user.role === 'MERCHANT') {
                // Merchant login ke area salah → redirect ke merchant dashboard
                router.replace('/merchant');
            } else if (!['SUPER_ADMIN', 'ADMIN_STAFF'].includes(user.role)) {
                // Role tidak diizinkan -> Force logout
                localStorage.clear();
                router.replace('/admin/login');
            }
        } catch {
            localStorage.clear();
            router.replace('/admin/login');
        }
    }, [router]);

    const handleLogout = async () => {
        const token = localStorage.getItem('admin_token');
        try {
            await axios.post(`${baseUrl}/api/auth/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch { /* ignore */ }
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.replace('/admin/login');
    };

    const { data: chatRooms } = useSWR(`${baseUrl}/chat/admin/rooms`, fetcher, { refreshInterval: 10000 });
    const totalChatUnread = chatRooms?.reduce((acc: number, room: any) => acc + (room._count?.messages || 0), 0) || 0;

    const roleLabel: Record<string, string> = {
        SUPER_ADMIN: 'Super Admin',
        ADMIN_STAFF: 'Admin Staff',
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex text-slate-800 font-body selection:bg-blue-500/20">
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 border-r border-slate-200/60 bg-white flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1">
                            <img src="/dagang.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-heading tracking-[.05em] text-lg font-bold text-slate-900">DAGANGPLAY</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu Utama</p>
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-[13px] transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-50/80 text-indigo-700'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon strokeWidth={2} className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="flex-1">{item.label}</span>
                                {item.href === '/admin/chat' && totalChatUnread > 0 && (
                                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                        {totalChatUnread}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Profile Card — Dynamic dari localStorage */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{currentUser?.name || 'Admin'}</p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{roleLabel[currentUser?.role || ''] || currentUser?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 group cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" strokeWidth={2} />
                        Logout Akun
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400">
                            <Link href="/admin" className="hover:text-indigo-600 transition-colors">Admin</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-800 font-black">
                                {MENU_ITEMS.find(item => pathname === item.href)?.label || 
                                 MENU_ITEMS.find(item => pathname.startsWith(item.href) && item.href !== '/admin')?.label || 
                                 'Dashboard'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        {/* Notification Bell with Dropdown */}
                        <div className="relative group/notif">
                            <button 
                                className="text-slate-400 hover:text-indigo-600 transition-colors relative p-2 bg-slate-50 hover:bg-indigo-50 rounded-full cursor-pointer"
                            >
                                <Bell className="w-4 h-4" strokeWidth={2} />
                                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover/notif:opacity-100 group-hover/notif:visible transition-all duration-300 z-[100] transform translate-y-2 group-hover/notif:translate-y-0">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-slate-800 tracking-tight">Pusat Informasi</h3>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-full">System Live</span>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto py-2">
                                    <div className="px-4 py-3 hover:bg-slate-50 border-l-4 border-indigo-500 transition-colors">
                                        <p className="text-[12px] font-bold text-slate-800">Dashboard Stabilized</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Sistem autentikasi reseller dan demo merchant kini telah normal.</p>
                                        <p className="text-[9px] text-slate-400 font-medium mt-1.5 uppercase tracking-wider">Baru saja</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors">
                                        <p className="text-[12px] font-bold text-slate-800">Cek Saldo Digiflazz</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Pantau saldo supplier secara berkala untuk kelancaran transaksi.</p>
                                        <p className="text-[9px] text-slate-400 font-medium mt-1.5 uppercase tracking-wider">1 jam yang lalu</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors border-t border-slate-50">
                                        <Link href="/admin/content" className="text-[11px] font-bold text-indigo-600 hover:underline">Kelola Pengumuman &raquo;</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link href="/admin/settings" className="text-slate-400 hover:text-indigo-600 transition-colors relative p-2 bg-slate-50 hover:bg-indigo-50 rounded-full cursor-pointer">
                            <Settings className="w-4 h-4" strokeWidth={2} />
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
