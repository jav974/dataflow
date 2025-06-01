import { useEffect } from "react";

/**
 * This hook sets up a ResizeObserver on the provided ref and calls the onResize callback whenever the element is resized.
 * It cleans up the observer when the component unmounts or when the ref changes.
 * 
 * @param ref Element to observe for resize events
 * @param onResize Callback function upon resize event
 */
export default function useResizeObserver(
    ref: React.RefObject<HTMLElement | null>,
    onResize: (entry: ResizeObserverEntry) => void
): void {
    useEffect(() => {
        if (!ref.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                onResize(entry);
            }
        });

        resizeObserver.observe(ref.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [ref, onResize]);
}
