import React, { useCallback, useEffect, useRef, useState } from "react";
import { InputPin, OutputBranchPin, OutputPin, Pin as PinType, useNodes } from "@/dataflow/contexts/NodeContext";
import PinExecute from "./pin/PinExecute";
import PinContinue from "./pin/PinContinue";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import BaseIcon from "../icons/BaseIcon";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { Coordinates, NodeConfig, ParameterType } from "../../config/schema";
import NodeInputs from "./NodeInputs";
import NodeOutputs from "./NodeOutputs";
import useHoverable from "@/dataflow/hooks/useHoverable";
import { isOverlapping } from "../pixi/functions";
import useFocusable from "@/dataflow/hooks/useFocusable";
import { Signal, useComputed, useSignalEffect } from "@preact/signals-react";
import useResizeObserver from "@/dataflow/hooks/useResizeObserver";

export interface NodeProps {
    node: Signal<NodeConfig>;
    children?: React.ReactNode;
    size?: { width: number; height: number };
    hasExecute?: boolean;
    hasContinue?: boolean;
    inputMultiple?: boolean;
    minInputParams?: number;
    inputMultipleType?: ParameterType;
    context?: Map<string, any>;
    outputMultiple?: boolean;
    branchMultiple?: boolean;
    minBranches?: number;
}

