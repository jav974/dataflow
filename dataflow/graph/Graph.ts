
import { batch, Signal, signal } from '@preact/signals-core';
import { AppConfig, ConnectionConfig, ConnectorConfig, GraphType, InputConfig, NodeConfig, OutputBranchConfig, OutputConfig, VariableConfig } from '../config/schema';
import GraphCrud from './GraphCrud';
import GraphManager, { PartialInputConfig, PartialNodeConfig, PartialOutputConfig } from './GraphManager';

class GraphNodes extends GraphCrud<NodeConfig> {
}

class GraphConnections extends GraphCrud<ConnectionConfig> {
    public static loadConnections(connections: ConnectionConfig[]): GraphConnections {
        const graphConnections = new GraphConnections();
        for (const connection of connections) {
            const connectionKey = Graph.getConnectionKey(connection);
            graphConnections.add({...connection, id: connectionKey});
        }
        return graphConnections;
    }
}

class GraphVariables extends GraphCrud<VariableConfig> {
}

class GraphTypes extends GraphCrud<GraphType> {
}

class Graph implements GraphManager {
    private id: Signal<string> = signal('');
    private name: Signal<string> = signal('');
    private nodes: GraphNodes = new GraphNodes();
    private connections: GraphConnections = new GraphConnections();
    private variables: GraphVariables = new GraphVariables();
    private types: GraphTypes = new GraphTypes();
    private zoom: Signal<number> = signal(100);

    getZoom(): Signal<number> {
        return this.zoom;
    }

    getName(): Signal<string> {
        return this.name;
    }

    getNodes(): Signal<NodeConfig>[] {
        return this.nodes.getAllSignals();
    }

    getConnections(): Signal<ConnectionConfig>[] {
        return this.connections.getAllSignals();
    }

    getVariables(): Signal<VariableConfig>[] {
        return this.variables.getAllSignals();
    }

    getTypes(): Signal<GraphType>[] {
        return this.types.getAllSignals();
    }

    public static getConnectionKey(connection: ConnectionConfig): string {
        return `${connection.from.id}_${connection.from.pin}:${connection.to.id}_${connection.to.pin}`;
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
            this.nodes = GraphNodes.load(graph.nodes || []);
            this.connections = GraphConnections.loadConnections(graph.connections || []);
            this.variables = GraphVariables.load(graph.variables || []);
            this.types = GraphTypes.load(graph.types || []);
        });
    }

    public toJSON(): AppConfig {
        return {
            // id: this.id.value,
            name: this.name.value,
            nodes: this.nodes.getAll(),
            connections: this.connections.getAll(),
            variables: this.variables.getAll(),
            types: this.types.getAll(),
            zoom: this.zoom.value
        };
    }

    public addNode(node: NodeConfig): void {
        this.nodes.add(node);
    }

    public getNode(nodeId: string): NodeConfig | undefined {
        return this.nodes.get(nodeId);
    }

    public getNodeSignal(nodeId: string): Signal<NodeConfig> | undefined {
        return this.nodes.getSignal(nodeId);
    }

    public getAllNodes(): NodeConfig[] {
        return this.nodes.getAll();
    }

    public removeNode(nodeId: string): void {
        batch(() => {
            this.nodes.remove({ id: nodeId });
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
        this.nodes.update(node);
    }

    addConnection(connection: ConnectionConfig) {
        const connectionKey = Graph.getConnectionKey(connection);

        if (!this.connections.get(connectionKey)) {
            this.connections.add({...connection, id: connectionKey});
        }
    }

    removeConnectionsBy(predicate: (conn: ConnectionConfig) => boolean) {
        batch(() => {
            for (const [_, obj] of this.connections.getItems().value) {
                if (predicate(obj.value)) {
                    this.connections.remove(obj.value);
                }
            }
        });
    }

    removeConnections(from?: ConnectorConfig, to?: ConnectorConfig) {
        if (from && to) {
            this.connections.remove({id: Graph.getConnectionKey({from, to, id: ''})});
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
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        if (node.inputs?.find((v) => v.id === input.id)) return ;
        this.updateNode({...node, inputs: [...(node.inputs ?? []), input]});
    }

    addNodeOutput(nodeId: string, output: OutputConfig) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        if (node.outputs?.find((v) => v.id === output.id)) return ;
        this.updateNode({...node, outputs: [...(node.outputs ?? []), output]});
    }

    addNodeBranch(nodeId: string, branch: OutputBranchConfig) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        if (node.branches?.find((v) => v.id === branch.id)) return ;
        this.updateNode({...node, branches: [...(node.branches ?? []), branch]});
    }

    removeNodeInput(nodeId: string, inputId: string) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.inputs = node.inputs?.filter((v) => v.id !== inputId);
        this.updateNode(node);
    }

    removeNodeOutput(nodeId: string, outputId: string) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.outputs = node.outputs?.filter((v) => v.id !== outputId);
        this.updateNode(node);
    }

    removeNodeBranch(nodeId: string, branchId: string) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.branches = node.branches?.filter((v) => v.id !== branchId);
        this.updateNode(node);
    }

    updateNodeInput(nodeId: string, input: PartialInputConfig) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.inputs = node.inputs?.map((v) => v.id === input.id ? {...v, ...input} : v);
        this.updateNode(node);
    }

    updateNodeOutput(nodeId: string, output: PartialOutputConfig) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.outputs = node.outputs?.map((v) => v.id === output.id ? {...v, ...output} : v);
        this.updateNode(node);
    }

    setNodeInputs(nodeId: string, inputs: InputConfig[]) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.inputs = inputs;
        this.updateNode(node);
    }

    setNodeOutputs(nodeId: string, outputs: OutputConfig[]) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.outputs = outputs;
        this.updateNode(node);
    }

    setNodeBranches(nodeId: string, branches: OutputBranchConfig[]) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.branches = branches;
        this.updateNode(node);
    }

    setInputDefaultValue(nodeId: string, inputId: string, value: any) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        const input = node.inputs?.find((v) => v.id === inputId);
        if (!input) return ;
        input.defaultValue = value;
        this.updateNode(node);
    }

    setInputName(nodeId: string, inputId: string, name: string) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        const input = node.inputs?.find((v) => v.id === inputId);
        if (!input) return ;
        input.name = name;
        this.updateNode(node);
    }

    setOutputName(nodeId: string, outputId: string, name: string) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        const output = node.outputs?.find((v) => v.id === outputId);
        if (!output) return ;
        output.name = name;
        this.updateNode(node);
    }

    setNodeContext(nodeId: string, context: Map<string, any>) {
        const node = this.nodes.get(nodeId);
        if (!node) return ;
        node.context = JSON.stringify(Object.fromEntries(context));
        this.updateNode(node);
    }

    setVariable(id: string, name: string, type: string, isCollection: boolean) {
        const variable = this.variables.get(id);

        if (variable) {
            variable.name = name;
            variable.type = type;
            variable.isCollection = isCollection;
            this.variables.update(variable);
        } else {
            this.variables.add({id, name, type, isCollection});
        }
    }

    removeVariable(id: string) {
        this.variables.remove({id});
    }
}

export default Graph;
