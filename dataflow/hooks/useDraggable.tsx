import { Coordinates } from '@/dataflow/config/schema';
import { useGraphContext } from '@/dataflow/contexts/GraphContext';
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useRefState } from './useRefState';
import { useDashboardContext } from '../contexts/DashboardContext';
import { effect, Signal, useSignal } from "@preact/signals-react";
import { debounce } from "lodash";

interface UseDraggableReturn {
    readonly position: Coordinates;
    readonly positionSignal: Signal<Coordinates>;
    readonly lastUpdated: number;
    readonly handlers: {
        readonly onPointerDown: (event: PointerEvent) => void;
        readonly onPointerUp: () => void;
        readonly onPointerUpOutside: () => void;
    }
}

export default function useDraggable(initialPosition: Coordinates = { x: 0, y: 0 }, mutate: boolean = false, notifyUpdate: boolean = true): UseDraggableReturn {
    const {scale} = useGraphContext();
    const isDraggingRef = useRefState<boolean>(false);
    const lastPosRef = useRef<Coordinates | undefined>(undefined);
    const position = useRefState<Coordinates>(mutate ? initialPosition : {...initialPosition});
    const {pointerPositionSignal} = useDashboardContext();
    const positionSignal = useSignal<Coordinates>(position.ref.current);
    
    const updatePosition = useCallback(() => {
        position.setLastUpdated(Date.now());
    }, []);

    effect(() => {
        if (isDraggingRef.ref.current && lastPosRef.current) {
            const {x, y} = pointerPositionSignal.value.globalScaled;

            if (x === lastPosRef.current.x && y === lastPosRef.current.y) {
                return; // No movement, no need to update position
            }

            // Calculate the change in position based on the pointer position and scale
            const dx = x - lastPosRef.current.x;
            const dy = y - lastPosRef.current.y;
            
            lastPosRef.current.x = x;
            lastPosRef.current.y = y;
            position.ref.current.x += dx;
            position.ref.current.y += dy;

            positionSignal.value = {...position.ref.current};

            // debounce the last updated time to avoid excessive updates
            if (notifyUpdate) {
                debounce(updatePosition, 0)();
            }
        }
    });

    const handlePointerUp = useCallback(() => {
        isDraggingRef.update(false);
        lastPosRef.current = undefined;
    }, []);

    const handlePointerDown = useCallback((event: PointerEvent) => {
        isDraggingRef.update(true);
        lastPosRef.current = { x: event.clientX * scale.ref.current, y: event.clientY * scale.ref.current };
    }, []);

    const handlers = useMemo(() => ({
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerUpOutside: handlePointerUp,
    }), [handlePointerDown, handlePointerUp]);

    // Add pointerup event listener when dragging starts
    // and remove it when dragging stops
    useEffect(() => {
        if (isDraggingRef.ref.current) {
            window.addEventListener('pointerup', handlePointerUp);
        } else {
            window.removeEventListener('pointerup', handlePointerUp);
        }
    }, [isDraggingRef.lastUpdated, handlePointerUp]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerUp]);

    return {
        position: position.ref.current,
        positionSignal,
        lastUpdated: position.lastUpdated,
        handlers,
    };
}
