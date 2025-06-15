import { useCallback, useEffect, useRef, useState } from "react";
import { Texture } from "pixi.js";
import { ConnectorConfig, Coordinates, ParameterTypes } from "../../config/schema";
import { Node, Pin, useNodes } from "@/dataflow/contexts/NodeContext";
import { LineTextures } from "./textures";
import BezierCurve from "./BezierCurve";
import { useNodeLastUpdated } from "@/dataflow/hooks/useLastUpdated";
import { batch, RefSignal, useRefSignal, useRefSignalEffect, useRefSignalRender } from "react-refsignal";

interface ConnectionProps {
    from: ConnectorConfig;
    to: ConnectorConfig;
}

export default function Connection({from, to}: ConnectionProps) {
    const { nodes } = useNodes();
    const fromNode = useRef<RefSignal<Node> | undefined>(undefined);
    const toNode = useRef<RefSignal<Node> | undefined>(undefined);
    const trackedFrom = useRefSignal<Node | undefined>(undefined);
    const trackedTo = useRefSignal<Node | undefined>(undefined);
    const fromPin = useRef<Pin | undefined>(undefined);
    const toPin = useRef<Pin | undefined>(undefined);
    const fromPos = useRef<Coordinates | undefined>(undefined);
    const toPos = useRef<Coordinates | undefined>(undefined);
    const [texture, setTexture] = useState<Texture | null>(null);
    const fromNodeUpdatedAt = useNodeLastUpdated(from.id);
    const toNodeUpdatedAt = useNodeLastUpdated(to.id);

    const computePositions = useCallback(() => {
        if (fromNode.current && fromPin.current && toNode.current && toPin.current) {
            const tmpFrom: Coordinates = { x: fromNode.current.current.mutableNodeConfig.position.x + fromPin.current.position.x, y: fromNode.current.current.mutableNodeConfig.position.y + fromPin.current.position.y };
            const tmpTo: Coordinates = { x: toNode.current.current.mutableNodeConfig.position.x + toPin.current.position.x, y: toNode.current.current.mutableNodeConfig.position.y + toPin.current.position.y };

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
    }, []);

    // Re-render component when fromNode or toNode has been set
    useRefSignalRender([trackedFrom, trackedTo]);

    // Initialize fromNode and toNode after nodes update
    useRefSignalEffect(() => {
        fromNode.current = nodes.current.get(from.id);
        toNode.current = nodes.current.get(to.id);

        batch(() => {
            trackedFrom.update(fromNode.current?.current);
            trackedTo.update(toNode.current?.current);
        }, [trackedFrom, trackedTo]);
    }, [nodes]);

    // Initialize pins after fromNode and toNode update
    useRefSignalEffect(() => {
        if (fromNode.current && toNode.current) {
            // Output (value) to Input
            if (from.pin !== 'continue' && to.pin !== 'execute') {
                fromPin.current = fromNode.current.current.outputs.find(output => output.id === from.pin);
                toPin.current = toNode.current.current.inputs.find(input => input.id === to.pin);

                const outputConfig = fromNode.current.current.mutableNodeConfig.outputs?.find(output => output.id === from.pin);
                const inputConfig = toNode.current.current.mutableNodeConfig.inputs?.find(input => input.id === to.pin);

                if (outputConfig && inputConfig) {
                    // undefined should evaluate as false here, so keep this coercion operator !!
                    if (!!outputConfig.isCollection !== !!inputConfig.isCollection && inputConfig.type !== ParameterTypes.ANY) {
                        setTexture(LineTextures.error);
                    } else {
                        const inputKey = !LineTextures[inputConfig.type] ? 'custom' : inputConfig.type;
                        const outputKey = !LineTextures[outputConfig.type] ? 'custom' : outputConfig.type;
                        const key = outputConfig.type !== inputConfig.type
                            ? `${outputKey}_${inputKey}`
                            : outputKey
                        ;
                        setTexture(LineTextures[key] ?? LineTextures.error);
                    }
                }
            }
            // Output (branch) to Execute
            else if (from.pin !== 'continue' && to.pin === 'execute') {
                fromPin.current = fromNode.current.current.branches.find(branch => branch.id === from.pin);
                toPin.current = toNode.current.current.executePin;
                setTexture(LineTextures.flow);
            }
            // Continue to Execute
            else if (from.pin === 'continue' && to.pin === 'execute') {
                fromPin.current = fromNode.current.current.continuePin;
                toPin.current = toNode.current.current.executePin;
                setTexture(LineTextures.flow);
            }
        }

        // Initial position compute
        computePositions();
    }, [fromNode.current, toNode.current, computePositions]);

    // Recompute position after node movement
    useEffect(() => {
        computePositions();
    }, [fromNodeUpdatedAt, toNodeUpdatedAt]);

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
