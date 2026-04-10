"use client";
import { getApiUrl } from '@/lib/api';
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
    const baseUrl = getApiUrl();
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
        <div className="min-h-screen bg-[#09090F] flex text-slate-300 font-body selection:bg-[#00D8FF]/20">
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 border-r border-white/5 bg-[#09090F] flex flex-col z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#16161F] border border-white/10 shadow-sm flex items-center justify-center p-1">
                            <img src="/dagang.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-heading tracking-[.05em] text-lg font-bold text-white">DAGANGPLAY</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Menu Utama</p>
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-[13px] transition-all duration-200 group ${isActive
                                    ? 'bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon strokeWidth={2} className={`w-4 h-4 ${isActive ? 'text-[#00D8FF]' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                <span className="flex-1">{item.label}</span>
                                {item.href === '/admin/chat' && totalChatUnread > 0 && (
                                    <span className="bg-[#FF3366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,51,102,0.6)]">
                                        {totalChatUnread}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Profile Card — Dynamic dari localStorage */}
                <div className="p-4 border-t border-white/5 bg-[#111118]">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-[#00D8FF]/10 border border-[#00D8FF]/30 flex items-center justify-center text-[#00D8FF] font-bold text-xs">
                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[13px] font-semibold text-white truncate leading-tight">{currentUser?.name || 'Admin'}</p>
                            <p className="text-[11px] text-[#00D8FF] truncate mt-0.5">{roleLabel[currentUser?.role || ''] || currentUser?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-[#FF3366] hover:bg-[#FF3366]/10 transition-colors flex items-center gap-2 group cursor-pointer border border-transparent hover:border-[#FF3366]/30"
                    >
                        <LogOut className="w-4 h-4 text-slate-500 group-hover:text-[#FF3366]" strokeWidth={2} />
                        Logout Akun
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-16 border-b border-white/5 bg-[#09090F]/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-[#00D8FF] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.1em] text-slate-500">
                            <Link href="/admin" className="hover:text-[#00D8FF] transition-colors">Admin</Link>
                            <span className="text-slate-600">/</span>
                            <span className="text-white font-black italic">
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
                                className="text-slate-400 hover:text-[#00D8FF] transition-colors relative p-2 bg-white/5 hover:bg-[#00D8FF]/10 border border-white/5 hover:border-[#00D8FF]/30 rounded-full cursor-pointer shadow-[0_0_10px_rgba(0,216,255,0)] hover:shadow-[0_0_15px_rgba(0,216,255,0.3)]"
                            >
                                <Bell className="w-4 h-4" strokeWidth={2} />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3366] border-2 border-[#09090F] shadow-[0_0_8px_rgba(255,51,102,0.8)]"></span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-3 w-80 bg-[#16161F] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover/notif:opacity-100 group-hover/notif:visible transition-all duration-300 z-[100] transform translate-y-2 group-hover/notif:translate-y-0">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-white tracking-tight italic">Pusat Informasi</h3>
                                    <span className="text-[10px] font-black text-[#00D8FF] uppercase tracking-widest px-2 py-0.5 bg-[#00D8FF]/10 border border-[#00D8FF]/30 rounded-full">System Live</span>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto py-2">
                                    <div className="px-4 py-3 hover:bg-white/5 border-l-4 border-[#00D8FF] transition-colors">
                                        <p className="text-[12px] font-bold text-white">Dashboard Stabilized</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Sistem autentikasi reseller dan demo merchant kini telah normal.</p>
                                        <p className="text-[9px] text-slate-500 font-medium mt-1.5 uppercase tracking-wider">Baru saja</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-white/5 transition-colors">
                                        <p className="text-[12px] font-bold text-white">Cek Saldo Digiflazz</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Pantau saldo supplier secara berkala untuk kelancaran transaksi.</p>
                                        <p className="text-[9px] text-slate-500 font-medium mt-1.5 uppercase tracking-wider">1 jam yang lalu</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-white/5 transition-colors border-t border-white/5">
                                        <Link href="/admin/content" className="text-[11px] font-bold text-[#00D8FF] hover:text-white transition-colors">Kelola Pengumuman &raquo;</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link href="/admin/settings" className="text-slate-400 hover:text-[#00D8FF] transition-colors relative p-2 bg-white/5 hover:bg-[#00D8FF]/10 border border-white/5 hover:border-[#00D8FF]/30 rounded-full cursor-pointer shadow-[0_0_10px_rgba(0,216,255,0)] hover:shadow-[0_0_15px_rgba(0,216,255,0.3)]">
                            <Settings className="w-4 h-4" strokeWidth={2} />
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,216,255,0.05)_0%,_transparent_50%)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
