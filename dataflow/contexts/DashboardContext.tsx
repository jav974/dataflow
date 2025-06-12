import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { Coordinates } from "../config/schema";
import { useRefSignal, RefSignal } from "react-refsignal";
import { useGraphContext } from "./GraphContext";
import useResizeObserver from "../hooks/useResizeObserver";
import { Log } from "../engine/types";
import { useEvent } from "../hooks/useEvent";

interface PointerPosition {
    global: Coordinates;
    globalScaled: Coordinates;
    viewport: Coordinates;
    canvasScaled: Coordinates;
}

interface DashboardContextType {
    pointerPosition: RefSignal<PointerPosition>;
    canvasRef: React.RefObject<HTMLDivElement | null>;
    canvasRect: RefSignal<DOMRect | undefined>;
    logs: RefSignal<Log[]>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
    children: React.ReactNode;
}

export function DashboardProvider({children}: DashboardProviderProps) {
    const {scale, canvasPosition} = useGraphContext();
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const canvasRect = useRefSignal<DOMRect | undefined>(undefined);
    const pointerPosition = useRefSignal<PointerPosition>({
        global: {x: 0, y: 0},
        globalScaled: {x: 0, y: 0},
        viewport: {x: 0, y: 0},
        canvasScaled: {x: 0, y: 0},
    });
    const logs = useRefSignal<Log[]>([]);

    useResizeObserver(canvasRef, (entry) => {
        canvasRect.update(canvasRef.current?.getBoundingClientRect() ?? entry.contentRect);
    });

    const handlePointerMove = useCallback((event: PointerEvent) => {
        pointerPosition.ref.current.global.x = event.clientX;
        pointerPosition.ref.current.global.y = event.clientY;
        pointerPosition.ref.current.globalScaled.x = event.clientX * scale.ref.current;
        pointerPosition.ref.current.globalScaled.y = event.clientY * scale.ref.current;
        pointerPosition.ref.current.viewport.x = event.clientX - (canvasRect.ref.current?.left ?? 0);
        pointerPosition.ref.current.viewport.y = event.clientY - (canvasRect.ref.current?.top ?? 0);
        pointerPosition.ref.current.canvasScaled.x = (pointerPosition.ref.current.viewport.x - canvasPosition.ref.current.x) * scale.ref.current;
        pointerPosition.ref.current.canvasScaled.y = (pointerPosition.ref.current.viewport.y - canvasPosition.ref.current.y) * scale.ref.current;
        pointerPosition.notifyUpdate();
    }, []);

    // Update pointer position on pointer move
    useEffect(() => {
        window.addEventListener("pointermove", handlePointerMove);
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, [handlePointerMove]);

    useEvent<Log>('io_write', (log) => {
        logs.ref.current.push(log);
        logs.notifyUpdate();
    });

    return <DashboardContext.Provider value={{
        pointerPosition,
        canvasRef,
        canvasRect,
        logs
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
