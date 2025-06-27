import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { AppConfig, Coordinates, NodeType } from "../config/schema";
import { useRefSignal, RefSignal, batch } from "react-refsignal";
import { useGraphContext } from "./GraphContext";
import useResizeObserver from "../hooks/useResizeObserver";
import { Log } from "../engine/types";
import { useEvent } from "../hooks/useEvent";
import useWebSocketEvent from "../hooks/useWebSocketEvent";
import { useNodeContext } from "./NodeContext";
import { isEditableElement } from "../utils/utils";
import { getPartialGraph, pastePartialGraph } from "../utils/graph_knife";
import { useClipboard } from "../hooks/useClipboard";

interface PointerPosition {
    global: Coordinates;
    globalScaled: Coordinates;
    viewport: Coordinates;
    canvasScaled: Coordinates;
}

interface DashboardContextType {
    pointerPosition: RefSignal<PointerPosition>;
    canvasRef: React.RefObject<HTMLDivElement | null>;
    canvasRect: RefSignal<DOMRect | undefined>;
    logs: RefSignal<Log[]>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
    children: React.ReactNode;
}

export function DashboardProvider({children}: DashboardProviderProps) {
    const { scale, canvasPosition, toGraph, loadGraph, nodes, connections, types, variables, actionHistory, addNode, addConnection, addType, addVariable, removeNodes } = useGraphContext();
    const { selectedNodes } = useNodeContext();
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const canvasRect = useRefSignal<DOMRect | undefined>(undefined);
    const pointerPosition = useRefSignal<PointerPosition>({
        global: {x: 0, y: 0},
        globalScaled: {x: 0, y: 0},
        viewport: {x: 0, y: 0},
        canvasScaled: {x: 0, y: 0},
    });
    const logs = useRefSignal<Log[]>([]);

    const { copyPartial, cutPartial, paste } = useClipboard<AppConfig>((payload) => {
        if (payload.type === 'full-graph') {
            loadGraph(payload.data);
        } else {
            const previousGraph = structuredClone(toGraph());

            actionHistory.push({
                redo: () => {
                    actionHistory.lock();

                    const graph = pastePartialGraph(payload.data, pointerPosition.current.canvasScaled, payload.kind);
                    let hasStartNode = false;
                    let hasReturnNode = false;
                    let hasTriggerNode = false;

                    nodes.current.forEach(node => {
                        if (node.current.type === NodeType.START) {
                            hasStartNode = true;
                        } else if (node.current.type === NodeType.RETURN) {
                            hasReturnNode = true;
                        } else if (node.current.type === NodeType.TRIGGER) {
                            hasTriggerNode = true;
                        }
                    });

                    batch(() => {
                        graph.nodes.forEach(node => addNode(node));
                        graph.connections?.forEach(conn => {
                            // Strip connections from/to start/return/trigger nodes if they already exist in current graph
                            if (
                                hasStartNode && conn.from.id === "start"
                                || hasTriggerNode && conn.from.id === "trigger"
                                || hasReturnNode && conn.to.id === "return"
                            ) {
                                return ;
                            }
                            addConnection(conn);
                        });
                        graph.types?.forEach(type => addType(type));
                        graph.variables.forEach(variable => addVariable(variable));
                        // Select pasted nodes by default
                        selectedNodes.current = graph.nodes.map(node => node.id);
                    }, [nodes, connections, variables, types, selectedNodes]);

                    actionHistory.unlock();
                },
                undo: () => {
                    loadGraph(previousGraph);
                }
            });
        }
    });

    useResizeObserver(canvasRef, (entry) => {
        canvasRect.update(canvasRef.current?.getBoundingClientRect() ?? entry.contentRect);
    });

    const handlePointerMove = useCallback((event: PointerEvent) => {
        pointerPosition.current.global.x = event.clientX;
        pointerPosition.current.global.y = event.clientY;
        pointerPosition.current.globalScaled.x = event.clientX * scale.current;
        pointerPosition.current.globalScaled.y = event.clientY * scale.current;
        pointerPosition.current.viewport.x = event.clientX - (canvasRect.current?.left ?? 0);
        pointerPosition.current.viewport.y = event.clientY - (canvasRect.current?.top ?? 0);
        pointerPosition.current.canvasScaled.x = (pointerPosition.current.viewport.x - canvasPosition.current.x) * scale.current;
        pointerPosition.current.canvasScaled.y = (pointerPosition.current.viewport.y - canvasPosition.current.y) * scale.current;
        pointerPosition.notifyUpdate();
    }, [pointerPosition, canvasPosition, canvasRect, scale]);

    // Update pointer position on pointer move
    useEffect(() => {
        window.addEventListener("pointermove", handlePointerMove);
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, [handlePointerMove]);

    useEvent<Log>('io_write', (log) => {
        logs.current.push(log);
        logs.notifyUpdate();
    });

    useWebSocketEvent('writeTo', (log) => {
        logs.current.push(log);
        logs.notifyUpdate();
    });

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (isEditableElement(document.activeElement)) return;

        const isMac = navigator.platform.includes('Mac');
        const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            removeNodes(selectedNodes.current);
            return ;
        }

        if (!ctrlKey) return;
        let partialGraph: AppConfig | undefined;

        switch (e.key.toLowerCase()) {
            case 'a':
                e.preventDefault();
                selectedNodes.update(nodes.current.map(node => node.current.id));
                break ;
            case 'c':
                e.preventDefault();
                partialGraph = getPartialGraph(toGraph(), selectedNodes.current);

                if (partialGraph) {
                    copyPartial(partialGraph);
                }
                break;
            case 'x':
                e.preventDefault();
                partialGraph = getPartialGraph(toGraph(), selectedNodes.current);

                if (partialGraph) {
                    cutPartial(partialGraph);
                    removeNodes(selectedNodes.current);
                }
                break;
            case 'v':
                e.preventDefault();
                paste();
                break;
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    actionHistory.redo();
                } else {
                    actionHistory.undo();
                }
                break ;
        }
    }, [selectedNodes, actionHistory, nodes, toGraph, removeNodes, copyPartial, cutPartial, paste]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return <DashboardContext.Provider value={{
        pointerPosition,
        canvasRef,
        canvasRect,
        logs
    }}>
        {children}
    </DashboardContext.Provider>;
}

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }
    return context;
}
