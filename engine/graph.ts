import { AppConfig, ConnectionConfig, ConnectorConfig, InputConfig, NodeConfig, NodeType, OutputConfig, ParameterType, ParameterValueType } from "@/components/config/Schema";
import registry from "./registry";
import "./handlers";

export interface ExecutionInputResolver {
    graph: ExecutionGraph;
    src: ConnectorConfig;
}

export interface ExecutionInput {
    nodeId: string;
    inputId: string;
    inputType: ParameterType;
    defaultValue?: ParameterValueType;
    resolve?: ExecutionInputResolver;
}

export interface ExecutionOutput {
    nodeId: string;
    outputId: string;
    outputType: ParameterType;
    value: ParameterValueType;
}

export interface ExecutionGraph {
    nodeType: NodeType;
    nodeId: string;
    inputs?: ExecutionInput[];
    outputs: ExecutionOutput[];
    next: ExecutionGraph | null;
    visited: boolean;
}

/**
 * Find the starting point(s) for the given graph
 * Starting points are determined by:
 * - Trigger nodes (each trigger node is a beginning of a graph path)
 * - Nodes that possess an execute and a continue pin, with unconnected execute pin (and thus are executable)
 * 
 * @param graph
 */
export function findStartNodes(graph: AppConfig): NodeConfig[] {
    // Filter nodes that have their execute pin connected
    const excludedNodes = graph.connections
        ?.filter((conn: ConnectionConfig) => conn.to.pin === 'execute')
        .map((conn: ConnectionConfig) => conn.to.id) ?? [];

    const nodes = graph.nodes.filter((node: NodeConfig) =>
        node.executable && !excludedNodes.includes(node.id)
    );

    return nodes;
}

function findNextNode(node: NodeConfig, graph: AppConfig): NodeConfig | undefined {
    const connection = graph.connections?.find((c: ConnectionConfig) => c.from.id === node.id && c.from.pin === "continue");

    if (!connection) {
        return undefined;
    }

    return graph.nodes.find((n: NodeConfig) => n.id === connection.to.id);
}

export function inputConfigToExecutionInput(nodeId: string, input: InputConfig, graph: AppConfig): ExecutionInput {
    // Check if input is connected to an existing output
    const connection = graph.connections?.find((c: ConnectionConfig) => c.to.id === nodeId && c.to.pin === input.id);
    let executionGraph: ExecutionGraph | undefined;
    
    if (connection) {
        const nodeFrom = graph.nodes.find((n: NodeConfig) => n.id === connection.from.id);

        if (nodeFrom) {
            executionGraph = nodeConfigToExecutionGraph(nodeFrom, graph);
        }
    }

    return {
        nodeId,
        inputId: input.id,
        inputType: input.type,
        defaultValue: input.defaultValue,
        resolve: executionGraph && connection ? {graph: executionGraph, src: connection.from} : undefined
    };
}

function nodeConfigToExecutionGraph(node: NodeConfig, graph: AppConfig): ExecutionGraph {
    const nextNode = findNextNode(node, graph);

    return {
        nodeId: node.id,
        nodeType: node.type,
        inputs: node.inputs?.map((input: InputConfig): ExecutionInput => inputConfigToExecutionInput(node.id, input, graph)),
        outputs: node.outputs?.map((output: OutputConfig): ExecutionOutput => ({
            nodeId: node.id,
            outputId: output.id,
            outputType: output.type,
            value: undefined
        })) ?? [],
        visited: false,
        next: nextNode ? nodeConfigToExecutionGraph(nextNode, graph) : null
    };
}

export function resolveInputs(graph: ExecutionGraph): Map<string, ParameterValueType> {
    const inputs: Map<string, ParameterValueType> = new Map();

    graph.inputs?.forEach((input: ExecutionInput) => {
        inputs.set(input.inputId, input.defaultValue);

        if (input.resolve) {
            if (!input.resolve.graph.visited) {
                input.resolve.graph = resolveExecutionGraph(input.resolve.graph);
            }

            const executionOutput = input.resolve.graph.outputs.find(
                (output: ExecutionOutput) => output.outputId === input.resolve?.src.pin
            );

            inputs.set(input.inputId, executionOutput?.value);
        }
    });

    return inputs;
}

export function handleExecution(graph: ExecutionGraph): ExecutionGraph {
    const rawInputs = resolveInputs(graph);
    const executor = registry.get(graph.nodeType);

    if (executor) {
        const result = executor(rawInputs, undefined);

        graph.outputs = graph.outputs.map((output: ExecutionOutput) => {
            if (result.has(output.outputId)) {
                output.value = result.get(output.outputId);
            } else {
                console.log("Missing output key", output.outputId, "on", graph.nodeType, "(", graph.nodeId, ")");
            }
            return output;
        });
    } else {
        console.log("No executor found for node type", graph.nodeType);
    }

    return graph;
}

export function resolveExecutionGraph(graph: ExecutionGraph): ExecutionGraph {
    if (graph.visited) {
        return graph;
    }

    graph = handleExecution(graph);
    graph.visited = true;

    if (graph.next) {
        graph.next = resolveExecutionGraph(graph.next);
    }

    return graph;
}

export function buildExecutionGraph(graph: AppConfig): ExecutionGraph | undefined {
    // Find start node in graph
    const startingNodes = findStartNodes(graph);

    if (startingNodes.length === 0) {
        return undefined;
    }

    return nodeConfigToExecutionGraph(startingNodes[0], graph);
}
