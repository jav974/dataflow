
import { batch, Signal, signal } from '@preact/signals-react';
import { AppConfig, ConnectionConfig, ConnectorConfig, GraphType, InputConfig, NodeConfig, OutputBranchConfig, OutputConfig, VariableConfig } from '../config/schema';
import GraphManager, { PartialInputConfig, PartialNodeConfig, PartialOutputConfig } from './GraphManager';

class Graph implements GraphManager {
    private id: Signal<string> = signal('');
    private name: Signal<string> = signal('');
    private nodes: Signal<Signal<NodeConfig>[]> = signal([]);
    private connections: Signal<Signal<ConnectionConfig>[]> = signal([]);
    private variables: Signal<Signal<VariableConfig>[]> = signal([]);
    private types: Signal<Signal<GraphType>[]> = signal([]);
    private zoom: Signal<number> = signal(100);

    getZoom(): Signal<number> {
        return this.zoom;
    }

    getName(): Signal<string> {
        return this.name;
    }

    getNodes(): Signal<Signal<NodeConfig>[]> {
        return this.nodes;
    }

    getConnections(): Signal<Signal<ConnectionConfig>[]> {
        return this.connections;
    }

    getVariables(): Signal<Signal<VariableConfig>[]> {
        return this.variables;
    }

    getTypes(): Signal<Signal<GraphType>[]> {
        return this.types;
    }

    public static load(config: AppConfig): Graph {
        const graph = new Graph();
        graph.loadGraph(config);
        return graph;
    }

    public static loadFromJSON(json: string): Graph {
        try {
            const config = JSON.parse(json) as AppConfig;
            return Graph.load(config);
        } catch (error) {
            console.error('Failed to parse AppConfig json:', error);
            throw new Error('Invalid JSON format');
        }
    }

    public loadGraph(graph: AppConfig) {
        batch(() => {
            // graph.id.value = config.id || '';
            this.name.value = graph.name || '';
            this.zoom.value = graph.zoom ?? 100;
            this.nodes.value = graph.nodes.map((v) => signal(v));
            this.connections.value = graph.connections?.map((v) => signal(v)) ?? [];
            this.variables.value = graph.variables?.map((v) => signal(v)) ?? [];
            this.types.value = graph.types?.map((v) => signal(v)) ?? [];
        });
    }

    public toJSON(): AppConfig {
        return {
            // id: this.id.value,
            name: this.name.value,
            nodes: this.nodes.value.map((v) => v.value),
            connections: this.connections.value.map((v) => v.value),
            variables: this.variables.value.map((v) => v.value),
            types: this.types.value.map((v) => v.value),
            zoom: this.zoom.value
        };
    }

    public addNode(node: NodeConfig): void {
        this.nodes.value = [...this.nodes.value, signal(node)];
    }

    public getNode(nodeId: string): NodeConfig | undefined {
        return this.getNodeSignal(nodeId)?.value;
    }

    public getNodeSignal(nodeId: string): Signal<NodeConfig> | undefined {
        return this.nodes.value.find((v) => v.value.id === nodeId);
    }

    public getAllNodes(): NodeConfig[] {
        return this.nodes.value.map((v) => v.value);
    }

    public removeNode(nodeId: string): void {
        batch(() => {
            this.nodes.value = this.nodes.value.filter((v) => v.value.id !== nodeId);
            this.removeConnectionsBy((conn) => conn.from.id === nodeId || conn.to.id === nodeId);
        });
    }

    public removeNodes(nodeIds: string[]): void {
        batch(() => {
            for (const nodeId of nodeIds) {
                this.removeNode(nodeId);
            }
        });
    }

    updateNode(node: PartialNodeConfig): void {
        const nodeSignal = this.nodes.value.find((v) => v.value.id === node.id);
        
        if (nodeSignal) {
            nodeSignal.value = {...nodeSignal.value, ...node};
        }
    }

    addConnection(connection: ConnectionConfig) {
        const connectionSignal = this.connections.value.find((v) =>
            v.value.from.id === connection.from.id &&
            v.value.from.pin === connection.from.pin &&
            v.value.to.id === connection.to.id &&
            v.value.to.pin === connection.to.pin
        );

        if (!connectionSignal) {
            this.connections.value = [...this.connections.value, signal(connection)];
        }
    }

    removeConnectionsBy(predicate: (conn: ConnectionConfig) => boolean) {
        this.connections.value = this.connections.value.filter((v) => !predicate(v.value));
    }

