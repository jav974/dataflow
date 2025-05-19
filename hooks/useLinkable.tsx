import { useCallback, useEffect, useState } from "react";
import { useGraphContext } from "@/contexts/GraphContext";
import { PointerEventType, useNodes } from "@/contexts/NodeContext";

export default function useLinkable(id: string, pin: string, isInput: boolean = false, isOutput: boolean = false) {
    const { startConnectionDrag, onPointerUp } = useNodes();
    const { removeConnections, connections } = useGraphContext();
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        const isConnected = connections.ref.current.find((connection) => {
            if ((isOutput || pin === "continue")) {
                return connection.from.id === id && connection.from.pin === pin;
            } else {
                return connection.to.id === id && connection.to.pin === pin;
            }
        }) !== undefined;
        
        setIsConnected(isConnected);
    }, [connections.lastUpdated, id, pin, isInput, isOutput]);

    const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.ctrlKey) {
            removeConnections(
                (isOutput || pin === "continue") ? {id, pin} : undefined,
                (isInput || pin === "execute") ? {id, pin} : undefined
            );
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
