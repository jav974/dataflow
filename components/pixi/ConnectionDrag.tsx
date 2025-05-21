import { Graphics } from "pixi.js";
import FastGraphics from "./FastGraphics";
import { useCallback, useEffect, useState } from "react";
import { useNodes, Node, PointerEventType } from "@/contexts/NodeContext";
import { LINE_STYLE } from "../config/Style";
import { drawBezierCurve } from "./functions";
import { useGraphContext } from "@/contexts/GraphContext";
import { useRefState } from "@/hooks/useRefState";
import { Coordinates } from "../config/Schema";

export default function ConnectionDrag() {
    const { connectionDrag, nodes, onPointerUp } = useNodes();
    const { scale, canvasPosition } = useGraphContext();
    const [fromNode, setFromNode] = useState<Node | undefined>(undefined);
    const position = useRefState<Coordinates>({x: 0, y: 0});

    useEffect(() => {
        if (!connectionDrag) {
            setFromNode(undefined);
            return;
        }

        setFromNode(nodes.ref.current.get(connectionDrag.connector.id));
    }, [connectionDrag]);

    const draw = useCallback((g: Graphics) => {
        g.clear();

        if (!fromNode) {
            return ;
        }

        let fromPin = undefined;

        if (connectionDrag?.connector.pin === "execute") {
            fromPin = fromNode?.executePin;
        } else if (connectionDrag?.connector.pin === "continue") {
            fromPin = fromNode?.continuePin;
        } else {
            fromPin = fromNode?.inputs.find((pin) => pin.id === connectionDrag?.connector.pin);
            
            if (!fromPin) {
                fromPin = fromNode?.outputs.find((pin) => pin.id === connectionDrag?.connector.pin);
            }
        }
 
        if (!fromPin) {
            return ;
        }

        g.beginPath();
        const from = { x: fromNode.mutableNodeConfig.position.x + fromPin.position.x, y: fromNode.mutableNodeConfig.position.y + fromPin.position.y };
        drawBezierCurve(g, from, position.ref.current);
        g.stroke(LINE_STYLE);
    }, [fromNode]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        position.ref.current.x = (e.clientX - canvasPosition.ref.current.x) * scale.ref.current;
        position.ref.current.y = (e.clientY - canvasPosition.ref.current.y) * scale.ref.current;
        position.setLastUpdated(Date.now());
    }, []);

    const handlePointerUp = useCallback((e: PointerEvent) => {
        onPointerUp({ element: 'connection', x: e.clientX, y: e.clientY, type: PointerEventType.POINTER_UP });
    }, []);

    return (
        <FastGraphics eventMode="dynamic" draw={draw} drawDependencies={[position.lastUpdated]} onPointerUp={handlePointerUp} onGlobalPointerMove={handlePointerMove}/>
    );
}
