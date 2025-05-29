import { useCallback, useMemo } from "react";
import { useGraphContext } from "@/contexts/GraphContext";
import { PointerEventType, useNodes } from "@/contexts/NodeContext";

interface UseLinkableReturn {
    isConnected: boolean;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    handlePointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export default function useLinkable(id: string, pin: string, isInput: boolean = false, isOutput: boolean = false): UseLinkableReturn {
    const { startConnectionDrag, onPointerUp } = useNodes();
    const { removeConnections, connections } = useGraphContext();
    const isConnected = useMemo(() => {
        return connections.ref.current.find((connection) => {
            if (isInput || pin === "execute") {
                return connection.to.id === id && connection.to.pin === pin;
            } else {
                return connection.from.id === id && connection.from.pin === pin;
            }
        }) !== undefined;
    }, [connections.lastUpdated, id, pin, isInput, isOutput]);

    const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.ctrlKey) {
            if (isInput || pin === "execute") {
                removeConnections(undefined, {id, pin});
            } else {
                removeConnections({id, pin}, undefined);
            }
        }
    }, [removeConnections, id, pin, isInput, isOutput]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.ctrlKey) {
            startConnectionDrag({ id, pin });
        }
    }, [startConnectionDrag, id, pin]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        onPointerUp({
            type: PointerEventType.POINTER_UP,
            x: e.clientX,
            y: e.clientY,
            element: pin,
            id: id
        });
    }, [onPointerUp, id, pin]);

    return {
        isConnected,
        onClick,
        handlePointerDown,
        handlePointerUp,
    }
}
