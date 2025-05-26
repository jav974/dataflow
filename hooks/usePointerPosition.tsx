import { useCallback, useEffect } from "react";
import { useRefState } from "./useRefState";
import { Coordinates } from "@/components/config/Schema";

interface UsePointerPositionReturn {
    readonly position: Coordinates;
    readonly lastUpdated: number;
}

export default function usePointerPosition(): UsePointerPositionReturn {
    const position = useRefState<Coordinates>({x: 0, y: 0});

    const handlePointerMove = useCallback((e: PointerEvent) => {
        position.ref.current.x = e.clientX;
        position.ref.current.y = e.clientY;
        position.setLastUpdated(Date.now());
    }, []);

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
        };
    }, [handlePointerMove]);

    return {
        position: position.ref.current,
        lastUpdated: position.lastUpdated
    }
}
