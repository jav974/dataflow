import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { InputPin, OutputBranchPin, OutputPin, Pin as PinType, useNodeContext } from "@dataflow-ui/contexts/NodeContext";
import PinExecute from "./pin/PinExecute";
import PinContinue from "./pin/PinContinue";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import BaseIcon from "../icons/BaseIcon";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { Coordinates, NodeConfig, ParameterType } from "@dataflow-ide/dataflow-core";
import NodeInputs from "./NodeInputs";
import NodeOutputs from "./NodeOutputs";
import useHoverable from "@dataflow-ui/hooks/useHoverable";
import { isOverlapping } from "../pixi/functions";
import useFocusable from "@dataflow-ui/hooks/useFocusable";
import { useRefSignalEffect } from "react-refsignal";
import useResizeObserver from "@dataflow-ui/hooks/useResizeObserver";
import { isEditableElement } from "@dataflow-ui/utils/utils";
import { useRefState } from "@dataflow-ui/hooks/useRefState";

export interface NodeProps {
    node: NodeConfig;
    children?: React.ReactNode;
    size?: { width: number; height: number };
    hasExecute?: boolean;
    hasContinue?: boolean;
    inputMultiple?: boolean;
    minInputParams?: number;
    inputMultipleType?: ParameterType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: Map<string, any>;
    outputMultiple?: boolean;
    branchMultiple?: boolean;
    minBranches?: number;
    headClassName?: string;
}

export default function Node({
    node, children, size, hasExecute = true, hasContinue = true,
    inputMultiple = false, minInputParams = 0, inputMultipleType,
    outputMultiple = false, branchMultiple = false, minBranches = 0,
    headClassName
 }: NodeProps) {
    const inputPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const outputPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const outputBranchPinsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const containerRef = useRef<HTMLDivElement | null>(null);
    const executeRef = useRef<HTMLDivElement | null>(null);
    const continueRef = useRef<HTMLDivElement | null>(null);
    const { registerNode, stopConnectionDrag, selectionArea, setSelected, isSelected, stopSelection, selectedNodes } = useNodeContext();
    const { removeNode, scale } = useGraphContext();
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverable();
    const selected = useRefState<boolean>(false);
    const {isFocused, handlers: { onPointerDown, onContextMenu }} = useFocusable(containerRef);

    const getScaledRelativePosition = useCallback((outerRect: DOMRect, innerRect: DOMRect, adjustments?: Coordinates): Coordinates => {
        return {
            x: (innerRect.left - outerRect.left) * scale.current + (adjustments?.x ?? 0),
            y: (innerRect.top - outerRect.top) * scale.current + (adjustments?.y ?? 0) // Adjust for header height,
        }
    }, [scale]);

    const getPin = useCallback((pinId: string, element: HTMLDivElement, containerRect: DOMRect, adjustments?: Coordinates): PinType | undefined => {
        const pinRect = element.getBoundingClientRect();

        if (pinRect.width === 0 || pinRect.height === 0) {
            return undefined;
        }

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
        const outputBranchPins: OutputBranchPin[] = [];
        let executePin: PinType | undefined = undefined;
        let continuePin: PinType | undefined = undefined;

        if (executeRef.current) {
            executePin = getPin("execute", executeRef.current, containerRect, {x: 8, y: 12});
            if (!executePin) return ;
        }

        if (continueRef.current) {
            continuePin = getPin("continue", continueRef.current, containerRect, {x: 16, y: 12});
            if (!continuePin) return ;
        }

        // Get input pin positions
        for (const [key, pin] of inputPinsRef.current.entries()) {
            const pinData = node.inputs?.find(input => input.id === key);
            
            if (pin && pinData) {
                const inputPin = getPin(key, pin, containerRect, {x: 4, y: 6});
                if (!inputPin) return ;

                const data: InputPin = { ...inputPin, ...pinData };
                inputPins.push(data);
            }
        }
        
        // Get output pin positions
        for (const [key, pin] of outputPinsRef.current.entries()) {
            const pinData = node.outputs?.find(output => output.id === key);

            if (pin && pinData) {
                const outputPin = getPin(key, pin, containerRect, {x: 4, y: 6});
                if (!outputPin) return ;

                const data: OutputPin = { ...outputPin, ...pinData };
                outputPins.push(data);
            }
        }

        // Get output branch pin positions
        for (const [key, pin] of outputBranchPinsRef.current.entries()) {
            const pinData = node.branches?.find(branch => branch.id === key);

            if (pin && pinData) {
                const branchPin = getPin(key, pin, containerRect, {x: 14, y: 10});
                if (!branchPin) return ;

                const data: OutputBranchPin = { ...branchPin, ...pinData };
                outputBranchPins.push(data);
            }
        }

        registerNode(node, inputPins, outputPins, outputBranchPins, executePin, continuePin);
    }, [node, registerNode, getPin]);

    useResizeObserver(containerRef, measurePositions);

    useRefSignalEffect(() => {
        if (isSelected(node.id) !== selected.current) {
            selected.update(!selected.current);
        }
    }, [node.id, selectedNodes, selected, isSelected]);

    useRefSignalEffect(() => {
        if (!containerRef.current || !selectionArea.current) return;

        const overlapping = isOverlapping(
            selectionArea.current,
            containerRef.current.getBoundingClientRect()
        );

        if (overlapping !== selected.current) {
            setSelected(node.id, overlapping);
        }
    }, [node.id, selectionArea, selected]);

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

    const finalHeadClassName = useMemo(() => {
        if (headClassName) return headClassName;

        if (hasExecute && hasContinue) {
            return "bg-green-800/80";
        } else if (hasExecute) {
            return "bg-indigo-900";
        } else if (hasContinue) {
            return "bg-indigo-900";
        } else {
            return "bg-red-800/60";
        }
    }, [headClassName, hasExecute, hasContinue]);

    const handleClick = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.ctrlKey || e.metaKey) && !isEditableElement(document.activeElement)) {
            setSelected(node.id, !selected.current);
        }
    }, [node.id, selected, setSelected]);

    return (
        <div
            ref={containerRef}
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onContextMenu={onContextMenu}
            onClick={handleClick}
        >
            <div
                className={`flex flex-col bg-gray-800 rounded-lg ${selected.current ? 'outline-4 rounded outline-blue-500' : ''} ${isFocused ? 'outline-2 rounded outline-orange-500' : ''}`}
                style={{opacity: 0.9, minWidth: `${size?.width}px`}}
            >
                <div className={`flex w-full border-b-1 rounded-t-lg border-b-gray-700 p-1 mb-2 ${finalHeadClassName}`}>
                    {hasExecute && <PinExecute id={node.id} onRef={onPinExecuteRef} /> || <div></div>}
                    <div className="w-full text-center text-white font-semibold">{node.name || 'Unnamed Node'}</div>
                    {hasContinue && <PinContinue id={node.id} onRef={onPinContinueRef} /> || <div></div>}
                </div>

                {node.description && (
                    <div className="text-gray-400 text-sm mb-4">{node.description}</div>
                )}

                <div className="flex flex-col grow pl-1 pr-1">
                    {children}
                </div>

                <div className={`flex grow gap-2 pl-1 pr-1`}>
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
