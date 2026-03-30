'use client';

import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Global Axios Interceptor.
 * Automatically redirects to /admin/login when backend returns 401 (token expired/invalid).
 * Mount this component once at the top-level layout.
 */
export function AxiosInterceptorSetup() {
    const router = useRouter();

    useEffect(() => {
        // Global Request Interceptor — injects Bearer token if available
        const reqInterceptorId = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('admin_token');
                if (token && !config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Global Response Interceptor — handles 401s
        const resInterceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // ... (rest same) ...
                    localStorage.clear();
                    const currentPath = window.location.pathname;
                    if (currentPath.startsWith('/merchant')) {
                        router.push('/merchant/login?reason=expired');
                    } else if (currentPath.startsWith('/admin')) {
                        router.push('/admin/login?reason=expired');
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(reqInterceptorId);
            axios.interceptors.response.eject(resInterceptorId);
        };
    }, [router]);

    return null;
}
