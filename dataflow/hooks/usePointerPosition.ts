import { useCallback, useEffect } from "react";
import { useRefState } from "./useRefState";
import { Coordinates } from "@/dataflow/config/schema";

interface UsePointerPositionReturn {
    readonly position: Coordinates;
    readonly lastUpdated: number;
}

export default function usePointerPosition(): UsePointerPositionReturn {
    const position = useRefState<Coordinates>({x: 0, y: 0});

    const handlePointerMove = useCallback((e: PointerEvent) => {
        position.current.x = e.clientX;
        position.current.y = e.clientY;
        position.notifyUpdate();
    }, [position]);

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
        };
    }, [handlePointerMove]);

    return {
        position: position.current,
        lastUpdated: position.lastUpdated
    }
}
