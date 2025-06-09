import React, { createContext, useCallback, useContext, useState } from "react";
import { AppConfig, ConnectionConfig, ConnectorConfig, Coordinates, GraphType, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig, VariableConfig } from "@/dataflow/config/schema";
import { RefState, useRefState } from "@/dataflow/hooks/useRefState";
import { filterObject } from "@/dataflow/engine/utils";
import { useRefSignal, useRefSignalEffect, RefSignal, batch, createRefSignal } from "react-refsignal";

interface GraphContextType {
    name: string;
    nodes: RefSignal<RefSignal<NodeConfig>[]>;
    connections: RefSignal<ConnectionConfig[]>;
    zoom: RefSignal<number>;
    scale: RefSignal<number>;
    canvasPosition: RefSignal<Coordinates>;
    variables: RefSignal<VariableConfig[]>;
    types: RefSignal<GraphType[]>;
    computedResult: RefState<Map<string, any>>;
    addNode: (node: NodeConfig) => void;
    updateNode: (node: NodeConfig) => void;
    removeNode: (id: string) => void;
    addNodeInput: (id: string, input: InputConfig) => void;
    updateNodeInput: (id: string, input: Partial<InputConfig>) => void;
    removeNodeInput: (nodeId: string, inputId: string) => void;
    setNodeInputs: (id: string, inputs: InputConfig[]) => void;
    setInputDefaultValue: (nodeId: string, inputId: string, value: any) => void;
    addNodeOutput: (id: string, output: OutputConfig) => void;
    updateNodeOutput: (id: string, output: Partial<OutputConfig>) => void;
    removeNodeOutput: (nodeId: string, outputId: string) => void;
    setNodeOutputs: (id: string, outputs: OutputConfig[]) => void;
    addNodeBranch: (id: string, branch: OutputBranchConfig) => void;
    removeNodeBranch: (id: string, branchId: string) => void;
    setNodeBranches: (id: string, branches: OutputBranchConfig[]) => void;
    addConnection: (connection: ConnectionConfig) => void;
    removeConnections: (from?: ConnectorConfig, to?: ConnectorConfig) => void;
    loadGraph: (graph: AppConfig) => void;
    toGraph: () => AppConfig;
    zoomIn: () => void;
    zoomOut: () => void;
    setVariable: (id: string, name: string, type: string, isCollection: boolean) => void;
    removeVariable: (id: string) => void;
    setNodeContext: (nodeId: string, context: Map<string, any>) => void;
    setOutputName: (nodeId: string, outputId: string, name: string) => void;
    setInputName: (nodeId: string, inputId: string, name: string) => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

interface GraphProviderProps {
    children: React.ReactNode
}

export function GraphProvider({children}: GraphProviderProps) {
    const [name, setName] = useState<string>("");
    const nodes = useRefSignal<RefSignal<NodeConfig>[]>([]);
    const connections = useRefSignal<ConnectionConfig[]>([]);
    const canvasPosition = useRefSignal<Coordinates>({x: 0, y: 0});
    const zoom = useRefSignal<number>(100);
    const scale = useRefSignal<number>(zoom.ref.current != 0 ? 1 / (zoom.ref.current / 100) : 0);
    const variables = useRefSignal<VariableConfig[]>([]);
    const types = useRefSignal<GraphType[]>([]);
    const computedResult = useRefState<Map<string, any>>(new Map());

    useRefSignalEffect(() => {
        scale.update(zoom.ref.current != 0 ? 1 / (zoom.ref.current / 100) : 0);
    }, [zoom]);

    const addNode = useCallback((node: NodeConfig) => {
        const index = nodes.ref.current.findIndex((n: RefSignal<NodeConfig>) => n.ref.current.id === node.id);

        if (index === -1) {
            nodes.ref.current.push(createRefSignal(node));
            nodes.notifyUpdate();
        }
    }, []);

    const updateNode = useCallback((node: NodeConfig) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === node.id);

        if (nodeSignal) {
            nodeSignal.update({...node});
        }
    }, []);

    const removeConnectionsByPredicate = useCallback((predicate: (conn: ConnectionConfig) => boolean) => {
        let index: number;

        while ((index = connections.ref.current.findIndex(predicate)) !== -1) {
            connections.ref.current.splice(index, 1);
        }

        connections.notifyUpdate();
    }, []);

    const removeNode = useCallback((id: string) => {
        const index = nodes.ref.current.findIndex((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (index !== -1) {
            batch(() => {
                if (nodes.ref.current[index].ref.current.type === NodeType.SET) {
                    removeVariable(id);
                }

                nodes.ref.current.splice(index, 1);
                removeConnectionsByPredicate(conn => (conn.from.id === id || conn.to.id === id));
            }, [nodes, connections, variables]);
        }
    }, []);

    const addNodeInput = useCallback((id: string, input: InputConfig) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;

            if ((node.inputs?.findIndex((i: InputConfig): boolean => i.id === input.id) ?? -1) === -1) {
                updateNode({...node, inputs: [...(node.inputs || []), input]});
            }
        }
    }, [updateNode]);

    const updateNodeInput = useCallback((id: string, input: Partial<InputConfig>) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;
            const index = node.inputs?.findIndex((i: InputConfig): boolean => i.id === input.id);

            if (index !== -1) {
                updateNode({...node, inputs: node.inputs?.map((i) => i.id === input.id ? {...i, ...filterObject(input, undefined)} : i)});
            }
        }
    }, [updateNode]);

    const setNodeInputs = useCallback((id: string, inputs: InputConfig[]) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            updateNode({...nodeSignal.ref.current, inputs});
        }
    }, [updateNode]);

    const removeNodeInput = useCallback((nodeId: string, inputId: string) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === nodeId);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;

            updateNode({...node, inputs: node.inputs?.filter((input: InputConfig) => input.id !== inputId)});
        }
    }, [updateNode]);

    const setInputDefaultValue = useCallback((nodeId: string, inputId: string, value: any) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === nodeId);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;

            updateNode({...node, inputs: node.inputs?.map((i: InputConfig) => i.id === inputId ? {...i, defaultValue: value} : i)})
        }
    }, [updateNode]);

    const addNodeOutput = useCallback((id: string, output: OutputConfig) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;

            if ((node.outputs?.findIndex((i: OutputConfig): boolean => i.id === output.id) ?? -1) === -1) {
                updateNode({...node, outputs: [...(node.outputs || []), output]});
            }
        }
    }, [updateNode]);

    const updateNodeOutput = useCallback((id: string, output: Partial<OutputConfig>) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;
            const _output = node.outputs?.find((o: OutputConfig): boolean => o.id === output.id);

            if (_output) {
                let changed = false;

                for (const [key, value] of Object.entries(output)) {
                    if (_output[key as keyof OutputConfig] !== value) {
                        changed = true;
                        break ;
                    }
                }

                if (changed) {
                    updateNode({...node, outputs: node.outputs?.map((o) => o.id === output.id ? {...o, ...filterObject(output, undefined)} : o)});
                }
            }
        }
    }, [updateNode]);

    const setNodeOutputs = useCallback((id: string, outputs: OutputConfig[]) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            updateNode({...nodeSignal.ref.current, outputs});
        }
    }, [updateNode]);

    const removeNodeOutput = useCallback((nodeId: string, outputId: string) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === nodeId);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;

            updateNode({...node, outputs: node.outputs?.filter((output: OutputConfig) => output.id !== outputId)});
        }
    }, [updateNode]);

    const addNodeBranch = useCallback((id: string, branch: OutputBranchConfig) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;

            if ((node.branches?.findIndex((b: OutputBranchConfig): boolean => b.id === branch.id) ?? -1) === -1) {
                updateNode({...node, branches: [...(node.branches || []), branch]});
            }
        }
    }, []);

    const removeNodeBranch = useCallback((nodeId: string, branchId: string) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === nodeId);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;

            updateNode({...node, branches: node.branches?.filter((b: OutputBranchConfig) => b.id !== branchId)});
        }
    }, []);

    const setNodeBranches = useCallback((id: string, branches: OutputBranchConfig[]) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === id);

        if (nodeSignal) {
            updateNode({...nodeSignal.ref.current, branches: branches});
        }
    }, [updateNode]);

    const setOutputName = useCallback((nodeId: string, outputId: string, name: string) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === nodeId);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;
            const output = node.outputs?.find((o: OutputConfig) => o.id === outputId);

            if (output) {
                output.name = name;
                updateNode({...node, outputs: node.outputs?.map((o: OutputConfig) => o.id === outputId ? output : o)});
            }
        }
    }, [updateNode]);

    const setInputName = useCallback((nodeId: string, inputId: string, name: string) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === nodeId);

        if (nodeSignal) {
            const node = nodeSignal.ref.current;
            const input = node.inputs?.find((i: InputConfig) => i.id === inputId);

            if (input) {
                input.name = name;
                updateNode({...node, inputs: node.inputs?.map((i: InputConfig) => i.id === inputId ? input : i)});
            }
        }
    }, [updateNode]);

    const addConnection = useCallback((connection: ConnectionConfig) => {
        const index = connections.ref.current.findIndex((c: ConnectionConfig) => {
            return c.from.id === connection.from.id && c.from.pin === connection.from.pin && 
                c.to.id === connection.to.id && c.to.pin === connection.to.pin;
        });
        
        if (index === -1) {
            connections.ref.current.push(connection);
            connections.notifyUpdate();
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
        batch(() => {
            canvasPosition.update({x: 0, y: 0});
            zoom.update(graph.zoom ?? 100);
            nodes.update(graph.nodes.map(n => createRefSignal(n)));
            connections.update(graph.connections ?? []);
            types.update(graph.types ?? []);
            variables.update(Array.isArray(graph.variables) ? graph.variables : []);
        }, [canvasPosition, zoom, connections, types, variables, nodes]);

        setName(graph.name);
    }, []);

    const toGraph = useCallback((): AppConfig => {
        return {
            name,
            connections: connections.ref.current,
            nodes: nodes.ref.current.map(nodeSignal => nodeSignal.ref.current),
            zoom: zoom.ref.current,
            types: types.ref.current,
            variables: variables.ref.current,
        };
    }, [name]);

    const zoomIn = useCallback(() => {
        if (zoom.ref.current >= 200) return; // Prevent zooming in too far
        zoom.update(zoom.ref.current + 2);
    }, []);

    const zoomOut = useCallback(() => {
        if (zoom.ref.current <= 2) return; // Prevent zooming out too far
        zoom.update(zoom.ref.current - 2);
    }, []);

    const setVariable = useCallback((id: string, name: string, type: string, isCollection: boolean) => {
        const variable = variables.ref.current.find(v => v.id === id);

        if (variable && (variable.name !== name || variable.type !== type || variable.isCollection !== isCollection)) {
            variable.name = name;
            variable.type = type;
            variable.isCollection = isCollection;
            variables.notifyUpdate();
        } else if (!variable) {
            variables.ref.current.push({id, name, type, isCollection});
            variables.notifyUpdate();
        }
    }, []);

    const removeVariable = useCallback((id: string) => {
        const index = variables.ref.current.findIndex(v => v.id === id);

        if (index !== -1) {
            variables.ref.current.splice(index, 1);
            variables.notifyUpdate();
        }
    }, []);

    const setNodeContext = useCallback((nodeId: string, context: Map<string, any>) => {
        const nodeSignal = nodes.ref.current.find((n: RefSignal<NodeConfig>) => n.ref.current.id === nodeId);

        if (nodeSignal) {
            updateNode({...nodeSignal.ref.current, context: JSON.stringify(Object.fromEntries(context))});
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
        types,
        computedResult,
        addNode,
        updateNode,
        removeNode,
        addNodeInput,
        updateNodeInput,
        setNodeInputs,
        removeNodeInput,
        setInputDefaultValue,
        addNodeOutput,
        updateNodeOutput,
        removeNodeOutput,
        setNodeOutputs,
        addNodeBranch,
        removeNodeBranch,
        setNodeBranches,
        addConnection,
        removeConnections,
        loadGraph,
        toGraph,
        zoomIn,
        zoomOut,
        setVariable,
        removeVariable,
        setNodeContext,
        setOutputName,
        setInputName,
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
