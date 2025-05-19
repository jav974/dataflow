import { useCallback, useEffect, useRef, useState } from "react";
import { InputPin, OutputPin, Pin as PinType, useNodes } from "@/contexts/NodeContext";
import PinExecute from "./PinExecute";
import PinContinue from "./PinContinue";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import BaseIcon from "../icons/BaseIcon";
import { useGraphContext } from "@/contexts/GraphContext";
import { Coordinates, NodeConfig, ParameterType } from "../config/Schema";
import NodeInputs from "./NodeInputs";
import NodeOutputs from "./NodeOutputs";
import useHoverable from "@/hooks/useHoverable";

export interface NodeProps extends NodeConfig {
    children?: React.ReactNode;
    size?: { width: number; height: number };
    hasExecute?: boolean;
    hasContinue?: boolean;
    multiple?: boolean;
    minInputParams?: number;
    inputMultipleType?: ParameterType;
}

export default function Node({ id, type, children, size, name, description, inputs, outputs, position,
    hasExecute = true, hasContinue = true, multiple = false, minInputParams = 0, inputMultipleType
 }: NodeProps) {
    const inputPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const outputPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const containerRef = useRef<HTMLDivElement | null>(null);
    const executeRef = useRef<HTMLDivElement | null>(null);
    const continueRef = useRef<HTMLDivElement | null>(null);
    const { registerNode, stopConnectionDrag } = useNodes();
    const { removeNode, scale } = useGraphContext();
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverable();

    const getScaledRelativePosition = useCallback((outerRect: DOMRect, innerRect: DOMRect, adjustments?: Coordinates): Coordinates => {
        return {
            x: (innerRect.left - outerRect.left) * scale.ref.current + (adjustments?.x ?? 0),
            y: (innerRect.top - outerRect.top) * scale.ref.current + (adjustments?.y ?? 0),
        }
    }, []);

    const getPin = useCallback((pinId: string, element: HTMLDivElement, containerRect: DOMRect, adjustments?: Coordinates): PinType => {
        const pinRect = element.getBoundingClientRect();
        const position = getScaledRelativePosition(containerRect, pinRect, adjustments);

        return {
            id: pinId,
            position
        }
    }, [getScaledRelativePosition]);

    const measurePositions = useCallback(() => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        
        const inputPins: InputPin[] = [];
        const outputPins: OutputPin[] = [];
        let executePin: PinType | undefined = undefined;
        let continuePin: PinType | undefined = undefined;

        if (executeRef.current) {
            executePin = getPin("execute", executeRef.current, containerRect, {x: 8, y: 12});
        }

        if (continueRef.current) {
            continuePin = getPin("continue", continueRef.current, containerRect, {x: 16, y: 12});
        }

        // Get input pin positions
        for (const [key, pin] of inputPinsRef.current.entries()) {
            const pinData = inputs?.find(input => input.id === key);
            
            if (pin && pinData) {
                let data: InputPin = { ...getPin(key, pin, containerRect, {x: 4, y: 6}), ...pinData };
                inputPins.push(data);
            }
        }
        
        // Get output pin positions
        for (const [key, pin] of outputPinsRef.current.entries()) {
            const pinData = outputs?.find(output => output.id === key);

            if (pin && pinData) {
                let data: OutputPin = { ...getPin(key, pin, containerRect, {x: 4, y: 6}), ...pinData };
                outputPins.push(data);
            }
        }

        registerNode(id, position, inputPins, outputPins, executePin, continuePin);
    }, [inputs, outputs, id, registerNode, getPin]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create ResizeObserver to track position changes
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(measurePositions, 100);
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [measurePositions]);

    useEffect(() => {
        // Initial measurement with delay
        const timeout = setTimeout(measurePositions, 100);

        return () => {
            clearTimeout(timeout);
        };
    }, [measurePositions]);

    const handleDeleteNode = useCallback(() => {
        removeNode(id);
    }, [id, removeNode]);

    const onPinExecuteRef = useCallback((el: HTMLDivElement | null) => {
        executeRef.current = el;
    }, []);

    const onPinContinueRef = useCallback((el: HTMLDivElement | null) => {
        continueRef.current = el;
    }, []);

    const onPinInputRef = useCallback((inputId: string, el: HTMLDivElement | null) => {
        inputPinsRef.current.set(inputId, el);
    }, []);

    const onPinOutputRef = useCallback((outputId: string, el: HTMLDivElement | null) => {
        outputPinsRef.current.set(outputId, el);
    }, []);

    const onPointerUp = useCallback(() => {
        stopConnectionDrag();
    }, [stopConnectionDrag]);

    return (
        <div ref={containerRef} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave} onPointerUp={onPointerUp}>
            <div className="bg-gray-800 rounded-lg p-1" style={{opacity: 0.9, minWidth: `${size?.width}px`}}>
                <div className="flex w-full">
                    {hasExecute && <PinExecute id={id} onRef={onPinExecuteRef} /> || <div></div>}
                    <div className="w-full text-center text-white font-semibold mb-2">{name || 'Unnamed Node'}</div>
                    {hasContinue && <PinContinue id={id} onRef={onPinContinueRef} /> || <div></div>}
                </div>

                {description && (
                    <div className="text-gray-400 text-sm mb-4">{description}</div>
                )}

                {children}

                <div className="grid grid-cols-2 gap-1">
                    <NodeInputs
                        nodeId={id}
                        inputs={inputs}
                        onRef={onPinInputRef}
                        multiple={multiple}
                        minInputParams={minInputParams}
                        inputMultipleType={inputMultipleType}
                    />

                    <NodeOutputs nodeId={id} outputs={outputs} onRef={onPinOutputRef} />
                </div>

                <div className={`${isHovered ? 'flex' : 'invisible'} justify-center mt-2`}>
                    <BaseIcon icon={Delete02Icon} color="red" onClick={handleDeleteNode}/>
                </div>
            </div>
        </div>
    );
}
