import { AppConfig, ConnectorConfig, NodeType, ParameterType, ParameterValueType } from "@/dataflow/config/schema";
import { KeyValue } from "./context";

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
    inputs: ExecutionInput[];
    outputs: ExecutionOutput[];
    branches: ExecutionBranch[];
    next: ExecutionGraph | null;
    visited: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Map<string, any>;
    pos: number;
}

export interface GraphResult {
    graph?: ExecutionGraph;
    result: KeyValue;
    io_values: KeyValue;
}

export type LogLevel = "warn" | "error" | "debug" | "log";

export interface Log {
    message: string;
    type: LogLevel;
    createdAt: number;
}

export type GraphExecutor = (graph: AppConfig, params?: KeyValue) => Promise<GraphResult | undefined>;
