/* eslint-disable react-hooks/exhaustive-deps */

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { AppConfig, ConnectionConfig, ConnectorConfig, Coordinates, GraphType, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig, ParameterTypes, PrimitiveTypes, VariableConfig } from "@dataflow-ide/dataflow-core";
import { useRefSignal, useRefSignalEffect, RefSignal, batch, createRefSignal } from "react-refsignal";
import { GraphCommand, useHistory } from "../hooks/useHistory";
import { GraphContextType } from "./types";
import useGraphContextHistory from "../hooks/useGraphContextHistory";
import { getRemoveConnectionsPredicate } from "../utils/utils";
import { filterObject, KeyValue, mapToJson } from "@dataflow-ide/dataflow-core";
import { useRefState } from "../hooks/useRefState";

const GraphContext = createContext<GraphContextType | null>(null);

interface GraphProviderProps {
    children: React.ReactNode
}

export function GraphProvider({children}: GraphProviderProps) {
    const id = useRefState<string>("");
    const name = useRefSignal<string>("");
    const nodes = useRefSignal<RefSignal<NodeConfig>[]>([]);
    const connections = useRefSignal<ConnectionConfig[]>([]);
    const canvasPosition = useRefSignal<Coordinates>({x: 0, y: 0});
    const zoom = useRefSignal<number>(100);
    const scale = useRefSignal<number>(zoom.current != 0 ? 1 / (zoom.current / 100) : 0);
    const variables = useRefSignal<VariableConfig[]>([]);
    const types = useRefSignal<GraphType[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const computedResult = useRefState<Map<string, any>>(new Map());
    const startParams = useRefSignal<KeyValue>(new Map());
    const isLoading = useRefSignal<boolean>(false);
    const actionHistory = useHistory<GraphCommand>();

    useRefSignalEffect(() => {
        scale.update(zoom.current != 0 ? 1 / (zoom.current / 100) : 0);
    }, [zoom]);

    const getNodeSignal = useCallback((node: string | NodeConfig) => {
        const nodeId = typeof node === "object" ? node.id : node;
        return nodes.current.find((n: RefSignal<NodeConfig>) => n.current.id === nodeId);
    }, [nodes]);

    const getNodeSignalIndex = useCallback((node: string | NodeConfig) => {
        const nodeId = typeof node === "object" ? node.id : node;
        return nodes.current.findIndex((n: RefSignal<NodeConfig>) => n.current.id === nodeId);
    }, [nodes]);

    const addNode = useCallback((node: NodeConfig) => {
        const index = getNodeSignalIndex(node);

        if (index === -1) {
            nodes.current.push(createRefSignal(node));
            nodes.notifyUpdate();
        }
    }, [nodes, getNodeSignalIndex]);

    const updateNode = useCallback((node: NodeConfig) => {
        const nodeSignal = getNodeSignal(node);

        if (nodeSignal) {
            nodeSignal.update({...node});
        }
    }, [getNodeSignal]);

    const removeConnectionsByPredicate = useCallback((predicate: (conn: ConnectionConfig) => boolean) => {
        let index: number;

        while ((index = connections.current.findIndex(predicate)) !== -1) {
            connections.current.splice(index, 1);
        }

        connections.notifyUpdate();
    }, [connections]);

    const removeVariable = useCallback((id: string) => {
        const index = variables.current.findIndex(v => v.id === id);

        if (index !== -1) {
            variables.current.splice(index, 1);
            variables.notifyUpdate();
        }
    }, [variables]);

    const removeType = useCallback((typeId: string) => {
        types.update(types.current.filter(type => type.id !== typeId ));
    }, [types]);

    const removeNode = useCallback((id: string) => {
        const index = getNodeSignalIndex(id);

        if (index !== -1) {
            const node = nodes.current[index];

            batch(() => {
                if (node.current.type === NodeType.NEW) {
                    removeVariable(id);
                }

                if (node.current.type === NodeType.TYPEDEF) {
                    removeType(id);
                }

                nodes.current.splice(index, 1);
                removeConnectionsByPredicate(conn => (conn.from.id === id || conn.to.id === id));
            }, [nodes, connections, variables, types]);
        }
    }, [nodes, connections, removeVariable, removeConnectionsByPredicate, variables, removeType, types, getNodeSignalIndex]);

    const removeNodes = useCallback((ids: string[]) => {
        if (ids.length === 0) return ;

        batch(() => {
            ids.forEach(id => removeNode(id));
        }, [nodes, connections, variables, types]);
    }, [removeNode, nodes, connections, variables, types]);

    const addNodeInput = useCallback((id: string, input: InputConfig) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            const node = nodeSignal.current;

            if ((node.inputs?.findIndex((i: InputConfig): boolean => i.id === input.id) ?? -1) === -1) {
                updateNode({...node, inputs: [...(node.inputs || []), input]});
            }
        }
    }, [updateNode, nodes]);

    const updateNodeInput = useCallback((id: string, input: Partial<InputConfig>) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            const node = nodeSignal.current;
            const index = node.inputs?.findIndex((i: InputConfig): boolean => i.id === input.id);

            if (index !== -1) {
                updateNode({...node, inputs: node.inputs?.map((i) => i.id === input.id ? {...i, ...filterObject(input, undefined)} : i)});
            }
        }
    }, [updateNode, nodes]);

    const setNodeInputs = useCallback((id: string, inputs: InputConfig[]) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            updateNode({...nodeSignal.current, inputs});
        }
    }, [updateNode, nodes]);

    const removeNodeInput = useCallback((nodeId: string, inputId: string) => {
        const nodeSignal = getNodeSignal(nodeId);

        if (nodeSignal) {
            const node = nodeSignal.current;

            updateNode({...node, inputs: node.inputs?.filter((input: InputConfig) => input.id !== inputId)});
        }
    }, [updateNode, nodes]);

    const setInputDefaultValue = useCallback((nodeId: string, inputId: string, value: unknown) => {
        const nodeSignal = getNodeSignal(nodeId);

        if (nodeSignal) {
            const node = nodeSignal.current;

            updateNode({...node, inputs: node.inputs?.map((i: InputConfig) => i.id === inputId ? {...i, defaultValue: value} : i)})
        }
    }, [updateNode, nodes]);

    const addNodeOutput = useCallback((id: string, output: OutputConfig) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            const node = nodeSignal.current;

            if ((node.outputs?.findIndex((i: OutputConfig): boolean => i.id === output.id) ?? -1) === -1) {
                updateNode({...node, outputs: [...(node.outputs || []), output]});
            }
        }
    }, [updateNode, nodes]);

    const updateNodeOutput = useCallback((id: string, output: Partial<OutputConfig>) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            const node = nodeSignal.current;
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
    }, [updateNode, nodes]);

    const setNodeOutputs = useCallback((id: string, outputs: OutputConfig[]) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            updateNode({...nodeSignal.current, outputs});
        }
    }, [updateNode, nodes]);

    const removeNodeOutput = useCallback((nodeId: string, outputId: string) => {
        const nodeSignal = getNodeSignal(nodeId);

        if (nodeSignal) {
            const node = nodeSignal.current;

            updateNode({...node, outputs: node.outputs?.filter((output: OutputConfig) => output.id !== outputId)});
        }
    }, [updateNode, nodes]);

    const addNodeBranch = useCallback((id: string, branch: OutputBranchConfig) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            const node = nodeSignal.current;

            if ((node.branches?.findIndex((b: OutputBranchConfig): boolean => b.id === branch.id) ?? -1) === -1) {
                updateNode({...node, branches: [...(node.branches || []), branch]});
            }
        }
    }, [updateNode, nodes]);

    const removeNodeBranch = useCallback((nodeId: string, branchId: string) => {
        const nodeSignal = getNodeSignal(nodeId);

        if (nodeSignal) {
            const node = nodeSignal.current;

            updateNode({...node, branches: node.branches?.filter((b: OutputBranchConfig) => b.id !== branchId)});
        }
    }, [updateNode, nodes]);

    const setNodeBranches = useCallback((id: string, branches: OutputBranchConfig[]) => {
        const nodeSignal = getNodeSignal(id);

        if (nodeSignal) {
            updateNode({...nodeSignal.current, branches: branches});
        }
    }, [updateNode, nodes]);

    const setOutputName = useCallback((nodeId: string, outputId: string, name: string) => {
        const nodeSignal = getNodeSignal(nodeId);

        if (nodeSignal) {
            const node = nodeSignal.current;
            const output = node.outputs?.find((o: OutputConfig) => o.id === outputId);

            if (output) {
                output.name = name;
                updateNode({...node, outputs: node.outputs?.map((o: OutputConfig) => o.id === outputId ? output : o)});
            }
        }
    }, [updateNode, nodes]);

    const setInputName = useCallback((nodeId: string, inputId: string, name: string) => {
        const nodeSignal = getNodeSignal(nodeId);

        if (nodeSignal) {
            const node = nodeSignal.current;
            const input = node.inputs?.find((i: InputConfig) => i.id === inputId);

            if (input) {
                input.name = name;
                updateNode({...node, inputs: node.inputs?.map((i: InputConfig) => i.id === inputId ? input : i)});
            }
        }
    }, [updateNode, nodes]);

    const addConnection = useCallback((connection: ConnectionConfig) => {
        const index = connections.current.findIndex((c: ConnectionConfig) => {
            return c.from.id === connection.from.id && c.from.pin === connection.from.pin && 
                c.to.id === connection.to.id && c.to.pin === connection.to.pin;
        });
        
        if (index === -1) {
            connections.current.push(connection);
            connections.notifyUpdate();
        }
    }, [connections]);

    const removeConnections = useCallback((from?: ConnectorConfig, to?: ConnectorConfig) => {
        const predicate = getRemoveConnectionsPredicate(from, to);
        if (!predicate) return ;

        removeConnectionsByPredicate(predicate);
    }, [removeConnectionsByPredicate]);

    const loadGraph = useCallback((graph: AppConfig) => {
        actionHistory.lock();
        isLoading.update(true);

        batch(() => {
            variables.update(graph.variables);
            types.update(graph.types ?? []);
            nodes.update(graph.nodes.map(n => createRefSignal(n)));
            connections.update(graph.connections ?? []);
            canvasPosition.update({x: 0, y: 0});
            zoom.update(graph.zoom ?? 100);
            name.update(graph.name);
            id.update(graph.id);
        }, [canvasPosition, zoom, connections, types, variables, nodes, name]);

        isLoading.update(false);
        actionHistory.unlock();
    }, [isLoading, canvasPosition, zoom, connections, types, variables, nodes, name, id]);

    const toGraph = useCallback((): AppConfig => {
        return {
            id: id.current,
            name: name.current,
            connections: connections.current,
            nodes: nodes.current.map(nodeSignal => nodeSignal.current),
            zoom: zoom.current,
            types: types.current,
            variables: variables.current,
        };
    }, [name, connections, nodes, zoom, types, variables, id]);

    const zoomIn = useCallback(() => {
        if (zoom.current >= 200) return; // Prevent zooming in too far
        zoom.update(zoom.current + 2);
    }, [zoom]);

    const zoomOut = useCallback(() => {
        if (zoom.current <= 2) return; // Prevent zooming out too far
        zoom.update(zoom.current - 2);
    }, [zoom]);

    const setVariable = useCallback((id: string, name: string, type: string, isCollection: boolean) => {
        const variable = variables.current.find(v => v.id === id);

        if (variable && (variable.name !== name || variable.type !== type || variable.isCollection !== isCollection)) {
            variable.name = name;
            variable.type = type;
            variable.isCollection = isCollection;
            variables.notifyUpdate();
        } else if (!variable) {
            variables.current.push({id, name, type, isCollection});
            variables.notifyUpdate();
        }
    }, [variables]);

    const setNodeContext = useCallback((nodeId: string, context: Map<string, unknown>) => {
        const nodeSignal = getNodeSignal(nodeId);

        if (nodeSignal) {
            updateNode({...nodeSignal.current, context: mapToJson(context)});
        }
    }, [updateNode, nodes]);

    const getConnectionInfo = useCallback((nodeId: string, src: InputConfig | OutputConfig) => {
        if ("required" in src) {
            const connection = connections.current.find((v) => v.to.id === nodeId && v.to.pin === src.id);
            if (!connection) return undefined;
            // Fetch corresponding node output
            const node = nodes.current.find((v) => v.current.id === connection.from.id);
            if (!node) return undefined;
            const output = node.current.outputs?.find((v) => v.id === connection.from.pin);
            if (!output) return undefined;

            return {
                node,
                target: output
            };
        } else {
            const connection = connections.current.find((v) => v.from.id === nodeId && v.from.pin === src.id);
            if (!connection) return undefined;
            // Fetch corresponding node input
            const node = nodes.current.find((v) => v.current.id === connection.to.id);
            if (!node) return undefined;
            const input = node.current.inputs?.find((v) => v.id === connection.to.pin);
            if (!input) return undefined;
            
            return {
                node,
                target: input
            };
        }
    }, [connections, nodes]);

    const splitInputParam = useCallback((nodeId: string, inputId: string) => {
        const node = getNodeSignal(nodeId);
        if (!node) return;
        const input = node.current.inputs?.find(input => input.id === inputId);
        if (!input) return;

        const graphType = types.current.find(graphType => graphType.id === input.type);
        const inputs = graphType?.properties.map((graphType): InputConfig => {
            return {
                id: `${inputId}_${graphType.id}`,
                name: `${input.name}.${graphType.name}`,
                type: graphType.type,
                isCollection: graphType.isCollection,
                required: false,
                editable: PrimitiveTypes.includes(graphType.type as ParameterTypes)
            };
        }) ?? [];

        let newInputs: InputConfig[] = [];

        for (const _input of node.current.inputs ?? []) {
            if (_input.id !== inputId) {
                newInputs.push(_input);
            } else {
                newInputs = newInputs.concat(inputs);
            }
        }

        setNodeInputs(node.current.id, newInputs);
    }, [nodes, setNodeInputs]);

    const splitOutputParam = useCallback((nodeId: string, outputId: string) => {
        const node = getNodeSignal(nodeId);
        if (!node) return;
        const output = node.current.outputs?.find(output => output.id === outputId);
        if (!output) return;

        const graphType = types.current.find(graphType => graphType.id === output.type);
        const outputs = graphType?.properties.map((graphType): OutputConfig => {
            return {
                id: `${outputId}_${graphType.id}`,
                name: `${output.name}.${graphType.name}`,
                type: graphType.type,
                isCollection: graphType.isCollection,
            };
        }) ?? [];

        let newOutputs: OutputConfig[] = [];

        for (const _output of node.current.outputs ?? []) {
            if (_output.id !== outputId) {
                newOutputs.push(_output);
            } else {
                newOutputs = newOutputs.concat(outputs);
            }
        }

        setNodeOutputs(node.current.id, newOutputs);
    }, [nodes, setNodeOutputs]);

    const addType = useCallback((type: GraphType) => {
        if (!types.current.find(_type => _type.id === type.id)) {
            types.current.push(type);
            types.notifyUpdate();
        }
    }, [types]);

    const addVariable = useCallback((variable: VariableConfig) => {
        if (!variables.current.find(_variable => _variable.id === variable.id)) {
            variables.current.push(variable);
            variables.notifyUpdate();
        }
    }, [variables]);

    const updateType = useCallback((type: GraphType) => {
        types.update(types.current.map(_type => _type.id === type.id ? type : _type));
    }, [types]);

    const updateVariable = useCallback((variable: VariableConfig) => {
        variables.update(variables.current.map(_variable => _variable.id === variable.id ? variable : _variable));
    }, [variables]);

    const baseContext = useMemo<GraphContextType>(() => ({
        id,
        name,
        nodes,
        connections,
        zoom,
        scale,
        canvasPosition,
        variables,
        types,
        computedResult,
        startParams,
        isLoading,
        actionHistory,
        addNode,
        updateNode,
        removeNode,
        removeNodes,
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
        getConnectionInfo,
        splitInputParam,
        splitOutputParam,
        addType,
        removeType,
        addVariable,
        updateType,
        updateVariable,
    }), [id.lastUpdated, computedResult.lastUpdated]); // The only two parameters that can trigger re-render because they are states

    const contextWithHistory = useGraphContextHistory(baseContext);

    return <GraphContext.Provider value={contextWithHistory}>
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
