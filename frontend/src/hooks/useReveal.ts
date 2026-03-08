"use client";
import { useEffect, useRef, useState } from "react";

export function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return { ref, v };
}
