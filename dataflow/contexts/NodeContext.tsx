import { Coordinates, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig } from '@/dataflow/config/schema';
import { createContext, useContext, useState, useCallback } from 'react';
import { useGraphContext } from './GraphContext';
import { RefState, useRefState } from '@/dataflow/hooks/useRefState';
import { Size } from 'pixi.js';
import { GraphResult } from '@/dataflow/engine/types';
import { emitNodePositionUpdated, emitNodeUpdated } from '../events/events';

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
    nodes: RefState<Map<string, Node>>;
    connectionDrag?: ConnectionDrag;
    rightClickPosition?: Coordinates;
    renderTargets: RefState<Map<string, HTMLElement>>;
    selectionArea: RefState<(Coordinates & Size) | undefined>;
    selectedNodes: RefState<string[]>;
    selectionStart: Coordinates | undefined;
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
    const [connectionDrag, setConnectionDrag] = useState<ConnectionDrag | undefined>(undefined);
    const [rightClickPosition, setRightClickPosition] = useState<Coordinates | undefined>(undefined);
    const [selectionStart, setSelectionStart] = useState<Coordinates | undefined>();
    const [graphResult, setGraphResult] = useState<GraphResult | undefined>(undefined);
    const {addConnection, removeConnections} = useGraphContext();
    const nodes = useRefState<Map<string, Node>>(new Map());
    const renderTargets = useRefState<Map<string, HTMLElement>>(new Map());
    const selectionArea = useRefState<(Coordinates & Size) | undefined>(undefined);
    const selectedNodes = useRefState<string[]>([]);

    const registerNode = useCallback((node: NodeConfig, inputs: InputPin[], outputs: OutputPin[], branches: OutputBranchPin[], executePin?: Pin, continuePin?: Pin) => {
        nodes.ref.current.set(node.id, { mutableNodeConfig: node, inputs, outputs, branches, executePin, continuePin });
        nodes.setLastUpdated(Date.now());
    }, []);

    const isSelected = useCallback((id: string): boolean => {
        return selectedNodes.ref.current.includes(id);
    }, []);

    const updateNodePosition = useCallback((id: string, x: number, y: number) => {
        const node = nodes.ref.current.get(id);

        if (node) {
            // Node is part of a selection, move the selection along
            if (isSelected(id)) {
                const deltaX = x - node.mutableNodeConfig.position.x;
                const deltaY = y - node.mutableNodeConfig.position.y;

                for (const [_, n] of nodes.ref.current) {
                    if (isSelected(n.mutableNodeConfig.id)) {
                        n.mutableNodeConfig.position.x += deltaX;
                        n.mutableNodeConfig.position.y += deltaY;
                        emitNodeUpdated(n.mutableNodeConfig.id);
                        emitNodePositionUpdated(n.mutableNodeConfig.id);
                    }
                }
            } else { // Otherwise simply update its position
                node.mutableNodeConfig.position.x = x;
                node.mutableNodeConfig.position.y = y;
                emitNodeUpdated(node.mutableNodeConfig.id);
            }
        }
    }, []);

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
        const node = nodes.ref.current.get(connector.id);
        if (!node) return undefined;

        return {
            node,
            connector,
            info: getConnectionInfo(node, connector)
        };
    }, []);

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

        setConnectionDrag(drag);
    }, [removeConnections]);

    const stopConnectionDrag = useCallback(() => {
        setConnectionDrag(undefined);
    }, []);

    const openContextMenu = useCallback((position: Coordinates) => {
        setRightClickPosition(position);
    }, []);

    const onPointerUp = useCallback((e: PointerEvent) => {
        if (connectionDrag && e.id && connectionDrag.connector.id !== e.id) {
            const dst = buildConnectionDrag({id: e.id, pin: e.element});

            if (dst && validateConnection(connectionDrag, dst, true)) {
                const from = connectionDrag.info.isSrc ? connectionDrag : dst;
                const to = !connectionDrag.info.isSrc ? connectionDrag : dst;

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
    }, [connectionDrag, addConnection, stopConnectionDrag, removeConnections, openContextMenu]);

    const closeContextMenu = useCallback(() => {
        setRightClickPosition(undefined);
    }, []);

    const setRenderTarget = useCallback((id: string, target: HTMLElement) => {
        renderTargets.ref.current.set(id, target);
        renderTargets.setLastUpdated(Date.now());
    }, []);

    const setSelected = useCallback((id: string, selected: boolean) => {
        if (selected && !selectedNodes.ref.current.includes(id)) {
            selectedNodes.ref.current.push(id);
            selectedNodes.setLastUpdated(Date.now());
        } else if (!selected) {
            const index = selectedNodes.ref.current.findIndex((nodeId: string) => nodeId === id);

            if (index !== -1) {
                selectedNodes.ref.current.splice(index, 1);
                selectedNodes.setLastUpdated(Date.now());
            }
        }
    },  []);

    const startSelection = useCallback((coord: Coordinates) => {
        setSelectionStart(coord);
    }, []);

    const stopSelection = useCallback(() => {
        setSelectionStart(undefined);
        selectionArea.update(undefined);
    }, []);

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

export function useNodes() {
    const context = useContext(NodeContext);
    if (!context) {
        throw new Error('useNodes must be used within a NodeProvider');
    }
    return context;
}