export default function Node({
    node: nodeSignal, children, size, hasExecute = true, hasContinue = true,
    inputMultiple = false, minInputParams = 0, inputMultipleType,
    outputMultiple = false, branchMultiple = false, minBranches = 0
 }: NodeProps) {
    const [node, setNode] = useState<NodeConfig>(nodeSignal.value);
    const inputPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const outputPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const outputBranchPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const containerRef = useRef<HTMLDivElement | null>(null);
    const executeRef = useRef<HTMLDivElement | null>(null);
    const continueRef = useRef<HTMLDivElement | null>(null);
    const { registerNode, stopConnectionDrag, selectionArea, setSelected, isSelected, stopSelection } = useNodes();
    const { removeNode, scale } = useGraphContext();
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverable();
    const selected = isSelected(node.id);
    const {isFocused, handlers: { onPointerDown, onContextMenu }} = useFocusable(containerRef);

    useSignalEffect(() => {
        setNode(nodeSignal.value);
    });

    const getScaledRelativePosition = useComputed(() => (outerRect: DOMRect, innerRect: DOMRect, adjustments?: Coordinates): Coordinates => {
        return {
            x: (innerRect.left - outerRect.left) * scale.value + (adjustments?.x ?? 0),
            y: (innerRect.top - outerRect.top) * scale.value + (adjustments?.y ?? 0),
        }
    });

    const getPin = useComputed(() => (pinId: string, element: HTMLDivElement, containerRect: DOMRect, adjustments?: Coordinates): PinType => {
        const pinRect = element.getBoundingClientRect();
        const position = getScaledRelativePosition.value(containerRect, pinRect, adjustments);

        return {
            id: pinId,
            position
        }
    });

    const measurePositions = useComputed(() => () => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        
        const inputPins: InputPin[] = [];
        const outputPins: OutputPin[] = [];
        const outputBranchPins: OutputBranchPin[] = [];
        let executePin: PinType | undefined = undefined;
        let continuePin: PinType | undefined = undefined;

        if (executeRef.current) {
            executePin = getPin.value("execute", executeRef.current, containerRect, {x: 8, y: 12});
        }

        if (continueRef.current) {
            continuePin = getPin.value("continue", continueRef.current, containerRect, {x: 16, y: 12});
        }

        // Get input pin positions
        for (const [key, pin] of inputPinsRef.current.entries()) {
            const pinData = node.inputs?.find(input => input.id === key);
            
            if (pin && pinData) {
                let data: InputPin = { ...getPin.value(key, pin, containerRect, {x: 4, y: 6}), ...pinData };
                inputPins.push(data);
            }
        }
        
        // Get output pin positions
        for (const [key, pin] of outputPinsRef.current.entries()) {
            const pinData = node.outputs?.find(output => output.id === key);

            if (pin && pinData) {
                let data: OutputPin = { ...getPin.value(key, pin, containerRect, {x: 4, y: 6}), ...pinData };
                outputPins.push(data);
            }
        }

        // Get output branch pin positions
        for (const [key, pin] of outputBranchPinsRef.current.entries()) {
            const pinData = node.branches?.find(branch => branch.id === key);

            if (pin && pinData) {
                let data: OutputBranchPin = { ...getPin.value(key, pin, containerRect, {x: 14, y: 10}), ...pinData };
                outputBranchPins.push(data);
            }
        }

        registerNode(node, inputPins, outputPins, outputBranchPins, executePin, continuePin);
    });

    useResizeObserver(containerRef, measurePositions.value);

    useEffect(() => {
        if (!containerRef.current || !selectionArea.ref.current) return;

        const overlapping = isOverlapping(
            selectionArea.ref.current,
            containerRef.current.getBoundingClientRect()
        );

        if (overlapping !== selected) {
            setSelected(node.id, overlapping);
        }
    }, [node.id, selectionArea.lastUpdated, isSelected, selected]);

    const handleDeleteNode = useCallback(() => {
        removeNode(node.id);
    }, [node.id, removeNode]);

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

    const onPinOutputBranchRef = useCallback((branchId: string, el: HTMLDivElement | null) => {
        outputBranchPinsRef.current.set(branchId, el);
    }, []);

    const onPointerUp = useCallback(() => {
        stopConnectionDrag();
        stopSelection();
    }, [stopConnectionDrag, stopSelection]);

    const handleCtrlClick = useCallback((e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setSelected(node.id, !selected);
        }
    }, [node.id, selected, setSelected]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isFocused && !selected) return;

        // Deselect and unfocus node on Escape key
        if (e.key === 'Escape') {
            setSelected(node.id, false);
            onPointerDown();
        }
    }, [isFocused, selected, node.id, setSelected, onPointerDown]);

    return (
        <div
            ref={containerRef}
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onContextMenu={onContextMenu}
            onClick={handleCtrlClick}
            onKeyDownCapture={handleKeyDown}
            tabIndex={0}
        >
            <div
                className={`bg-gray-800 rounded-lg p-1 ${selected ? 'outline-4 rounded outline-blue-500' : ''} ${isFocused ? 'outline-2 rounded outline-orange-500' : ''}`}
                style={{opacity: 0.9, minWidth: `${size?.width}px`}}
            >
                <div className="flex w-full border-b-1 border-b-gray-700 mb-2">
                    {hasExecute && <PinExecute id={node.id} onRef={onPinExecuteRef} /> || <div></div>}
                    <div className="w-full text-center text-white font-semibold mb-2">{node.name || 'Unnamed Node'}</div>
                    {hasContinue && <PinContinue id={node.id} onRef={onPinContinueRef} /> || <div></div>}
                </div>

                {node.description && (
                    <div className="text-gray-400 text-sm mb-4">{node.description}</div>
                )}

                {children}

                <div className={`${node.inputs && (node.outputs || node.branches) ? 'grid-cols-2' : 'grid-cols-1'} grid gap-1`}>
                    <NodeInputs
                        nodeId={node.id}
                        nodeType={node.type}
                        inputs={node.inputs}
                        onRef={onPinInputRef}
                        multiple={inputMultiple}
                        minInputParams={minInputParams}
                        multipleType={inputMultipleType}
                    />

                    <NodeOutputs
                        nodeId={node.id}
                        nodeType={node.type}
                        outputs={node.outputs}
                        onOutputRef={onPinOutputRef}
                        onBranchRef={onPinOutputBranchRef}
                        multiple={outputMultiple}
                        branchMultiple={branchMultiple}
                        branches={node.branches}
                        minBranches={minBranches}
                    />
                </div>

                <div className={`${isHovered ? 'flex' : 'invisible'} justify-center mt-2`}>
                    <BaseIcon icon={Delete02Icon} color="red" onClick={handleDeleteNode}/>
                </div>
            </div>
        </div>
    );
}
