import { Coordinates, InputConfig, NodeConfig, OutputBranchConfig, OutputConfig } from '@/dataflow/config/schema';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useGraphContext } from './GraphContext';
import { Size } from 'pixi.js';
import { GraphResult } from '@/dataflow/engine/types';
import { emitNodePositionUpdated, emitNodeUpdated } from '../events/events';
import { batch, createRefSignal, RefSignal, useRefSignal } from 'react-refsignal';

export interface Pin {
    id: string;
    position: Coordinates;
}

export interface InputPin extends InputConfig, Pin {
}

export interface OutputPin extends OutputConfig, Pin {
}

export interface OutputBranchPin extends OutputBranchConfig, Pin {
}

export interface Node {
    mutableNodeConfig: NodeConfig;
    inputs: InputPin[];
    outputs: OutputPin[];
    branches: OutputBranchPin[];
    executePin?: Pin;
    continuePin?: Pin;
}

interface Connector {
    id: string;
    pin: string;
}

interface ConnectionInfo {
    isSrc: boolean;
    isInput: boolean;
    isOutput: boolean;
    isBranch: boolean;
    isExecute: boolean;
    isContinue: boolean;
}

interface ConnectionDrag {
    node: Node;
    connector: Connector;
    info: ConnectionInfo;
}

interface NodeContextType {
    nodes: RefSignal<Map<string, RefSignal<Node>>>;
    connectionDrag: RefSignal<ConnectionDrag | undefined>;
    rightClickPosition: RefSignal<Coordinates | undefined>;
    renderTargets: RefSignal<Map<string, HTMLElement>>;
    selectionArea: RefSignal<(Coordinates & Size) | undefined>;
    selectedNodes: RefSignal<string[]>;
    selectionStart: RefSignal<Coordinates | undefined>;
    graphResult: GraphResult | undefined;
    registerNode: (node: NodeConfig, inputs: InputPin[], outputs: OutputPin[], branches: OutputBranchPin[], executePin?: Pin, continuePin?: Pin) => void;
    updateNodePosition: (id: string, x: number, y: number) => void;
    startConnectionDrag: (connector: Connector) => void;
    stopConnectionDrag: () => void;
    onPointerUp: (e: PointerEvent) => void;
    openContextMenu: (position: Coordinates) => void;
    closeContextMenu: () => void;
    setRenderTarget: (id: string, target: HTMLElement) => void;
    setSelected: (id: string, selected: boolean) => void;
    isSelected: (id: string) => boolean;
    startSelection: (coord: Coordinates) => void;
    stopSelection: () => void;
    setGraphResult: (result: GraphResult | undefined) => void;
}

export enum PointerEventType {
    POINTER_UP = "pointerup",
    POINTER_DOWN = "pointerdown",
    POINTER_MOVE = "pointermove",
}

export interface PointerEvent {
    type: PointerEventType;
    x: number;
    y: number;
    element: string;
    id?: string
}

const NodeContext = createContext<NodeContextType | null>(null);

