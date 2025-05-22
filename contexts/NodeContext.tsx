import { Coordinates, InputConfig, NodeConfig, NodeType, OutputConfig } from '@/components/config/Schema';
import { createContext, useContext, useState, useCallback } from 'react';
import { useGraphContext } from './GraphContext';
import ConnectionDrag from '@/components/pixi/ConnectionDrag';
import { RefState, useRefState } from '@/hooks/useRefState';
import { Size } from 'pixi.js';
import { GraphResult } from '@/engine/graph';

export interface Pin {
    id: string;
    position: Coordinates;
}

export interface InputPin extends InputConfig, Pin {
}

export interface OutputPin extends OutputConfig, Pin {
}

export interface Node {
    mutableNodeConfig: NodeConfig;
    inputs: InputPin[];
    outputs: OutputPin[];
    executePin?: Pin;
    continuePin?: Pin;
}

interface Connector {
    id: string;
    pin: string;
}

interface ConnectionDrag {
    node: Node;
    connector: Connector;
    dst?: Connector;
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
    registerNode: (node: NodeConfig, inputs: InputPin[], outputs: OutputPin[], executePin?: Pin, continuePin?: Pin) => void;
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

    const registerNode = useCallback((node: NodeConfig, inputs: InputPin[], outputs: OutputPin[], executePin?: Pin, continuePin?: Pin) => {
        nodes.ref.current.set(node.id, { mutableNodeConfig: node, inputs, outputs, executePin, continuePin });
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
                    }
                }
            } else { // Otherwise simply update its position
                node.mutableNodeConfig.position.x = x;
                node.mutableNodeConfig.position.y = y;
            }
            
            nodes.setLastUpdated(Date.now());
        }
    }, []);

    const startConnectionDrag = useCallback((connector: Connector) => {
        const node = nodes.ref.current.get(connector.id);
        if (!node) return ;

        if (connector.pin === 'continue') {
            removeConnections(connector);
        } else if (connector.pin === "execute") {
            removeConnections(undefined, connector);
        }

        setConnectionDrag({ node, connector });
    }, [removeConnections]);

    const stopConnectionDrag = useCallback(() => {
        setConnectionDrag(undefined);
    }, []);

    const onPointerUp = useCallback((e: PointerEvent) => {
        if (connectionDrag && e.id && connectionDrag.connector.id !== e.id) {
            let fromPin = connectionDrag.connector.pin;
            let toPin = e.element;

            if (toPin === "execute" && fromPin === "continue") {
                removeConnections(undefined, {id: e.id, pin: toPin});
                addConnection({from: connectionDrag.connector, to: { id: e.id, pin: e.element }});
            } else if (toPin === "continue" && fromPin === "execute") {
                removeConnections({id: e.id, pin: toPin});
                addConnection({from: { id: e.id, pin: toPin }, to: connectionDrag.connector});
            } else if (toPin !== "execute" && toPin !== "continue" && fromPin !== "execute" && fromPin !== "continue") {
                const srcIsInput: boolean = nodes.ref.current.get(connectionDrag.connector.id)?.inputs.find((pin) => {
                    return pin.id === fromPin;
                }) !== undefined;
                const dstIsInput: boolean = nodes.ref.current.get(e.id)?.inputs.find((pin) => {
                    return pin.id === toPin;
                }) !== undefined;

                if (!srcIsInput && dstIsInput) {
                    removeConnections(undefined, {id: e.id, pin: toPin});
                    addConnection({from: connectionDrag.connector, to: {id: e.id, pin: e.element}});
                } else if (srcIsInput && !dstIsInput) {
                    removeConnections(undefined, connectionDrag.connector);
                    addConnection({from: {id: e.id, pin: e.element}, to: connectionDrag.connector});
                }
            }
        }

        stopConnectionDrag();
    }, [connectionDrag, addConnection, stopConnectionDrag, removeConnections]);

    const openContextMenu = useCallback((position: Coordinates) => {
        setRightClickPosition(position);
    }, []);

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
