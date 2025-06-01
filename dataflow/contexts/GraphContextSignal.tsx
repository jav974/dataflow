import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppConfig, ConnectionConfig, ConnectorConfig, Coordinates, GraphType, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig, VariableConfig } from "@/dataflow/config/schema";
import { RefState, useRefState } from "@/dataflow/hooks/useRefState";
import GraphManager, { PartialInputConfig, PartialNodeConfig, PartialOutputConfig } from "../graph/GraphManager";
import Graph from "../graph/Graph";
import {ReadonlySignal, Signal, computed} from "@preact/signals-react"

interface GraphContextType extends GraphManager {
    name: Signal<string>;
    nodes: Signal<NodeConfig>[];
    connections: Signal<ConnectionConfig>[];
    zoom: Signal<number>;
    scale: ReadonlySignal<number>;
    canvasPosition: RefState<Coordinates>;
    variables: Signal<VariableConfig>[];
    types: Signal<GraphType>[];
    computedResult: RefState<Map<string, any>>;
}

const GraphContext = createContext<GraphContextType | null>(null);

interface GraphProviderProps {
    children: React.ReactNode
}

export function GraphProvider({children}: GraphProviderProps) {
    const canvasPosition = useRefState<Coordinates>({x: 0, y: 0});
    const computedResult = useRefState<Map<string, any>>(new Map());
    const graph = useRefState<Graph>(new Graph());

    const scale = computed(() => {
        const zoom = graph.ref.current.getZoom().value;
        return zoom != 0 ? 1 / (zoom / 100) : 0;
    });

    const addNode = useCallback((node: NodeConfig) => {
        graph.ref.current.addNode(node);
    }, []);

    const updateNode = useCallback((node: PartialNodeConfig) => {
        graph.ref.current.updateNode(node);
    }, []);

    const removeNode = useCallback((id: string) => {
        graph.ref.current.removeNode(id);
    }, []);

    const removeNodes = useCallback((ids: string[]) => {
        graph.ref.current.removeNodes(ids);
    }, []);

    const addNodeInput = useCallback((id: string, input: InputConfig) => {
        graph.ref.current.addNodeInput(id, input);
    }, []);

    const updateNodeInput = useCallback((id: string, input: PartialInputConfig) => {
        graph.ref.current.updateNodeInput(id, input);
    }, []);

    const setNodeInputs = useCallback((id: string, inputs: InputConfig[]) => {
        graph.ref.current.setNodeInputs(id, inputs);
    }, []);

    const removeNodeInput = useCallback((nodeId: string, inputId: string) => {
        graph.ref.current.removeNodeInput(nodeId, inputId);
    }, []);

    const setInputDefaultValue = useCallback((nodeId: string, inputId: string, value: any) => {
        graph.ref.current.setInputDefaultValue(nodeId, inputId, value);
    }, []);

    const addNodeOutput = useCallback((id: string, output: OutputConfig) => {
        graph.ref.current.addNodeOutput(id, output);
    }, []);

    const updateNodeOutput = useCallback((id: string, output: PartialOutputConfig) => {
        graph.ref.current.updateNodeOutput(id, output);
    }, []);

    const setNodeOutputs = useCallback((id: string, outputs: OutputConfig[]) => {
        graph.ref.current.setNodeOutputs(id, outputs);
    }, []);

    const removeNodeOutput = useCallback((nodeId: string, outputId: string) => {
        graph.ref.current.removeNodeOutput(nodeId, outputId);
    }, []);

    const addNodeBranch = useCallback((id: string, branch: OutputBranchConfig) => {
        graph.ref.current.addNodeBranch(id, branch);
    }, []);

    const removeNodeBranch = useCallback((nodeId: string, branchId: string) => {
        graph.ref.current.removeNodeBranch(nodeId, branchId);
    }, []);

    const setNodeBranches = useCallback((id: string, branches: OutputBranchConfig[]) => {
        graph.ref.current.setNodeBranches(id, branches);
    }, []);

    const setOutputName = useCallback((nodeId: string, outputId: string, name: string) => {
        graph.ref.current.setOutputName(nodeId, outputId, name);
    }, []);

    const setInputName = useCallback((nodeId: string, inputId: string, name: string) => {
        graph.ref.current.setInputName(nodeId, inputId, name);
    }, []);

    const addConnection = useCallback((connection: ConnectionConfig) => {
        graph.ref.current.addConnection(connection);
    }, []);

    const removeConnections = useCallback((from?: ConnectorConfig, to?: ConnectorConfig) => {
        graph.ref.current.removeConnections(from, to);
    }, []);

    const loadGraph = useCallback((config: AppConfig) => {
        graph.ref.current.loadGraph(config);
    }, []);

    const zoomIn = useCallback(() => {
        graph.ref.current.zoomIn();
    }, []);

    const zoomOut = useCallback(() => {
        graph.ref.current.zoomOut();
    }, []);

    const setVariable = useCallback((id: string, name: string, type: string, isCollection: boolean) => {
        graph.ref.current.setVariable(id, name, type, isCollection);
    }, []);

    const removeVariable = useCallback((id: string) => {
        graph.ref.current.removeVariable(id);
    }, []);

    const setNodeContext = useCallback((nodeId: string, context: Map<string, any>) => {
        graph.ref.current.setNodeContext(nodeId, context);
    }, []);

    return <GraphContext.Provider value={{
        name: graph.ref.current.getName(),
        nodes: graph.ref.current.getNodes(),
        connections: graph.ref.current.getConnections(),
        zoom: graph.ref.current.getZoom(),
        scale,
        canvasPosition,
        variables: graph.ref.current.getVariables(),
        types: graph.ref.current.getTypes(),
        computedResult,
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
