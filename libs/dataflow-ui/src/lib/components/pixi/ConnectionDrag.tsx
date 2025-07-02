import { Container, Texture } from "pixi.js";
import { useCallback } from "react";
import { useNodeContext, Node, PointerEventType, Pin } from "@dataflow-ui/contexts/NodeContext";
import { Coordinates } from "@dataflow-ide/dataflow-core";
import { LineTextures } from "./textures";
import { useExtend } from "@pixi/react";
import BezierCurve from "./BezierCurve";
import { useDashboardContext } from "@dataflow-ui/contexts/DashboardContext";
import { useRefSignal, useRefSignalEffect, useRefSignalMemo, useRefSignalRender } from "react-refsignal";

interface ConnectionOrigin {
    node: Node;
    pin: Pin;
    isDst: boolean;
    pos: Coordinates;
    texture: Texture | null;
}

export default function ConnectionDrag() {
    useExtend({Container});

    const { connectionDrag, nodes, onPointerUp } = useNodeContext();
    const { pointerPosition } = useDashboardContext();
    const position = useRefSignal<Coordinates>({x: NaN, y: NaN});
    
    // Computes origin when connectionDrag changes
    const origin = useRefSignalMemo((): ConnectionOrigin | undefined => {
        if (!connectionDrag.current) {
            position.current = {x: NaN, y: NaN};
            return undefined;
        }

        const node = nodes.current.get(connectionDrag.current.connector.id)?.current;
        if (!node) return undefined;

        let pin: Pin | undefined = undefined;
        let isDst = true;
        let texture: Texture | null = LineTextures.flow;

        if (connectionDrag.current.connector.pin === "execute") {
            pin = node.executePin;
        } else if (connectionDrag.current.connector.pin === "continue") {
            pin = node.continuePin;
            isDst = false;
        } else {
            pin = node.inputs.find((pin) => pin.id === connectionDrag.current?.connector.pin);
            
            if (!pin) {
                isDst = false;
                pin = node.outputs.find((pin) => pin.id === connectionDrag.current?.connector.pin);

                if (!pin) {
                    pin = node.branches.find((pin) => pin.id === connectionDrag.current?.connector.pin);
                } else {
                    const output = node.mutableNodeConfig.outputs?.find((output) => output.id === pin?.id);
                    if (output) {
                        texture = LineTextures[output.type] ?? LineTextures.custom;
                    }
                }
            } else {
                const input = node.mutableNodeConfig.inputs?.find((input) => input.id === pin?.id);
                if (input) {
                    texture = LineTextures[input.type] ?? LineTextures.custom;
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
            texture
        };
    }, [connectionDrag]);

    // This component captures pointer up event, so forward it back
    const handlePointerUp = useCallback((e: PointerEvent) => {
        onPointerUp({ element: 'connection', x: e.clientX, y: e.clientY, type: PointerEventType.POINTER_UP });
    }, [onPointerUp]);

    // Update position of drag cursor when origin is set and pointer position changes
    useRefSignalEffect(() => {
        if (origin.current) {
            position.update({...pointerPosition.current.canvasScaled});
        }
    }, [pointerPosition, origin]);

    // Re-render when origin changes
    useRefSignalRender([origin]);

    if (!origin.current) {
        return null;
    }

    return (
        <pixiContainer
            eventMode="dynamic"
            onPointerUp={handlePointerUp}
        >
            <BezierCurve
                from={origin.current.isDst ? position : origin.current.pos}
                to={origin.current.isDst ? origin.current.pos : position}
                alpha={0.8}
                controlPoints={100}
                texture={origin.current.texture ?? undefined}
            />
        </pixiContainer>
    );
}
