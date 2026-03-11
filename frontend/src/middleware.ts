import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|admin|merchant).*)',
    ],
};

export function middleware(request: NextRequest) {
    const url = request.nextUrl;

    // Mendapatkan Hostname
    const hostname = request.headers.get('host') || '';

    // Daftar domain root dari platform kita sendiri (Disesuaikan nanti dengan domain asli perusahaan)
    // local development: localhost, ip, dan domain trycloudflare
    const isMainDomain =
        hostname.includes('localhost') ||
        hostname.includes('127.0.0.1') ||
        hostname.includes('dagangplay.com') ||
        hostname.includes('trycloudflare.com') || // if we use cloudflare tunnel for testing
        hostname.includes('vercel.app');

    // Skip jika ini adalah domain utama, atau jika sedang akses /admin atau /merchant dll
    if (isMainDomain) {
        return NextResponse.next();
    }

    // Jika ini bukan domain utama (Contoh: budigaming.com)
    // Maka kita akan rewrite URL nya dengan menambahkan identifier agar ditangkap oleh aplikasi kita
    // Secara kasat mata (di address bar browser user), url akan tetap "budigaming.com"

    // Kami melempar query param domain_mask agar NextJS Pages dan Backend bisa merespon toko yang sesuai
    url.searchParams.set('domain_mask', hostname);

    return NextResponse.rewrite(url);
}
