import { useCallback, useRef, useState } from "react";
import { Texture } from "pixi.js";
import { ConnectorConfig, Coordinates, ParameterTypes } from "@dataflow-ide/dataflow-core";
import { Node, Pin, useNodeContext } from "@dataflow-ui/contexts/NodeContext";
import { LineTextures } from "./textures";
import BezierCurve from "./BezierCurve";
import { useNodeLastUpdatedEvent } from "@dataflow-ui/hooks/useLastUpdated";
import { RefSignal, useRefSignal, useRefSignalEffect, useRefSignalRender } from "react-refsignal";

interface ConnectionProps {
    from: ConnectorConfig;
    to: ConnectorConfig;
}

export default function Connection({from, to}: ConnectionProps) {
    const { nodes } = useNodeContext();
    const fromNode = useRefSignal<Node | undefined>(undefined);
    const toNode = useRefSignal<Node | undefined>(undefined);
    const fromPin = useRef<Pin | undefined>(undefined);
    const toPin = useRef<Pin | undefined>(undefined);
    const fromPos = useRefSignal<Coordinates | undefined>(undefined);
    const toPos = useRefSignal<Coordinates | undefined>(undefined);
    const [texture, setTexture] = useState<Texture | null>(null);

    // Re-render component when fromNode and toNode have been set/updated
    useRefSignalRender([fromNode, toNode], () =>
        fromNode.current !== undefined && toNode.current !== undefined
    );

    const computePositions = useCallback(() => {
        if (fromNode.current && fromPin.current && toNode.current && toPin.current) {
            const tmpFrom: Coordinates = {
                x: fromNode.current.mutableNodeConfig.position.x + fromPin.current.position.x,
                y: fromNode.current.mutableNodeConfig.position.y + fromPin.current.position.y
            };
            const tmpTo: Coordinates = {
                x: toNode.current.mutableNodeConfig.position.x + toPin.current.position.x,
                y: toNode.current.mutableNodeConfig.position.y + toPin.current.position.y
            };

            if (fromPos.current?.x !== tmpFrom.x || fromPos.current?.y !== tmpFrom.y
                || toPos.current?.x !== tmpTo.x || toPos.current?.y !== tmpTo.y
            ) {
                fromPos.update(tmpFrom);
                toPos.update(tmpTo);
            }
        } else {
            fromPos.current = undefined;
            toPos.current = undefined;
        }
    }, [fromNode, toNode, fromPos, toPos]);

    const updateTrackedFrom = useCallback((value: Node) => {
        fromNode.update(value);
    }, [fromNode]);

    const updateTrackedTo = useCallback((value: Node) => {
        toNode.update(value);
    }, [toNode]);

    // Initialize fromNode and toNode on initial mount and after nodes update
    useRefSignalEffect(() => {
        const _fromNode = nodes.current.get(from.id);
        const _toNode = nodes.current.get(to.id);

        if (_fromNode && _fromNode.current.mutableNodeConfig.id !== fromNode.current?.mutableNodeConfig.id) {
            _fromNode.subscribe(updateTrackedFrom);
            fromNode.update(_fromNode.current);
        }

        if (_toNode && _toNode.current.mutableNodeConfig.id !== toNode.current?.mutableNodeConfig.id) {
            _toNode.subscribe(updateTrackedTo);
            toNode.update(_toNode.current);
        }

        return () => {
            _fromNode?.unsubscribe(updateTrackedFrom);
            _toNode?.unsubscribe(updateTrackedTo);
        };
    }, [nodes, updateTrackedFrom, updateTrackedTo]);

    // Initialize pins after fromNode and toNode update
    useRefSignalEffect(() => {
        if (fromNode.current && toNode.current) {
            // Output (value) to Input
            if (from.pin !== 'continue' && to.pin !== 'execute') {
                fromPin.current = fromNode.current.outputs.find(output => output.id === from.pin);
                toPin.current = toNode.current.inputs.find(input => input.id === to.pin);

                const outputConfig = fromNode.current.mutableNodeConfig.outputs?.find(output => output.id === from.pin);
                const inputConfig = toNode.current.mutableNodeConfig.inputs?.find(input => input.id === to.pin);

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

        // Initial position compute
        computePositions();
    }, [fromNode, toNode, computePositions]);

    // Recompute position after node movement
    useNodeLastUpdatedEvent(from.id, () => {
        computePositions();
    });
    useNodeLastUpdatedEvent(to.id, () => {
        computePositions();
    });

    if (!fromPos.current || !toPos.current) {
        return null;
    }

    return (
        <BezierCurve
            from={fromPos as RefSignal<Coordinates>}
            to={toPos as RefSignal<Coordinates>}
            alpha={0.8}
            controlPoints={100}
            texture={texture ?? undefined}
        />
    );
}
