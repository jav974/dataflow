import { Coordinates } from '@/components/config/Schema';
import { useGraphContext } from '@/contexts/GraphContext';
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useRefState } from '../useRefState';

interface Draggable {
    position: Coordinates;
    lastUpdated: number;
    handlers: {
        onPointerDown: (event: any) => void;
        onPointerMove: (event: any) => void;
        onPointerUp: () => void;
        onPointerUpOutside: () => void;
    }
}

export default function useDraggable(initialPosition: Coordinates = { x: 0, y: 0 }): Draggable {
    const {scale} = useGraphContext();
    const isDraggingRef = useRef<boolean>(false);
    const lastPosRef = useRef<Coordinates>(initialPosition);
    const position = useRefState<Coordinates>(initialPosition);

    const handlePointerMove = useCallback((event: any) => {
        if (isDraggingRef.current) {
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

    const handlePointerDown = useCallback((event: any) => {
        isDraggingRef.current = true;
        lastPosRef.current = { x: event.clientX * scale.ref.current, y: event.clientY * scale.ref.current };
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
        handlers
    };
}
