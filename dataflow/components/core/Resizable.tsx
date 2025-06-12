import React, { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import { useDashboardContext } from "@/dataflow/contexts/DashboardContext";
import useResizeObserver from "@/dataflow/hooks/useResizeObserver";
import { useRefSignal, useRefSignalEffect, useRefSignalRender } from "react-refsignal";
import { Size } from "pixi.js";
import { Coordinates } from "@/dataflow/config/schema";

type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

interface ResizableProps {
    children: React.ReactElement;
    directions?: Direction[];
    className?: string;
    minSize?: Size;
    maxSize?: Size;
}

export default function Resizable({ children, directions, className, minSize, maxSize }: ResizableProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLElement | null>(null);
    const position = useRef<Coordinates>({ x: 0, y: 0 });
    const size = useRefSignal<Size>({ width: NaN, height: NaN });
    const resizeDirection = useRef<Direction | undefined>(undefined);
    const { pointerPosition } = useDashboardContext();
    const [childrenElement, setChildrenElement] = useState<React.ReactElement | null | undefined>(null);

    // Update size if content changes (when not resizing)
    useResizeObserver(contentRef, () => {
        if (resizeDirection.current || !contentRef.current) return;
        
        const rect = contentRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        if (width === 0 || height === 0) return; // Ignore zero sizes!
        if (
            size.ref.current.width !== width ||
            size.ref.current.height !== height
        ) {
            size.update({width, height});
        }
    });

    // Re-render component when size changes
    useRefSignalRender([size]);

    const onPointerUp = useCallback(() => {
        resizeDirection.current = undefined;
        window.removeEventListener("pointerup", onPointerUp);
    }, [resizeDirection]);

    const startResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        resizeDirection.current = ((event.target) as HTMLElement).dataset.direction as Direction;
        window.addEventListener("pointerup", onPointerUp);
    }, [onPointerUp]);

    useRefSignalEffect(() => {
        if (!resizeDirection.current || !containerRef.current) return;
        const clientX = pointerPosition.ref.current.global.x;
        const clientY = pointerPosition.ref.current.global.y;
        let newWidth = size.ref.current.width;
        let newHeight = size.ref.current.height;

        // North
        if (resizeDirection.current.includes("n")) {
            const delta = clientY - containerRef.current.getBoundingClientRect().top;
            newHeight = size.ref.current.height - delta;
        }
        // South
        if (resizeDirection.current.includes("s")) {
            newHeight = clientY - containerRef.current.getBoundingClientRect().top;
        }
        // East
        if (resizeDirection.current.includes("e")) {
            newWidth = clientX - containerRef.current.getBoundingClientRect().left;
        }
        // West
        if (resizeDirection.current.includes("w")) {
            const delta = clientX - containerRef.current.getBoundingClientRect().left;
            newWidth = size.ref.current.width - delta;
            const maxWidth = (maxSize && maxSize.width > 0) ? maxSize.width : 10000000;
            
            if (newWidth >= (minSize?.width ?? 0) && newWidth <= maxWidth)
                position.current.x += delta;
        }

        if (
            newWidth !== size.ref.current.width ||
            newHeight !== size.ref.current.height
        ) {
            newWidth = minSize ? Math.max(newWidth, minSize.width) : newWidth;
            newHeight = minSize ? Math.max(newHeight, minSize.height) : newHeight;
            newWidth = maxSize ? Math.min(newWidth, maxSize.width > 0 ? maxSize.width : newWidth) : newWidth;
            newHeight = maxSize ? Math.min(newHeight, maxSize.height > 0 ? maxSize.height : newHeight) : newHeight;

            size.update({ width: newWidth, height: newHeight });
        }
    }, [pointerPosition, containerRef, minSize, maxSize]);

    useEffect(() => {
        return () => window.removeEventListener("pointerup", onPointerUp);
    }, []);

    // First child measurement
    useEffect(() => {
        if (!childrenElement) {
            // Clone the child to inject the ref
            const childWithRef = cloneElement(children as React.ReactElement<any>, {
                ref: contentRef,
            });
            setChildrenElement(childWithRef);
        }
    }, [childrenElement]);

    const background = "bg-gray-500/50";
    const background2 = "bg-gray-500/50";

    if (!childrenElement) {
        return null;
    }

    if (Number.isNaN(size.ref.current.width)) {
        return childrenElement;
    }

    const width = size.ref.current.width;
    const height = size.ref.current.height;

    return (
        <div className={`${className} relative`} style={{ width, height }}>
            <div
                ref={containerRef}
                className={`absolute`}
                style={{
                    width: '100%',
                    height: '100%',
                    left: position.current.x,
                    top: position.current.y,
                }}
            >
                {childrenElement}

                {/* Invisible Resizable Zone (NW) */}
                {(!directions || directions.includes('nw')) &&
                <div
                    className={`absolute top-0 left-0 w-[4px] h-[4px] ${background} cursor-nw-resize`}
                    data-direction='nw'
                    onPointerDown={startResize}
                />
                }

                {/* Invisible Resizable Zone (SW) */}
                {(!directions || directions.includes('sw')) &&
                <div
                    className={`absolute bottom-0 left-0 w-[4px] h-[4px] ${background} cursor-sw-resize`}
                    data-direction='sw'
                    onPointerDown={startResize}
                />
                }

                {/* Invisible Resizable Zone (NE) */}
                {(!directions || directions.includes('ne')) &&
                <div
                    className={`absolute top-0 right-0 w-[4px] h-[4px] ${background} cursor-ne-resize`}
                    data-direction='ne'
                    onPointerDown={startResize}
                />
                }

                {/* Invisible Resizable Zone (SE) */}
                {(!directions || directions.includes('se')) &&
                <div
                    className={`absolute bottom-0 right-0 w-[4px] h-[4px] ${background} cursor-se-resize`}
                    data-direction='se'
                    onPointerDown={startResize}
                />
                }

                {/* Invisible Resizable Zone (N) */}
                {(!directions || directions.includes('n')) &&
                <div
                    className={`absolute top-0 left-[4px] h-[4px] ${background2} cursor-n-resize`}
                    style={{ width: "calc(100% - 8px)" }}
                    data-direction='n'
                    onPointerDown={startResize}
                />
                }

                {/* Invisible Resizable Zone (S) */}
                {(!directions || directions.includes('s')) &&
                <div
                    className={`absolute bottom-0 left-[4px] h-[4px] ${background2} cursor-s-resize`}
                    style={{ width: "calc(100% - 8px)" }}
                    data-direction='s'
                    onPointerDown={startResize}
                />
                }

                {/* Invisible Resizable Zone (E) */}
                {(!directions || directions.includes('e')) &&
                <div
                    className={`absolute top-[4px] right-0 w-[4px] ${background2} cursor-e-resize`}
                    style={{ height: "calc(100% - 8px)" }}
                    data-direction='e'
                    onPointerDown={startResize}
                />
                }

                {/* Invisible Resizable Zone (W) */}
                {(!directions || directions.includes('w')) &&
                <div
                    className={`absolute top-[4px] left-0 w-[4px] ${background2} cursor-w-resize`}
                    style={{ height: "calc(100% - 8px)" }}
                    data-direction='w'
                    onPointerDown={startResize}
                />
                }
            </div>
        </div>
    );
};
