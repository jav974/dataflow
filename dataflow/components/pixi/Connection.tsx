import { useEffect, useRef, useState } from "react";
import { Texture } from "pixi.js";
import { ConnectorConfig, Coordinates } from "../../config/schema";
import { Node, Pin, useNodes } from "@/dataflow/contexts/NodeContext";
import { LineTextures } from "./textures";
import BezierCurve from "./BezierCurve";

interface ConnectionProps {
    from: ConnectorConfig;
    to: ConnectorConfig;
}

export default function Connection({from, to}: ConnectionProps) {
    const { nodes } = useNodes();
    const fromNode = useRef<Node | undefined>(undefined);
    const toNode = useRef<Node | undefined>(undefined);
    const fromPin = useRef<Pin | undefined>(undefined);
    const toPin = useRef<Pin | undefined>(undefined);
    const fromPos = useRef<Coordinates | undefined>(undefined);
    const toPos = useRef<Coordinates | undefined>(undefined);
    const [texture, setTexture] = useState<Texture | null>(null);

    useEffect(() => {
        // Initialize nodes
        if (from.id !== fromNode.current?.mutableNodeConfig.id || to.id !== toNode.current?.mutableNodeConfig.id) {
            fromNode.current = nodes.ref.current.get(from.id);
            toNode.current = nodes.ref.current.get(to.id);

            // Initialize pins
            if (fromNode.current && toNode.current) {
                // Output (value) to Input
                if (from.pin !== 'continue' && to.pin !== 'execute') {
                    fromPin.current = fromNode.current.outputs.find(output => output.id === from.pin);
                    toPin.current = toNode.current.inputs.find(input => input.id === to.pin);

                    const outputConfig = fromNode.current.mutableNodeConfig.outputs?.find(output => output.id === from.pin);
                    const inputConfig = toNode.current.mutableNodeConfig.inputs?.find(input => input.id === to.pin);

                    if (outputConfig && inputConfig) {
                        const key = outputConfig.type !== inputConfig.type
                            ? `${outputConfig.type}_${inputConfig.type}`
                            : outputConfig.type
                        ;
                        setTexture(LineTextures[key] ?? LineTextures.error);
                    }
                }
                // Output (branch) to Execute
                else if (from.pin !== 'continue' && to.pin === 'execute') {
                    fromPin.current = fromNode.current.branches.find(branch => branch.id === from.pin);
                    toPin.current = toNode.current.executePin;
                    setTexture(LineTextures.flow);
                }
                // Continue to Execute
                else if (from.pin === 'continue' && to.pin === 'execute') {
                    fromPin.current = fromNode.current.continuePin;
                    toPin.current = toNode.current.executePin;
                    setTexture(LineTextures.flow);
                }
            }
        }

        // Compute position
        if (fromNode.current && fromPin.current && toNode.current && toPin.current) {
            const tmpFrom: Coordinates = { x: fromNode.current.mutableNodeConfig.position.x + fromPin.current.position.x, y: fromNode.current.mutableNodeConfig.position.y + fromPin.current.position.y };
            const tmpTo: Coordinates = { x: toNode.current.mutableNodeConfig.position.x + toPin.current.position.x, y: toNode.current.mutableNodeConfig.position.y + toPin.current.position.y };
            
            // Trigger redraw if position has changed
            if (fromPos.current?.x !== tmpFrom.x || fromPos.current?.y !== tmpFrom.y
                || toPos.current?.x !== tmpTo.x || toPos.current?.y !== tmpTo.y
            ) {
                fromPos.current = tmpFrom;
                toPos.current = tmpTo;
            }
        } else {
            fromPos.current = undefined;
            toPos.current = undefined;
        }

        return () => {
            fromNode.current = undefined;
            toNode.current = undefined;
            fromPos.current = undefined;
            toPos.current = undefined;
        };
    }, [from, to, nodes.lastUpdated]);

    if (!fromPos.current || !toPos.current) {
        return null;
    }

    return (
        <BezierCurve
            from={fromPos.current}
            to={toPos.current}
            alpha={0.8}
            controlPoints={100}
            texture={texture ?? undefined}
        />
    );
}
