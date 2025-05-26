import { Graphics, StrokeStyle } from "pixi.js";
import FastGraphics from "./FastGraphics";
import { useCallback, useMemo } from "react";
import { useNodes, Node, PointerEventType, Pin } from "@/contexts/NodeContext";
import { LINE_STYLE, LineStyle } from "../config/Style";
import { drawBezierCurve } from "./functions";
import { useGraphContext } from "@/contexts/GraphContext";
import { useRefState } from "@/hooks/useRefState";
import { Coordinates } from "../config/Schema";

interface ConnectionOrigin {
    node: Node;
    pin: Pin;
    isDst: boolean;
    pos: Coordinates;
    lineStyle: StrokeStyle;
}

export default function ConnectionDrag() {
    const { connectionDrag, nodes, onPointerUp } = useNodes();
    const { scale, canvasPosition } = useGraphContext();
    const position = useRefState<Coordinates>({x: 0, y: 0});
    const origin = useMemo((): ConnectionOrigin | undefined => {
        if (!connectionDrag) {
            return undefined;
        }

        const node = nodes.ref.current.get(connectionDrag.connector.id);
        if (!node) return undefined;

        let pin: Pin | undefined = undefined;
        let isDst = true;
        let lineStyle: StrokeStyle = LineStyle.flow;

        if (connectionDrag.connector.pin === "execute") {
            pin = node.executePin;
        } else if (connectionDrag.connector.pin === "continue") {
            pin = node.continuePin;
            isDst = false;
        } else {
            pin = node.inputs.find((pin) => pin.id === connectionDrag.connector.pin);
            
            if (!pin) {
                isDst = false;
                pin = node.outputs.find((pin) => pin.id === connectionDrag.connector.pin);

                if (!pin) {
                    pin = node.branches.find((pin) => pin.id === connectionDrag.connector.pin);
                } else {
                    const output = node.mutableNodeConfig.outputs?.find((output) => output.id === pin?.id);
                    if (output) {
                        lineStyle = LineStyle[output.type] ?? LineStyle.custom;
                    }
                }
            } else {
                const input = node.mutableNodeConfig.inputs?.find((input) => input.id === pin?.id);
                if (input) {
                    lineStyle = LineStyle[input.type] ?? LineStyle.custom;
                }
            }
        }

        if (!pin) {
            return undefined;
        }

        return {
            node,
            pin,
            isDst,
            pos: {
                x: node.mutableNodeConfig.position.x + pin.position.x,
                y: node.mutableNodeConfig.position.y + pin.position.y
            },
            lineStyle
        };
    }, [connectionDrag]);

    const draw = useCallback((g: Graphics) => {
        g.clear();

        if (!origin) {
            return ;
        }

        g.beginPath();
        drawBezierCurve(
            g,
            origin.isDst ? position.ref.current : origin.pos,
            origin.isDst ? origin.pos : position.ref.current
        );
        g.stroke(origin.lineStyle);
    }, [origin]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        position.ref.current.x = (e.clientX - canvasPosition.ref.current.x) * scale.ref.current;
        position.ref.current.y = (e.clientY - canvasPosition.ref.current.y) * scale.ref.current;
        position.setLastUpdated(Date.now());
    }, []);

    const handlePointerUp = useCallback((e: PointerEvent) => {
        onPointerUp({ element: 'connection', x: e.clientX, y: e.clientY, type: PointerEventType.POINTER_UP });
    }, [onPointerUp]);

    return (
        <FastGraphics eventMode="dynamic" draw={draw} drawDependencies={[position.lastUpdated]} onPointerUp={handlePointerUp} onGlobalPointerMove={handlePointerMove}/>
    );
}
