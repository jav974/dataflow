import { AppConfig, ConnectionConfig, ConnectorConfig, InputConfig, NodeConfig, NodeType, OutputConfig, ParameterType, ParameterValueType } from "@/components/config/Schema";
import registry from "./registry";
import { jsonToMap } from "./utils";
import executionContext, { KeyValue } from "./context";
import "./handlers";

const graphs: Map<string, ExecutionGraph> = new Map();

export interface ExecutionInputResolver {
    graph: ExecutionGraph;
    src: ConnectorConfig;
}

export interface ExecutionInput {
    nodeId: string;
    inputId: string;
    inputType: ParameterType;
    inputName: string;
    defaultValue?: ParameterValueType;
    resolve?: ExecutionInputResolver;
}

export interface ExecutionOutput {
    nodeId: string;
    outputId: string;
    outputName: string;
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
    context: Map<string, any>;
}

export interface GraphResult {
    graph: ExecutionGraph;
    result: KeyValue;
}

export function findStartNode(graph: AppConfig): NodeConfig | undefined {
    let node = graph.nodes.find((n: NodeConfig) =>
        n.type === NodeType.START
    );

    if (node) {
        return node;
    }

    node = graph.nodes.find((n: NodeConfig) =>
        n.type === NodeType.TRIGGER
    );

    return node;
}

export function findNextNode(node: NodeConfig, graph: AppConfig): NodeConfig | undefined {
    const connection = graph.connections?.find((c: ConnectionConfig) =>
        c.from.id === node.id && c.from.pin === "continue"
    );

    if (!connection) {
        return undefined;
    }

    return graph.nodes.find((n: NodeConfig) => n.id === connection.to.id);
}

export function inputConfigToExecutionInput(nodeId: string, input: InputConfig, graph: AppConfig): ExecutionInput {
    // Check if input is connected to an existing output
    const connection = graph.connections?.find((c: ConnectionConfig) =>
        c.to.id === nodeId && c.to.pin === input.id
    );
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
        inputName: input.name,
        defaultValue: input.defaultValue,
        resolve: executionGraph && connection ? {graph: executionGraph, src: connection.from} : undefined
    };
}

export function nodeConfigToExecutionGraph(node: NodeConfig, graph: AppConfig): ExecutionGraph {
    let executionGraph: ExecutionGraph | undefined = graphs.get(node.id);

    if (executionGraph) {
        return executionGraph;
    }

    const nextNode = findNextNode(node, graph);
    const context = jsonToMap(node.context);

    context.set('_node_id', node.id);

    executionGraph = {
        nodeId: node.id,
        nodeType: node.type,
        inputs: node.inputs?.map((input: InputConfig): ExecutionInput =>
            inputConfigToExecutionInput(node.id, input, graph)
        ),
        outputs: node.outputs?.map((output: OutputConfig): ExecutionOutput => ({
            nodeId: node.id,
            outputId: output.id,
            outputType: output.type,
            outputName: output.name,
            value: undefined
        })) ?? [],
        visited: false,
        context,
        next: null,
    };

    graphs.set(node.id, executionGraph);

    executionGraph.next = nextNode ? nodeConfigToExecutionGraph(nextNode, graph) : null;

    return executionGraph;
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
        const result = executor(rawInputs, graph.context);

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
    const startingNode = findStartNode(graph);

    if (!startingNode) {
        console.log("No starting node found: missing either Start or Trigger node");
        return undefined;
    }

    graphs.clear();

    return nodeConfigToExecutionGraph(startingNode, graph);
}

export function runGraph(graph: AppConfig, params: KeyValue): GraphResult | undefined {
    let executionGraph = buildExecutionGraph(graph);
    if (!executionGraph) return undefined;

    executionGraph.outputs?.forEach((output: ExecutionOutput) => {
        executionGraph?.context.set(output.outputId, params[output.outputId] ?? params[output.outputName]);
    });

    executionGraph = resolveExecutionGraph(executionGraph);
    let iterator = executionGraph;

    while (iterator.next) {
        iterator = iterator.next;
    }

    if (iterator.nodeType !== NodeType.RETURN) {
        console.log("Graph not terminated with RETURN node.");
        return undefined;
    }

    return {
        graph: executionGraph,
        result: executionContext.result
    };
}
