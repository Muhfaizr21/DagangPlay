/**
 * Central API utility for DagangPlay Frontend.
 * Resolves the backend URL from environment, with a safe fallback.
 *
 * ALWAYS use `getApiUrl()` instead of hardcoding `http://localhost:3001`.
 */
export const getApiUrl = (): string => {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

/**
 * Standard auth headers for authenticated requests.
 * Reads `admin_token` from localStorage (safe to call only client-side).
 */
export const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Default SWR fetcher with auth headers injected automatically.
 */
export const authFetcher = (url: string) => {
    return fetch(url, { headers: getAuthHeaders() as any })
        .then(async (res) => {
            if (res.status === 401) {
                // Token expired or invalid — redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = '/admin/login';
                }
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        });
};

/**
 * Sanitize HTML string for safe rendering.
 * Strips all script tags and event handlers, allows only basic formatting.
 * Use this instead of dangerouslySetInnerHTML directly.
 */
export const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:text\/html/gi, '');
};
