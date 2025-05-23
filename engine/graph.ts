import { AppConfig, ConnectionConfig, ConnectorConfig, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig, ParameterType, ParameterValueType } from "@/components/config/Schema";
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

export interface ExecutionBranch {
    nodeId: string;
    branchId: string;
    graph?: ExecutionGraph;
}

export interface ExecutionGraph {
    nodeType: NodeType;
    nodeId: string;
    inputs?: ExecutionInput[];
    outputs: ExecutionOutput[];
    branches: ExecutionBranch[];
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

export function findNextNode(node: NodeConfig, graph: AppConfig, fromPin: string = "continue"): NodeConfig | undefined {
    const connection = graph.connections?.find((c: ConnectionConfig) =>
        c.from.id === node.id && c.from.pin === fromPin
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
        branches: node.outputBranches?.map((branch: OutputBranchConfig): ExecutionBranch => ({
            nodeId: node.id,
            branchId: branch.id
        })) ?? [],
        visited: false,
        context,
        next: null,
    };

    graphs.set(node.id, executionGraph);

    executionGraph.branches.forEach((branch: ExecutionBranch) => {
        const branchNextNode = findNextNode(node, graph, branch.branchId);

        if (branchNextNode) {
            branch.graph = nodeConfigToExecutionGraph(branchNextNode, graph);
        }
    });

    executionGraph.next = nextNode ? nodeConfigToExecutionGraph(nextNode, graph) : null;

    return executionGraph;
}

export function resolveInputs(graph: ExecutionGraph, revisit: boolean = false): Map<string, ParameterValueType> {
    const inputs: Map<string, ParameterValueType> = new Map();

    graph.inputs?.forEach((input: ExecutionInput) => {
        inputs.set(input.inputId, input.defaultValue);

        if (input.resolve) {
            if (!input.resolve.graph.visited || revisit) {
                input.resolve.graph = resolveExecutionGraph(input.resolve.graph, revisit);
            }

            const executionOutput = input.resolve.graph.outputs.find(
                (output: ExecutionOutput) => output.outputId === input.resolve?.src.pin
            );

            inputs.set(input.inputId, executionOutput?.value);
        }
    });

    return inputs;
}

function handleFor(graph: ExecutionGraph, inputs: Map<string, ParameterValueType>): ExecutionGraph {
    const first = Number(inputs.get('first'));
    const last = Number(inputs.get('last'));
    const inclusive = inputs.get('inclusive');

    if (first <= last) {
        for (let i = first; inclusive ? i <= last : i < last; i++) {
            graph.outputs[0].value = i;
            graph = resolveExecutionGraph(graph, true);
        }
    } else {
        for (let i = first; inclusive ? i >= last : i > last; i--) {
            graph.outputs[0].value = i;
            graph = resolveExecutionGraph(graph, true);
        }
    }

    return graph;
}

export function handleExecution(graph: ExecutionGraph, revisit: boolean = false): ExecutionGraph {
    const rawInputs = resolveInputs(graph, revisit);
    const executor = registry.get(graph.nodeType);

    if (executor) {
        const result = executor(rawInputs, graph.context);

        // Map executor result to graph outputs
        graph.outputs = graph.outputs.map((output: ExecutionOutput) => {
            if (result.has(output.outputId)) {
                output.value = result.get(output.outputId);
            } else {
                console.log("Missing output key", output.outputId, "on", graph.nodeType, "(", graph.nodeId, ")");
            }
            return output;
        });

        if (graph.branches.length > 0) {
            switch (graph.nodeType) {
                case NodeType.SEQUENCE:
                    graph.branches.forEach((branch: ExecutionBranch) => {
                        if (branch.graph) {
                            branch.graph = resolveExecutionGraph(branch.graph, revisit);
                        }
                    });
                    break ;
                case NodeType.IF:
                    graph.branches.forEach((branch: ExecutionBranch) => {
                        if (result.get('branch') === branch.branchId && branch.graph) {
                            branch.graph = resolveExecutionGraph(branch.graph, revisit);
                        }
                    });
                    break ;
                case NodeType.FOR:
                    if (graph.branches[0].graph) {
                        graph.branches[0].graph = handleFor(graph.branches[0].graph, rawInputs);
                    }
                    break ;
            }
        }
    } else {
        console.log("No executor found for node type", graph.nodeType);
    }

    return graph;
}

export function resolveExecutionGraph(graph: ExecutionGraph, revisit: boolean = false): ExecutionGraph {
    if (graph.visited && !revisit) {
        return graph;
    }

    graph = handleExecution(graph, revisit);
    graph.visited = true;

    if (graph.next) {
        graph.next = resolveExecutionGraph(graph.next, revisit);
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
