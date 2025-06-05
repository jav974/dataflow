import { Container, Texture } from "pixi.js";
import { useCallback, useMemo } from "react";
import { useNodes, Node, PointerEventType, Pin } from "@/dataflow/contexts/NodeContext";
import { useRefState } from "@/dataflow/hooks/useRefState";
import { Coordinates } from "../../config/schema";
import { LineTextures } from "./textures";
import { useExtend } from "@pixi/react";
import BezierCurve from "./BezierCurve";
import { useDashboardContext } from "@/dataflow/contexts/DashboardContext";
import { useRefSignalEffect, useRefSignalRender } from "@/dataflow/hooks/useRefSignal";

interface ConnectionOrigin {
    node: Node;
    pin: Pin;
    isDst: boolean;
    pos: Coordinates;
    texture: Texture | null;
}

export default function ConnectionDrag() {
    useExtend({Container});

    const { connectionDrag, nodes, onPointerUp } = useNodes();
    const { pointerPosition } = useDashboardContext();
    const position = useRefState<Coordinates>({x: NaN, y: NaN});
    const origin = useMemo((): ConnectionOrigin | undefined => {
        if (!connectionDrag.ref.current) {
            position.ref.current.x = NaN;
            position.ref.current.y = NaN;
            return undefined;
        }

        const node = nodes.ref.current.get(connectionDrag.ref.current.connector.id);
        if (!node) return undefined;

        let pin: Pin | undefined = undefined;
        let isDst = true;
        let texture: Texture | null = LineTextures.flow;

        if (connectionDrag.ref.current.connector.pin === "execute") {
            pin = node.executePin;
        } else if (connectionDrag.ref.current.connector.pin === "continue") {
            pin = node.continuePin;
            isDst = false;
        } else {
            pin = node.inputs.find((pin) => pin.id === connectionDrag.ref.current?.connector.pin);
            
            if (!pin) {
                isDst = false;
                pin = node.outputs.find((pin) => pin.id === connectionDrag.ref.current?.connector.pin);

                if (!pin) {
                    pin = node.branches.find((pin) => pin.id === connectionDrag.ref.current?.connector.pin);
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
    }, [connectionDrag.lastUpdated.current]);

    const handlePointerUp = useCallback((e: PointerEvent) => {
        onPointerUp({ element: 'connection', x: e.clientX, y: e.clientY, type: PointerEventType.POINTER_UP });
    }, [onPointerUp]);

    const updatePosition = useCallback(() => {
        position.update({...pointerPosition.ref.current.canvasScaled});
    }, [position]);

    useRefSignalEffect(() => {
        if (origin) {
            requestAnimationFrame(updatePosition);
        }
    }, [pointerPosition, origin]);

    useRefSignalRender([connectionDrag]);

    if (!origin) {
        return null;
    }

    return (
        <pixiContainer
            eventMode="dynamic"
            onPointerUp={handlePointerUp}
        >
            <BezierCurve
                from={origin.isDst ? position.ref.current : origin.pos}
                to={origin.isDst ? origin.pos : position.ref.current}
                alpha={0.8}
                controlPoints={100}
                texture={origin.texture ?? undefined}
            />
        </pixiContainer>
    );
}
