import { NodeType, ParameterValueType } from "@dataflow-core/config/schema";

type NodeExecParams = Map<string, ParameterValueType>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodeExecContext = Map<string, any>;
type NodeExecutor = (inputs: NodeExecParams, context: NodeExecContext) => Promise<NodeExecParams>;

const registry: Map<NodeType, NodeExecutor> = new Map();

export default registry;
export type { NodeExecParams, NodeExecContext, NodeExecutor };
