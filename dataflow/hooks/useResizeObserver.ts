import React, { useEffect } from "react";

export default function useResizeObserver(ref: React.RefObject<HTMLElement | null>, onResize: (entry: ResizeObserverEntry) => void) {
    useEffect(() => {
        if (!ref.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                onResize(entry);
            }
        });

        resizeObserver.observe(ref.current);

        return () => {
            if (ref.current) {
                resizeObserver.unobserve(ref.current);
            }
        }
    }, [ref, onResize]);
}
