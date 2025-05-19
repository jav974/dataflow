import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppConfig, ConnectionConfig, ConnectorConfig, Coordinates, InputConfig, NodeConfig, NodeType, OutputConfig } from "@/components/config/Schema";
import { RefState, useRefState } from "@/hooks/useRefState";

interface GraphContextType {
    name: string;
    nodes: RefState<NodeConfig[]>;
    connections: RefState<ConnectionConfig[]>;
    zoom: RefState<number>;
    scale: RefState<number>;
    canvasPosition: RefState<Coordinates>;
    variables: RefState<Map<string, string>>;
    addNode: (node: NodeConfig) => void;
    updateNode: (node: NodeConfig) => void;
    removeNode: (id: string) => void;
    addNodeInput: (id: string, input: InputConfig) => void;
    removeNodeInput: (nodeId: string, inputId: string) => void;
    setNodeInputs: (id: string, inputs: InputConfig[]) => void;
    setInputDefaultValue: (nodeId: string, inputId: string, value: any) => void;
    addNodeOutput: (id: string, output: OutputConfig) => void;
    removeNodeOutput: (nodeId: string, outputId: string) => void;
    setNodeOutputs: (id: string, outputs: OutputConfig[]) => void;
    addConnection: (connection: ConnectionConfig) => void;
    removeConnections: (from?: ConnectorConfig, to?: ConnectorConfig) => void;
    loadGraph: (graph: AppConfig) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setVariable: (nodeId: string, name: string) => void;
    removeVariable: (nodeId: string) => void;
    setNodeContext: (nodeId: string, context: Map<string, any>) => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

interface GraphProviderProps {
    children: React.ReactNode
}

export function GraphProvider({children}: GraphProviderProps) {
    const [name, setName] = useState<string>("");
    const nodes = useRefState<NodeConfig[]>([]);
    const connections = useRefState<ConnectionConfig[]>([]);
    const canvasPosition = useRefState<Coordinates>({x: 0, y: 0});
    const zoom = useRefState<number>(100);
    const scale = useRefState<number>(zoom.ref.current != 0 ? 1 / (zoom.ref.current / 100) : 0);
    const variables = useRefState<Map<string, string>>(new Map());

    useEffect(() => {
        scale.update(zoom.ref.current != 0 ? 1 / (zoom.ref.current / 100) : 0);
    }, [zoom.lastUpdated]);

    const addNode = useCallback((node: NodeConfig) => {
        const index = nodes.ref.current.findIndex((n: NodeConfig) => n.id === node.id);

        if (index === -1) {
            nodes.ref.current.push(node);
            nodes.setLastUpdated(Date.now());
        }
    }, []);

    const updateNode = useCallback((node: NodeConfig) => {
        const index = nodes.ref.current.findIndex((n: NodeConfig) => n.id === node.id);

        if (index !== -1) {
            nodes.ref.current[index] = node;
            nodes.setLastUpdated(Date.now());
        }
    }, []);

    const removeConnectionsByPredicate = useCallback((predicate: (conn: ConnectionConfig) => boolean) => {
        let index: number;

        while ((index = connections.ref.current.findIndex(predicate)) !== -1) {
            connections.ref.current.splice(index, 1);
        }

        connections.setLastUpdated(Date.now());
    }, []);

    const removeNode = useCallback((id: string) => {
        const index = nodes.ref.current.findIndex((n: NodeConfig) => n.id === id);

        if (index !== -1) {
            if (nodes.ref.current.at(index)?.type === NodeType.SET) {
                removeVariable(id);
            }

            nodes.ref.current.splice(index, 1);
            removeConnectionsByPredicate(conn => (conn.from.id === id || conn.to.id === id));
            nodes.setLastUpdated(Date.now());
        }
    }, []);

    const addNodeInput = useCallback((id: string, input: InputConfig) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === id);

        if (node) {
            if ((node.inputs?.findIndex((i: InputConfig): boolean => i.id === input.id) ?? -1) === -1) {
                updateNode({...node, inputs: [...(node.inputs || []), input]});
            }
        }
    }, [updateNode]);

    const setNodeInputs = useCallback((id: string, inputs: InputConfig[]) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === id);

        if (node) {
            updateNode({...node, inputs});
        }
    }, [updateNode]);

    const removeNodeInput = useCallback((nodeId: string, inputId: string) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === nodeId);

        if (node) {
            updateNode({...node, inputs: node.inputs?.filter((input: InputConfig) => input.id !== inputId)});
        }
    }, [updateNode]);

    const setInputDefaultValue = useCallback((nodeId: string, inputId: string, value: any) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === nodeId);

        if (node) {
            updateNode({...node, inputs: node.inputs?.map((i: InputConfig) => i.id === inputId ? {...i, defaultValue: value} : i)})
        }
    }, [updateNode]);

    const addNodeOutput = useCallback((id: string, output: OutputConfig) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === id);

        if (node) {
            if ((node.outputs?.findIndex((i: OutputConfig): boolean => i.id === output.id) ?? -1) === -1) {
                updateNode({...node, outputs: [...(node.outputs || []), output]});
            }
        }
    }, [updateNode]);

    const setNodeOutputs = useCallback((id: string, outputs: OutputConfig[]) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === id);

        if (node) {
            updateNode({...node, outputs});
        }
    }, [updateNode]);

    const removeNodeOutput = useCallback((nodeId: string, outputId: string) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === nodeId);

        if (node) {
            updateNode({...node, outputs: node.outputs?.filter((output: OutputConfig) => output.id !== outputId)});
        }
    }, [updateNode]);

    const addConnection = useCallback((connection: ConnectionConfig) => {
        const index = connections.ref.current.findIndex((c: ConnectionConfig) => {
            return c.from.id === connection.from.id && c.from.pin === connection.from.pin && 
                c.to.id === connection.to.id && c.to.pin === connection.to.pin;
        });
        
        if (index === -1) {
            connections.ref.current.push(connection);
            connections.setLastUpdated(Date.now());
        }
    }, []);

    const removeConnections = useCallback((from?: ConnectorConfig, to?: ConnectorConfig) => {
        let predicate: (conn: ConnectionConfig) => boolean;

        if (from && to) {
            predicate = (conn: ConnectionConfig): boolean => (conn.from.id === from.id && conn.from.pin === from.pin && conn.to.id === to.id && conn.to.pin === to.pin);
        } else if (from) {
            predicate = (conn: ConnectionConfig): boolean => (conn.from.id === from.id && conn.from.pin === from.pin);
        } else if (to) {
            predicate = (conn: ConnectionConfig) => (conn.to.id === to.id && conn.to.pin === to.pin);
        } else {
            return ;
        }

        removeConnectionsByPredicate(predicate);
    }, [removeConnectionsByPredicate]);

    const loadGraph = useCallback((graph: AppConfig) => {
        setName(graph.name);
        nodes.update(graph.nodes);
        connections.update(graph.connections ?? []);
        zoom.update(graph.zoom ?? 100);

        const _variables = JSON.parse(graph.variables ?? "{}");
        const _map: Map<string, string> = new Map();
        for (const [key, value] of Object.entries<string>(_variables)) {
            _map.set(key, value);
        }

        variables.update(_map);
    }, []);

    const zoomIn = useCallback(() => {
        zoom.update(zoom.ref.current + 2);
    }, []);

    const zoomOut = useCallback(() => {
        zoom.update(zoom.ref.current - 2);
    }, []);

    const setVariable = useCallback((nodeId: string, name: string) => {
        variables.ref.current.set(nodeId, name);
        variables.setLastUpdated(Date.now());
    }, []);

    const removeVariable = useCallback((nodeId: string) => {
        variables.ref.current.delete(nodeId);
        variables.setLastUpdated(Date.now());
    }, []);

    const setNodeContext = useCallback((nodeId: string, context: Map<string, any>) => {
        const node = nodes.ref.current.find((n: NodeConfig) => n.id === nodeId);

        if (node) {
            updateNode({...node, context: JSON.stringify(Object.fromEntries(context))});
        }
    }, [updateNode]);

    return <GraphContext.Provider value={{
        name,
        nodes,
        connections,
        zoom,
        scale,
        canvasPosition,
        variables,
        addNode,
        updateNode,
        removeNode,
        addNodeInput,
        setNodeInputs,
        removeNodeInput,
        setInputDefaultValue,
        addNodeOutput,
        removeNodeOutput,
        setNodeOutputs,
        addConnection,
        removeConnections,
        loadGraph,
        zoomIn,
        zoomOut,
        setVariable,
        removeVariable,
        setNodeContext
    }}>
        {children}
    </GraphContext.Provider>
}

export function useGraphContext() {
    const context = useContext(GraphContext);
    if (!context) {
        throw new Error('useGraphContext must be used within a GraphProvider');
    }
    return context;
}
