import { RefSignal } from "react-refsignal";
import { AppConfig, ConnectionConfig, ConnectorConfig, Coordinates, GraphType, InputConfig, NodeConfig, OutputBranchConfig, OutputConfig, VariableConfig } from "../config/schema";
import { RefState } from "../hooks/useRefState";
import { KeyValue } from "../engine/context";
import { GraphCommand, UseHistoryReturn } from "../hooks/useHistory";

export interface ConnectionInfo {
    node: RefSignal<NodeConfig>;
    target: InputConfig | OutputConfig;
}

export interface GraphContextType {
    id: RefState<string>;
    // id: string;
    name: RefSignal<string>;
    nodes: RefSignal<RefSignal<NodeConfig>[]>;
    connections: RefSignal<ConnectionConfig[]>;
    zoom: RefSignal<number>;
    scale: RefSignal<number>;
    canvasPosition: RefSignal<Coordinates>;
    variables: RefSignal<VariableConfig[]>;
    types: RefSignal<GraphType[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    computedResult: RefState<Map<string, any>>;
    startParams: RefSignal<KeyValue>;
    isLoading: RefSignal<boolean>;
    actionHistory: UseHistoryReturn<GraphCommand>;
    addNode: (node: NodeConfig) => void;
    updateNode: (node: NodeConfig) => void;
    removeNode: (id: string) => void;
    removeNodes: (ids: string[]) => void;
    addNodeInput: (id: string, input: InputConfig) => void;
    updateNodeInput: (id: string, input: Partial<InputConfig>) => void;
    removeNodeInput: (nodeId: string, inputId: string) => void;
    setNodeInputs: (id: string, inputs: InputConfig[]) => void;
    setInputDefaultValue: (nodeId: string, inputId: string, value: unknown) => void;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setNodeContext: (nodeId: string, context: Map<string, any>) => void;
    setOutputName: (nodeId: string, outputId: string, name: string) => void;
    setInputName: (nodeId: string, inputId: string, name: string) => void;
    getConnectionInfo: (nodeId: string, src: InputConfig | OutputConfig) => ConnectionInfo | undefined;
    splitInputParam: (nodeId: string, inputId: string) => void;
    splitOutputParam: (nodeId: string, outputId: string) => void;
    addType: (type: GraphType) => void;
    removeType: (id: string) => void;
    updateType: (type: GraphType) => void;
    addVariable: (variable: VariableConfig) => void;
    updateVariable: (variable: VariableConfig) => void;
}
