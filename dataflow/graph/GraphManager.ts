import { AppConfig, ConnectionConfig, ConnectorConfig, InputConfig, NodeConfig, OutputBranchConfig, OutputConfig } from "../config/schema";

type PartialWithRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type PartialNodeConfig = PartialWithRequired<NodeConfig, 'id'>;
type PartialInputConfig = PartialWithRequired<InputConfig, 'id'>;
type PartialOutputConfig = PartialWithRequired<OutputConfig, 'id'>;

interface GraphManager {
    addNode: (node: NodeConfig) => void;
    updateNode: (node: PartialNodeConfig) => void;
    removeNode: (nodeId: string) => void;
    removeNodes: (nodeIds: string[]) => void;
    addNodeInput: (nodeId: string, input: InputConfig) => void;
    updateNodeInput: (nodeId: string, input: PartialInputConfig) => void;
    removeNodeInput: (nodeId: string, inputId: string) => void;
    setNodeInputs: (nodeId: string, inputs: InputConfig[]) => void;
    setInputDefaultValue: (nodeId: string, inputId: string, value: any) => void;
    addNodeOutput: (nodeId: string, output: OutputConfig) => void;
    updateNodeOutput: (nodeId: string, output: PartialOutputConfig) => void;
    removeNodeOutput: (nodeId: string, outputId: string) => void;
    setNodeOutputs: (nodeId: string, outputs: OutputConfig[]) => void;
    addNodeBranch: (nodeId: string, branch: OutputBranchConfig) => void;
    removeNodeBranch: (nodeId: string, branchId: string) => void;
    setNodeBranches: (nodeId: string, branches: OutputBranchConfig[]) => void;
    addConnection: (connection: ConnectionConfig) => void;
    removeConnections: (from?: ConnectorConfig, to?: ConnectorConfig) => void;
    loadGraph: (graph: AppConfig) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setVariable: (id: string, name: string, type: string, isCollection: boolean) => void;
    removeVariable: (id: string) => void;
    setNodeContext: (nodeId: string, context: Map<string, any>) => void;
    setOutputName: (nodeId: string, outputId: string, name: string) => void;
    setInputName: (nodeId: string, inputId: string, name: string) => void;
}

export type { PartialWithRequired, PartialNodeConfig, PartialInputConfig, PartialOutputConfig }
export default GraphManager;
