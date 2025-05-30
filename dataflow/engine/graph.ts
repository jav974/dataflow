import { AppConfig, ConnectionConfig, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig, ParameterValueType } from "@/dataflow/config/schema";
import registry from "./registry";
import { jsonToMap, Stack } from "./utils";
import executionContext, { KeyValue } from "./context";
import { ExecutionBranch, ExecutionGraph, ExecutionInput, ExecutionOutput, GraphResult } from "./types";
import "./handlers";

const graphs: Map<string, ExecutionGraph> = new Map();
const stack = new Stack<ExecutionGraph>();

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
        ) ?? [],
        outputs: node.outputs?.map((output: OutputConfig): ExecutionOutput => ({
            nodeId: node.id,
            outputId: output.id,
            outputType: output.type,
            outputName: output.name,
            value: undefined
        })) ?? [],
        branches: node.branches?.map((branch: OutputBranchConfig): ExecutionBranch => ({
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

export async function resolveInputs(graph: ExecutionGraph, revisit: boolean = false): Promise<Map<string, ParameterValueType>> {
    const inputs: Map<string, ParameterValueType> = new Map();

    for (const input of graph.inputs) {
        inputs.set(input.inputId, input.defaultValue);

        if (input.resolve) {
            const bannedRevisitGraph = stack.peek();

            if (input.resolve.graph.nodeId !== bannedRevisitGraph?.nodeId && (!input.resolve.graph.visited || revisit)) {
                input.resolve.graph = await resolveExecutionGraph(input.resolve.graph, revisit);
            }

            const executionOutput = input.resolve.graph.outputs.find(
                (output: ExecutionOutput) => output.outputId === input.resolve?.src.pin
            );

            inputs.set(input.inputId, executionOutput?.value);
        }
    }

    return inputs;
}

async function handleFor(forGraph: ExecutionGraph, graph: ExecutionGraph, inputs: Map<string, ParameterValueType>): Promise<ExecutionGraph> {
    const first = Number(inputs.get('first'));
    const last = Number(inputs.get('last'));
    const inclusive = inputs.get('inclusive');

    stack.push(forGraph);

    if (first <= last) {
        for (let i = first; inclusive ? i <= last : i < last; i++) {
            forGraph.outputs[0].value = i;
            graph = await resolveExecutionGraph(graph, true);
        }
    } else {
        for (let i = first; inclusive ? i >= last : i > last; i--) {
            forGraph.outputs[0].value = i;
            graph = await resolveExecutionGraph(graph, true);
        }
    }

    stack.pop();

    return graph;
}

async function handleForeach(
    foreachGraph: ExecutionGraph, 
    graph: ExecutionGraph, 
    inputs: Map<string, ParameterValueType>
): Promise<ExecutionGraph> {
    const target: any = inputs.get("value");

    // Exclude unwanted types
    if (
        target === null ||
        target === undefined ||
        typeof target !== "object" || 
        typeof target === "function" ||
        target instanceof WeakMap || 
        target instanceof WeakSet || 
        ArrayBuffer.isView(target) || 
        target instanceof Error
    ) {
        return graph;
    }

    stack.push(foreachGraph);

    // Handle iterable objects (Array, Map, Set)
    if (Symbol.iterator in target) {
        for (const [key, value] of target.entries()) {
            foreachGraph.outputs[0].value = key;
            foreachGraph.outputs[1].value = value;
            graph = await resolveExecutionGraph(graph, true);
        }
    } 
    // Handle plain objects (iterate over keys)
    else {
        const entries = Object.entries<any>(target);

        for (const [key, value] of entries) {
            foreachGraph.outputs[0].value = key;
            foreachGraph.outputs[1].value = value;
            graph = await resolveExecutionGraph(graph, true);
        }
    }

    stack.pop();
    return graph;
}

export async function handleExecution(graph: ExecutionGraph, revisit: boolean = false): Promise<ExecutionGraph> {
    const executor = registry.get(graph.nodeType);

    if (executor) {
        const rawInputs = await resolveInputs(graph, revisit);
        const result = await executor(rawInputs, graph.context);

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
                    for (const branch of graph.branches) {
                        if (branch.graph) {
                            branch.graph = await resolveExecutionGraph(branch.graph, revisit);
                        }
                    }
                    break ;
                case NodeType.IF:
                    for (const branch of graph.branches) {
                        if (result.get('branch') === branch.branchId && branch.graph) {
                            branch.graph = await resolveExecutionGraph(branch.graph, revisit);
                        }
                    }
                    break ;
                case NodeType.FOR:
                    if (graph.branches[0].graph) {
                        graph.branches[0].graph = await handleFor(graph, graph.branches[0].graph, rawInputs);
                    }
                    break ;
                case NodeType.FOREACH:
                    if (graph.branches[0].graph) {
                        graph.branches[0].graph = await handleForeach(graph, graph.branches[0].graph, rawInputs);
                    }
                    break ;
            }
        }
    } else {
        console.log("No executor found for node type", graph.nodeType);
    }

    return graph;
}

export async function resolveExecutionGraph(graph: ExecutionGraph, revisit: boolean = false): Promise<ExecutionGraph> {
    if (graph.visited && (!revisit || graph.nodeType === NodeType.START)) {
        return graph;
    }

    graph = await handleExecution(graph, revisit);
    graph.visited = true;

    if (graph.next) {
        graph.next = await resolveExecutionGraph(graph.next, revisit);
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
    stack.clear();

    return nodeConfigToExecutionGraph(startingNode, graph);
}

export async function runGraph(graph: AppConfig, params?: KeyValue): Promise<GraphResult | undefined> {
    let executionGraph = buildExecutionGraph(graph);
    if (!executionGraph) return undefined;

    if (params) {
        executionGraph.outputs?.forEach((output: ExecutionOutput) => {
            executionGraph?.context.set(output.outputId, params[output.outputId] ?? params[output.outputName]);
        });
    }

    executionGraph = await resolveExecutionGraph(executionGraph);
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