    removeConnections(from?: ConnectorConfig, to?: ConnectorConfig) {
        if (from && to) {
            this.removeConnectionsBy((conn) => conn.from.id === from.id && conn.from.pin === from.pin && conn.to.id === to.id && conn.to.pin === to.pin);
        } else if (from) {
            this.removeConnectionsBy((conn) => conn.from.id === from.id && conn.from.pin === from.pin);
        } else if (to) {
            this.removeConnectionsBy((conn) => conn.to.id === to.id && conn.to.pin === to.pin);
        }
    }

    zoomIn() {
        if (this.zoom.value >= 200) return ;
        this.zoom.value += 2;
    }

    zoomOut() {
        if (this.zoom.value <= 2) return ;
        this.zoom.value -= 2;
    }

    addNodeInput(nodeId: string, input: InputConfig) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal && !nodeSignal.value.inputs?.find((v) => v.id === input.id)) {
            nodeSignal.value = {...nodeSignal.value, inputs: [...(nodeSignal.value.inputs ?? []), input]};
        }
    }

    addNodeOutput(nodeId: string, output: OutputConfig) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal && !nodeSignal.value.outputs?.find((v) => v.id === output.id)) {
            nodeSignal.value = {...nodeSignal.value, outputs: [...(nodeSignal.value.outputs ?? []), output]};
        }
    }

    addNodeBranch(nodeId: string, branch: OutputBranchConfig) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal && !nodeSignal.value.branches?.find((v) => v.id === branch.id)) {
            nodeSignal.value = {...nodeSignal.value, branches: [...(nodeSignal.value.branches ?? []), branch]};
        }
    }

    removeNodeInput(nodeId: string, inputId: string) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal) {
            nodeSignal.value = {
                ...nodeSignal.value,
                inputs: nodeSignal.value.inputs?.filter((v) => v.id !== inputId)
            };
        }
    }

    removeNodeOutput(nodeId: string, outputId: string) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal) {
            nodeSignal.value = {
                ...nodeSignal.value,
                outputs: nodeSignal.value.outputs?.filter((v) => v.id !== outputId)
            };
        }
    }

    removeNodeBranch(nodeId: string, branchId: string) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal) {
            nodeSignal.value = {
                ...nodeSignal.value,
                branches: nodeSignal.value.branches?.filter((v) => v.id !== branchId)
            };
        }
    }

    updateNodeInput(nodeId: string, input: PartialInputConfig) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal) {
            nodeSignal.value = {
                ...nodeSignal.value,
                inputs: nodeSignal.value.inputs?.map((v) => v.id === input.id ? {...v, ...input} : v)
            };
        }
    }

    updateNodeOutput(nodeId: string, output: PartialOutputConfig) {
        const nodeSignal = this.getNodeSignal(nodeId);

        if (nodeSignal) {
            nodeSignal.value = {
                ...nodeSignal.value,
                outputs: nodeSignal.value.outputs?.map((v) => v.id === output.id ? {...v, ...output} : v)
            };
        }
    }

    setNodeInputs(nodeId: string, inputs: InputConfig[]) {
        this.updateNode({id: nodeId, inputs});
    }

    setNodeOutputs(nodeId: string, outputs: OutputConfig[]) {
        this.updateNode({id: nodeId, outputs});
    }

    setNodeBranches(nodeId: string, branches: OutputBranchConfig[]) {
        this.updateNode({id: nodeId, branches});
    }

    setInputDefaultValue(nodeId: string, inputId: string, value: any) {
        this.updateNodeInput(nodeId, {id: inputId, defaultValue: value});
    }

    setInputName(nodeId: string, inputId: string, name: string) {
        this.updateNodeInput(nodeId, {id: inputId, name});
    }

    setOutputName(nodeId: string, outputId: string, name: string) {
        this.updateNodeOutput(nodeId, {id: outputId, name});
    }

    setNodeContext(nodeId: string, context: Map<string, any>) {
        this.updateNode({id: nodeId, context: JSON.stringify(Object.fromEntries(context))});
    }

    setVariable(id: string, name: string, type: string, isCollection: boolean) {
        const variableSignal = this.variables.value.find((v) => v.value.id === id);

        if (variableSignal) {
            variableSignal.value = {...variableSignal.value, name, type, isCollection};
        } else {
            this.variables.value = [...this.variables.value, signal({id, name, type, isCollection})];
        }
    }

    removeVariable(id: string) {
        this.variables.value = this.variables.value.filter((v) => v.value.id !== id);
    }
}

export default Graph;
