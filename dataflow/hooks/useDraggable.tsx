import { Coordinates } from '@/dataflow/config/schema';
import { useGraphContext } from '@/dataflow/contexts/GraphContext';
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useRefState } from './useRefState';

interface UseDraggableReturn {
    readonly position: Coordinates;
    readonly lastUpdated: number;
    readonly handlers: {
        readonly onPointerDown: (event: PointerEvent) => void;
        readonly onPointerMove: (event: PointerEvent) => void;
        readonly onPointerUp: () => void;
        readonly onPointerUpOutside: () => void;
    }
}

export default function useDraggable(initialPosition: Coordinates = { x: 0, y: 0 }): UseDraggableReturn {
    const {scale} = useGraphContext();
    const isDraggingRef = useRef<boolean>(false);
    const lastPosRef = useRef<Coordinates | undefined>(undefined);
    // Make a copy of the initial position to avoid mutating the original
    const position = useRefState<Coordinates>({...initialPosition});
    
    const handlePointerMove = useCallback((event: PointerEvent) => {
        if (isDraggingRef.current && lastPosRef.current) {
            const dx = event.clientX * scale.ref.current - lastPosRef.current.x;
            const dy = event.clientY * scale.ref.current - lastPosRef.current.y;
            
            lastPosRef.current.x = event.clientX * scale.ref.current;
            lastPosRef.current.y = event.clientY * scale.ref.current;
            position.ref.current.x += dx;
            position.ref.current.y += dy;

            position.setLastUpdated(Date.now());
        }
    }, []);

    const handlePointerUp = useCallback(() => {
        isDraggingRef.current = false;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    }, [handlePointerMove]);

    const handlePointerDown = useCallback((event: PointerEvent) => {
        lastPosRef.current = { x: event.clientX * scale.ref.current, y: event.clientY * scale.ref.current };
        isDraggingRef.current = true;
        
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }, [handlePointerMove, handlePointerUp]);

    const handlers = useMemo(() => ({
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerUpOutside: handlePointerUp,
    }), [handlePointerDown, handlePointerMove, handlePointerUp]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerMove, handlePointerUp]);

    return {
        position: position.ref.current,
        lastUpdated: position.lastUpdated,
        handlers,
    };
}
