import { NodeType } from "@/dataflow/config/schema";
import registry, { NodeExecParams, NodeExecutor } from "../registry";

const handleLogicalAnd: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    let result = true;

    for (const [, value] of inputs.entries()) {
        if (!value) {
            result = false;
            break;
        }
    }

    return new Map().set('result', result);
}

const handleLogicalOr: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    let result = false;

    for (const [, value] of inputs.entries()) {
        if (value) {
            result = true;
            break;
        }
    }

    return new Map().set('result', result);
}

const handleLogicalNot: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const input = inputs.get('input');

    return new Map().set('result', !input);
}

registry.set(NodeType.LOGICAL_AND, handleLogicalAnd);
registry.set(NodeType.LOGICAL_OR, handleLogicalOr);
registry.set(NodeType.LOGICAL_NOT, handleLogicalNot);
