import { Coordinates } from '@/dataflow/config/schema';
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { useDashboardContext } from '../contexts/DashboardContext';
import { useRefSignal, useRefSignalEffect, RefSignal } from 'react-refsignal';

interface UseDraggableReturn {
    readonly position: RefSignal<Coordinates>;
    readonly handlers: {
        readonly onPointerDown: (event: PointerEvent) => void;
        readonly onPointerUp: () => void;
        readonly onPointerUpOutside: () => void;
    }
}

export default function useDraggable(
    initialPosition: Coordinates = { x: 0, y: 0 },
    onPositionUpdated?: (position: Coordinates) => void
): UseDraggableReturn {
    const {pointerPosition} = useDashboardContext();
    const isDraggingRef = useRef<boolean>(false);
    const lastPosRef = useRef<Coordinates | undefined>(undefined);
    // Make a copy of the initial position to avoid mutating the original
    const position = useRefSignal<Coordinates>({...initialPosition});
    
    useRefSignalEffect(() => {
        if (isDraggingRef.current && lastPosRef.current) {
            const dx = pointerPosition.current.globalScaled.x - lastPosRef.current.x;
            const dy = pointerPosition.current.globalScaled.y - lastPosRef.current.y;
            
            lastPosRef.current.x = pointerPosition.current.globalScaled.x;
            lastPosRef.current.y = pointerPosition.current.globalScaled.y;
            position.current.x += dx;
            position.current.y += dy;

            position.notifyUpdate();

            if (onPositionUpdated) {
                onPositionUpdated(position.current);
            }
        }
    }, [pointerPosition]);

    const handlePointerUp = useCallback(() => {
        isDraggingRef.current = false;
        window.removeEventListener('pointerup', handlePointerUp);
    }, []);

    const handlePointerDown = useCallback(() => {
        lastPosRef.current = {...pointerPosition.current.globalScaled};
        isDraggingRef.current = true;
        window.addEventListener('pointerup', handlePointerUp);
    }, [handlePointerUp, pointerPosition]);

    const handlers = useMemo(() => ({
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerUpOutside: handlePointerUp,
    }), [handlePointerDown, handlePointerUp]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerUp]);

    return {
        position,
        handlers,
    };
}