export function NodeProvider({ children }: { children: React.ReactNode }) {
    const connectionDrag = useRefSignal<ConnectionDrag | undefined>(undefined);
    const rightClickPosition = useRefSignal<Coordinates | undefined>(undefined);
    const selectionStart = useRefSignal<Coordinates | undefined>(undefined);
    const [graphResult, setGraphResult] = useState<GraphResult | undefined>(undefined);
    const {addConnection, removeConnections, name} = useGraphContext();
    const nodes = useRefSignal<Map<string, RefSignal<Node>>>(new Map());
    const renderTargets = useRefSignal<Map<string, HTMLElement>>(new Map());
    const selectionArea = useRefSignal<(Coordinates & Size) | undefined>(undefined);
    const selectedNodes = useRefSignal<string[]>([]);

    // Clear nodes and render targets when user switches graph
    useEffect(() => {
        batch(() => {
            nodes.current.clear();
            renderTargets.current.clear();
        }, [nodes, renderTargets]);
    }, [name, nodes, renderTargets]);

    const registerNode = useCallback((node: NodeConfig, inputs: InputPin[], outputs: OutputPin[], branches: OutputBranchPin[], executePin?: Pin, continuePin?: Pin) => {
        const nodeSignal = nodes.current.get(node.id);
        const nodeData = { mutableNodeConfig: node, inputs, outputs, branches, executePin, continuePin };

        if (nodeSignal) {
            nodeSignal.update(nodeData);
        } else {
            nodes.current.set(node.id, createRefSignal<Node>(nodeData));
            nodes.notifyUpdate();
        }
    }, [nodes]);

    const isSelected = useCallback((id: string): boolean => {
        return selectedNodes.current.includes(id);
    }, [selectedNodes]);

    const updateNodePosition = useCallback((id: string, x: number, y: number) => {
        const nodeSignal = nodes.current.get(id);
        const node = nodeSignal?.current;

        if (node) {
            // Node is part of a selection, move the selection along
            if (isSelected(id)) {
                const deltaX = x - node.mutableNodeConfig.position.x;
                const deltaY = y - node.mutableNodeConfig.position.y;

                for (const [, n] of nodes.current) {
                    if (isSelected(n.current.mutableNodeConfig.id)) {
                        n.current.mutableNodeConfig.position.x += deltaX;
                        n.current.mutableNodeConfig.position.y += deltaY;
                        emitNodeUpdated(n.current.mutableNodeConfig.id);
                        emitNodePositionUpdated(n.current.mutableNodeConfig.id);
                    }
                }
            } else { // Otherwise simply update its position
                node.mutableNodeConfig.position.x = x;
                node.mutableNodeConfig.position.y = y;
                emitNodeUpdated(node.mutableNodeConfig.id);
            }
        }
    }, [nodes, isSelected]);

    const getConnectionInfo = useCallback((node: Node, connector: Connector): ConnectionInfo => {
        const predicate = (pin: Pin) => pin.id === connector.pin;
        const isExecute = connector.pin === "execute";
        const isContinue = connector.pin === "continue";
        const isInput = node.inputs.find(predicate) !== undefined;
        const isOutput = !isInput && node.outputs.find(predicate) !== undefined;
        const isBranch = !isInput && !isOutput && node.branches.find(predicate) !== undefined;

        return {
            isSrc: isContinue || isOutput || isBranch,
            isExecute,
            isContinue,
            isInput,
            isOutput,
            isBranch
        };
    }, []);

    const validateConnection = useCallback((a: ConnectionDrag, b: ConnectionDrag, verbose: boolean = false): boolean => {
        if (a.info.isSrc === b.info.isSrc) {
            if (verbose) {
                console.log("Source connectors can not be connected together");
            }
            return false;
        }

        const from: ConnectionDrag = a.info.isSrc ? a : b;
        const to: ConnectionDrag = !a.info.isSrc ? a : b;

        if (from.info.isContinue && !to.info.isExecute) {
            if (verbose) {
                console.log("Continue connectors can only be connected to Execute connectors");
            }
            return false;
        }

        if (from.info.isBranch && !to.info.isExecute) {
            if (verbose) {
                console.log("Branch connectors can only be connected to Execute connectors");
            }
            return false;
        }

        if (from.info.isOutput && !to.info.isInput) {
            if (verbose) {
                console.log("Output connectors can only be connected to Input connectors");
            }
            return false;
        }

        return true;
    }, []);

    const buildConnectionDrag = useCallback((connector: Connector): ConnectionDrag | undefined => {
        const node = nodes.current.get(connector.id)?.current;
        if (!node) return undefined;

        return {
            node,
            connector,
            info: getConnectionInfo(node, connector)
        };
    }, [nodes, getConnectionInfo]);

    const startConnectionDrag = useCallback((connector: Connector) => {
        const drag = buildConnectionDrag(connector);
        if (!drag) return ;

        // // Only Output connectors can be connected to multiple other connectors
        // if (!drag.info.isOutput) {
        //     removeConnections(
        //         drag.info.isSrc ? connector : undefined,
        //         !drag.info.isSrc ? connector : undefined
        //     );
        // }

        connectionDrag.update(drag);
    }, [connectionDrag, buildConnectionDrag]);

    const stopConnectionDrag = useCallback(() => {
        connectionDrag.update(undefined);
    }, [connectionDrag]);

    const openContextMenu = useCallback((position: Coordinates) => {
        rightClickPosition.update(position);
    }, [rightClickPosition]);

    const onPointerUp = useCallback((e: PointerEvent) => {
        if (connectionDrag && e.id && connectionDrag.current && connectionDrag.current.connector.id !== e.id) {
            const dst = buildConnectionDrag({id: e.id, pin: e.element});

            if (dst && validateConnection(connectionDrag.current, dst, true)) {
                const from = connectionDrag.current.info.isSrc ? connectionDrag.current : dst;
                const to = !connectionDrag.current.info.isSrc ? connectionDrag.current : dst;

                // Only Output connectors can be connected to multiple other connectors
                if (!from.info.isOutput) {
                    removeConnections(from.connector);
                }

                // Dst connectors can only be Input or Execute, so remove any existing connection they have
                removeConnections(undefined, to.connector);
                addConnection({from: from.connector, to: to.connector});
            }
        }

        stopConnectionDrag();
    }, [connectionDrag, addConnection, stopConnectionDrag, removeConnections, buildConnectionDrag, validateConnection]);

    const closeContextMenu = useCallback(() => {
        rightClickPosition.update(undefined);
    }, [rightClickPosition]);

    const setRenderTarget = useCallback((id: string, target: HTMLElement) => {
        renderTargets.current.set(id, target);
        renderTargets.notifyUpdate();
    }, [renderTargets]);

    const setSelected = useCallback((id: string, selected: boolean) => {
        if (selected && !selectedNodes.current.includes(id)) {
            selectedNodes.update([...selectedNodes.current, id]);
        } else if (!selected) {
            selectedNodes.update(selectedNodes.current.filter((v) => v !== id));
        }
    }, [selectedNodes]);

    const startSelection = useCallback((coord: Coordinates) => {
        selectionStart.update(coord);
    }, [selectionStart]);

    const stopSelection = useCallback(() => {
        batch(() => {
            selectionStart.update(undefined);
            selectionArea.update(undefined);
        }, [selectionArea, selectionStart]);
    }, [selectionStart, selectionArea]);

    return (
        <NodeContext.Provider value={{
            nodes,
            connectionDrag,
            rightClickPosition,
            renderTargets,
            selectionArea,
            selectedNodes,
            selectionStart,
            graphResult,
            registerNode,
            updateNodePosition,
            startConnectionDrag,
            stopConnectionDrag,
            onPointerUp,
            openContextMenu,
            closeContextMenu,
            setRenderTarget,
            setSelected,
            isSelected,
            startSelection,
            stopSelection,
            setGraphResult
        }}>
            {children}
        </NodeContext.Provider>
    );
}

export function useNodeContext() {
    const context = useContext(NodeContext);
    if (!context) {
        throw new Error('useNodes must be used within a NodeProvider');
    }
    return context;
}
