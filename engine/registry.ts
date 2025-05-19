import { NodeType, ParameterValueType } from "@/components/config/Schema";

type NodeExecParams = Map<string, ParameterValueType>;
type NodeExecContext = Map<string, any>;
type NodeExecutor = (inputs: NodeExecParams, context?: NodeExecContext) => NodeExecParams;

const registry: Map<NodeType, NodeExecutor> = new Map();

export default registry;
export type { NodeExecParams, NodeExecContext, NodeExecutor };
