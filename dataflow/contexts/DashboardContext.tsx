import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Signal, useSignal } from "@preact/signals-react";
import { Coordinates } from "../config/schema";
import { useGraphContext } from "./GraphContext";
import useResizeObserver from "../hooks/useResizeObserver";
import { Size } from "pixi.js";

interface PointerPosition {
    global: Coordinates;
    globalScaled: Coordinates;
    viewport: Coordinates;
    canvasScaled: Coordinates;
}

interface DashboardContextType {
    pointerPositionSignal: Signal<PointerPosition>;
    viewPortRef: React.RefObject<HTMLDivElement | null>;
    viewPortRectRef: React.RefObject<DOMRect | undefined>;
    viewPortSize: Size;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
    children: React.ReactNode;
}

export function DashboardProvider({children}: DashboardProviderProps) {
    const {scale, canvasPosition} = useGraphContext();
    const viewPortRef = useRef<HTMLDivElement | null>(null);
    const viewPortRectRef = useRef<DOMRectReadOnly | undefined>(undefined);
    const [viewPortSize, setViewPortSize] = useState<Size>({ width: 0, height: 0 });
    const pointerPositionSignal = useSignal<PointerPosition>({
        global: { x: 0, y: 0 },
        globalScaled: { x: 0, y: 0 },
        viewport: { x: 0, y: 0 },
        canvasScaled: { x: 0, y: 0 }
    });

    const handleResize = useCallback((entry: ResizeObserverEntry) => {
        viewPortRectRef.current = viewPortRef.current?.getBoundingClientRect() ?? entry.contentRect;
        setViewPortSize({width: entry.contentRect.width, height: entry.contentRect.height});
    }, []);

    useResizeObserver(viewPortRef, handleResize);

    const updatePointerPosition = useCallback((event: PointerEvent) => {
        pointerPositionSignal.value = {
            global: { x: event.clientX, y: event.clientY },
            globalScaled: {
                x: event.clientX * scale.ref.current,
                y: event.clientY * scale.ref.current
            },
            viewport: {
                x: event.clientX - (viewPortRectRef.current?.left ?? 0),
                y: event.clientY - (viewPortRectRef.current?.top ?? 0)
            },
            canvasScaled: {
                x: (event.clientX - (viewPortRectRef.current?.left ?? 0) - canvasPosition.ref.current.x) * scale.ref.current,
                y: (event.clientY - (viewPortRectRef.current?.top ?? 0) - canvasPosition.ref.current.y) * scale.ref.current
            }
        };
    }, []);

    // Update pointer position on pointer move
    useEffect(() => {
        window.addEventListener("pointermove", updatePointerPosition);
        return () => window.removeEventListener("pointermove", updatePointerPosition);
    }, [updatePointerPosition]);

    return <DashboardContext.Provider value={{
        pointerPositionSignal,
        viewPortRef,
        viewPortRectRef,
        viewPortSize
    }}>
        {children}
    </DashboardContext.Provider>;
}

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }
    return context;
}
