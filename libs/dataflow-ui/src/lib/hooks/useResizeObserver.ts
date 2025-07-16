import React, { useEffect } from "react";

export default function useResizeObserver(ref: React.RefObject<HTMLElement | null>, onResize: (entry: ResizeObserverEntry) => void) {
    useEffect(() => {
        if (!ref.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                requestAnimationFrame(() => onResize(entry));
            }
        });

        resizeObserver.observe(ref.current);
        const current = ref.current;

        return () => {
            resizeObserver.unobserve(current);
        }
    }, [ref, onResize]);
}
