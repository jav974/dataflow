/* eslint-disable @typescript-eslint/no-explicit-any */

import { AppConfig, ConnectionConfig, InputConfig, NodeConfig, NodeType, OutputBranchConfig, OutputConfig, ParameterValueType } from "../config/schema";
import registry, { NodeExecParams, NodeExecutor } from "./registry";
import { getIOValues, jsonToMap, mapToKeyValue, Stack } from "./utils";
import executionContext, { KeyValue } from "./context";
import { ExecutionBranch, ExecutionGraph, ExecutionInput, ExecutionOutput, GraphResult } from "./types";
import "./handlers";
import { IExecutionController } from "@dataflow-core/controllers/base.controller";
import { LocalExecutionController } from "@dataflow-core/controllers/local.controller";

export class Graph {
    private graphs: Map<string, ExecutionGraph> = new Map();
    private stack: Stack<ExecutionGraph> = new Stack();
    private nodePos: number = 0;
    private eventGraphs: Map<string, ExecutionGraph> = new Map();

    constructor(private controller: IExecutionController = new LocalExecutionController()) {
    }

    async waitOrCancel() {
        if (!this.controller.started) {
            this.controller.clear();
            throw new Error("Execution canceled");
        }
        await this.controller.waitIfPaused();
    }

    findStartNode(graph: AppConfig): NodeConfig | undefined {
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

    findNextNode(node: NodeConfig, graph: AppConfig, fromPin: string = "continue"): NodeConfig | undefined {
        const connection = graph.connections?.find((c: ConnectionConfig) =>
            c.from.id === node.id && c.from.pin === fromPin
        );

        if (!connection) {
            return undefined;
        }

        return graph.nodes.find((n: NodeConfig) => n.id === connection.to.id);
    }

    inputConfigToExecutionInput(nodeId: string, input: InputConfig, graph: AppConfig): ExecutionInput {
        // Check if input is connected to an existing output
        const connection = graph.connections?.find((c: ConnectionConfig) =>
            c.to.id === nodeId && c.to.pin === input.id
        );
        let executionGraph: ExecutionGraph | undefined;
        
        if (connection) {
            const nodeFrom = graph.nodes.find((n: NodeConfig) => n.id === connection.from.id);

            if (nodeFrom) {
                executionGraph = this.nodeConfigToExecutionGraph(nodeFrom, graph);
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

    findNodeById(id: string, graph: AppConfig): NodeConfig | undefined {
        for (const node of graph.nodes) {
            if (node.id === id) {
                return node;
            }
        }

        return undefined;
    }

    nodeConfigToExecutionGraph(node: NodeConfig, graph: AppConfig): ExecutionGraph {
        let executionGraph: ExecutionGraph | undefined = this.graphs.get(node.id);

        if (executionGraph) {
            return executionGraph;
        }

        const nextNode = this.findNextNode(node, graph);
        const context = jsonToMap<any>(node.context);

        if (node.type === NodeType.CALL_EVENT && context.get('name')) {
            const eventNode = this.findNodeById(context.get('name'), graph);
            
            if (eventNode && !this.eventGraphs.has(eventNode.id)) {
                // TODO: Prevent infinite recursion because of call same event inside event
                this.eventGraphs.set(eventNode.id, this.nodeConfigToExecutionGraph(eventNode, graph));
            }
        }

        context.set('_node_id', node.id);
        context.set('_inputMap', new Map<string, string>());
        context.set('_outputMap', new Map<string, string>());

        executionGraph = {
            pos: this.nodePos++,
            nodeId: node.id,
            executable: node.executable,
            nodeType: node.type,
            inputs: node.inputs?.map((input: InputConfig): ExecutionInput => {
                context.get('_inputMap').set(input.id, input.name);

                return this.inputConfigToExecutionInput(node.id, input, graph)
            }) ?? [],
            outputs: node.outputs?.map((output: OutputConfig): ExecutionOutput => {
                context.get('_outputMap').set(output.id, output.name);

                return {
                    nodeId: node.id,
                    outputId: output.id,
                    outputType: output.type,
                    outputName: output.name,
                    value: undefined
                };
            }) ?? [],
            branches: node.branches?.map((branch: OutputBranchConfig): ExecutionBranch => ({
                nodeId: node.id,
                branchId: branch.id
            })) ?? [],
            visited: false,
            context,
            next: null,
        };

        this.graphs.set(node.id, executionGraph);

        executionGraph.branches.forEach((branch: ExecutionBranch) => {
            const branchNextNode = this.findNextNode(node, graph, branch.branchId);

            if (branchNextNode) {
                branch.graph = this.nodeConfigToExecutionGraph(branchNextNode, graph);
            }
        });

        executionGraph.next = nextNode ? this.nodeConfigToExecutionGraph(nextNode, graph) : null;

        return executionGraph;
    }

    async resolveInputs(graph: ExecutionGraph, revisit: boolean = false, revisitPos: number = 0): Promise<Map<string, ParameterValueType>> {
        const inputs: Map<string, ParameterValueType> = new Map();

        for (const input of graph.inputs) {
            inputs.set(input.inputId, input.defaultValue);

            if (input.resolve) {
                let isBannedFromRevisit = this.stack.items.some((v) => v.nodeId === input.resolve?.graph.nodeId);
                isBannedFromRevisit = isBannedFromRevisit ? isBannedFromRevisit : (input.resolve.graph.pos <= revisitPos);
                isBannedFromRevisit = isBannedFromRevisit ? isBannedFromRevisit : input.resolve.graph.nodeType === NodeType.NEW_EVENT;
                isBannedFromRevisit = isBannedFromRevisit ? isBannedFromRevisit : !input.resolve.graph.visited && input.resolve.graph.executable;

                if (!isBannedFromRevisit && (!input.resolve.graph.visited || revisit)) {
                    input.resolve.graph = await this.resolveExecutionGraph(input.resolve.graph, revisit, revisitPos);
                }

                const executionOutput = input.resolve.graph.outputs.find(
                    (output: ExecutionOutput) => output.outputId === input.resolve?.src.pin
                );

                inputs.set(input.inputId, executionOutput?.value);
            }
        }

        return inputs;
    }

    async handleFor(forGraph: ExecutionGraph, graph: ExecutionGraph, inputs: Map<string, ParameterValueType>): Promise<ExecutionGraph> {
        const first = Number(inputs.get('first'));
        const last = Number(inputs.get('last'));
        const inclusive = inputs.get('inclusive');

        this.stack.push(forGraph);

        if (first <= last) {
            for (let i = first; inclusive ? i <= last : i < last; i++) {
                forGraph.outputs[0].value = i;
                graph = await this.resolveExecutionGraph(graph, true, forGraph.pos);

                while (this.stack.pop() !== forGraph);
                this.stack.push(forGraph);

                await this.controller.wait(0);
            }
        } else {
            for (let i = first; inclusive ? i >= last : i > last; i--) {
                forGraph.outputs[0].value = i;
                graph = await this.resolveExecutionGraph(graph, true, forGraph.pos);

                while (this.stack.pop() !== forGraph);
                this.stack.push(forGraph);

                await this.controller.wait(0);
            }
        }

        this.stack.pop();
        return graph;
    }

    async handleForeach(
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

        this.stack.push(foreachGraph);

        // Handle iterable objects (Array, Map, Set)
        if (Symbol.iterator in target) {
            for (const [key, value] of target.entries()) {
                const iterationInput = new Map<string, any>()
                    .set('index', key)
                    .set('item', value)
                ;
                await this.executeHandler(foreachGraph, iterationInput, registry.get(NodeType.FOREACH) as NodeExecutor);
                graph = await this.resolveExecutionGraph(graph, true, foreachGraph.pos);

                while (this.stack.pop() !== foreachGraph);
                this.stack.push(foreachGraph);

                await this.controller.wait(0);
            }
        }
        // Handle plain objects (iterate over keys)
        else {
            const entries = Object.entries(target);

            for (const [key, value] of entries) {
                const iterationInput = new Map<string, any>()
                    .set('index', key)
                    .set('item', value)
                ;
                await this.executeHandler(foreachGraph, iterationInput, registry.get(NodeType.FOREACH) as NodeExecutor);
                graph = await this.resolveExecutionGraph(graph, true, foreachGraph.pos);

                while (this.stack.pop() !== foreachGraph);
                this.stack.push(foreachGraph);

                await this.controller.wait(0);
            }
        }

        this.stack.pop();
        return graph;
    }

    async handleWhile(
        whileGraph: ExecutionGraph, 
        graph: ExecutionGraph, 
        inputs: Map<string, ParameterValueType>
    ): Promise<ExecutionGraph> {
        this.stack.push(whileGraph);

        while (inputs.get('condition')) {
            graph = await this.resolveExecutionGraph(graph, true, whileGraph.pos);
            
            while (this.stack.pop() !== whileGraph);
            this.stack.push(whileGraph);

            inputs = await this.resolveInputs(whileGraph, true, whileGraph.pos);
            // Wait the slightest amount of time, this lets the controller be able to receive pause/cancel events properly
            // instead of blocking
            await this.controller.wait(0);
        }

        this.stack.pop();

        return graph;
    }

    async executeHandler(graph: ExecutionGraph, inputs: Map<string, any>, executor: NodeExecutor): Promise<NodeExecParams> {
        const result = await executor(inputs, graph.context);

        // Map executor result to graph outputs
        graph.outputs = graph.outputs.map((output: ExecutionOutput) => {
            if (result.has(output.outputId)) {
                output.value = result.get(output.outputId);
            } else {
                console.log("Missing output key", output.outputId, "on", graph.nodeType, "(", graph.nodeId, ")");
            }
            return output;
        });

        return result;
    }

    async handleCallEvent(graph: ExecutionGraph, revisit: boolean = false, revisitPos: number = 0): Promise<ExecutionGraph> {
        const eventId = graph.context.get('name');

        if (this.eventGraphs.has(eventId)) {
            const eventGraph = this.eventGraphs.get(eventId)!;
            const callInputs = mapToKeyValue(await this.resolveInputs(graph, revisit, revisitPos));
            this.mapOutputParamsFromInputs(eventGraph, callInputs);
            
            await this.resolveExecutionGraph(eventGraph, true);

            while (this.stack.pop() !== eventGraph) ;

            return graph;
        } else {
            console.warn('Calling unknown event');
        }

        return graph;
    }

    async handleExecution(graph: ExecutionGraph, revisit: boolean = false, revisitPos: number = 0): Promise<ExecutionGraph> {
        await this.waitOrCancel();

        if (graph.nodeType === NodeType.CALL_EVENT) {
            return await this.handleCallEvent(graph, revisit, revisitPos);
        } else if (graph.nodeType === NodeType.NEW_EVENT) {
            return graph;
        }

        const executor = registry.get(graph.nodeType);

        if (executor) {
            const rawInputs = await this.resolveInputs(graph, revisit, revisitPos);
            const result = await this.executeHandler(graph, rawInputs, executor);

            if (graph.branches.length > 0) {
                switch (graph.nodeType) {
                    case NodeType.SEQUENCE:
                        for (const branch of graph.branches) {
                            if (branch.graph) {
                                branch.graph = await this.resolveExecutionGraph(branch.graph, revisit, revisitPos);
                            }
                        }
                        break ;
                    case NodeType.IF:
                        for (const branch of graph.branches) {
                            if (result.get('branch') === branch.branchId && branch.graph) {
                                branch.graph = await this.resolveExecutionGraph(branch.graph, revisit, revisitPos);
                            }
                        }
                        break ;
                    case NodeType.FOR:
                        if (graph.branches[0].graph) {
                            graph.branches[0].graph = await this.handleFor(graph, graph.branches[0].graph, rawInputs);
                        }
                        break ;
                    case NodeType.FOREACH:
                        if (graph.branches[0].graph) {
                            graph.branches[0].graph = await this.handleForeach(graph, graph.branches[0].graph, rawInputs);
                        }
                        break ;
                    case NodeType.WHILE:
                        if (graph.branches[0].graph) {
                            graph.branches[0].graph = await this.handleWhile(graph, graph.branches[0].graph, rawInputs);
                        }
                        break ;
                }
            }
        } else {
            console.warn("No executor found for node type", graph.nodeType);
        }

        return graph;
    }

    async resolveExecutionGraph(graph: ExecutionGraph, revisit: boolean = false, revisitPos: number = 0): Promise<ExecutionGraph> {
        if (graph.visited && (!revisit || graph.nodeType === NodeType.START || this.stack.items.includes(graph))) {
            return graph;
        }

        graph = await this.handleExecution(graph, revisit, revisitPos);
        graph.visited = true;

        if (revisit && graph.pos > revisitPos) {
            this.stack.push(graph);
        }

        if (graph.next) {
            graph.next = await this.resolveExecutionGraph(graph.next, revisit, revisitPos);
        }

        return graph;
    }

    buildExecutionGraph(graph: AppConfig): ExecutionGraph | undefined {
        const startingNode = this.findStartNode(graph);

        if (!startingNode) {
            console.log("No starting node found: missing either Start or Trigger node");
            return undefined;
        }

        this.graphs.clear();
        this.stack.clear();
        this.eventGraphs.clear();
        this.nodePos = 0;

        executionContext.types = {};
        graph.types?.forEach(type => executionContext.types[type.id] = type);

        return this.nodeConfigToExecutionGraph(startingNode, graph);
    }

    private mapOutputParamsFromInputs(executionGraph: ExecutionGraph, params: KeyValue) {
        executionGraph.outputs?.forEach((output: ExecutionOutput) => {
            executionGraph?.context.set(output.outputId, params[output.outputId] ?? params[output.outputName]);
            output.value = params[output.outputId] ?? params[output.outputName];
        });
    }

    async runGraph(graph: AppConfig, params?: KeyValue): Promise<GraphResult | undefined> {
        let executionGraph = this.buildExecutionGraph(graph);
        
        if (!executionGraph) return undefined;

        if (params) {
            this.mapOutputParamsFromInputs(executionGraph, params);
        }

        const startTime = Date.now();
        
        try {
            executionGraph = await this.resolveExecutionGraph(executionGraph);
        } catch (error) {
            console.error(error);
        }

        const totalTime = Date.now() - startTime;

        console.debug(`Done in ${totalTime}ms`);

        this.controller.clear();

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
            result: executionContext.result,
            io_values: mapToKeyValue(getIOValues(executionGraph))
        };
    }
}

export function buildExecutionGraph(graph: AppConfig): ExecutionGraph | undefined {
    return new Graph().buildExecutionGraph(graph);
}

export async function runGraphWithController(controller: IExecutionController, graph: AppConfig, params?: KeyValue): Promise<GraphResult | undefined> {
    return new Graph(controller).runGraph(graph, params);
}
