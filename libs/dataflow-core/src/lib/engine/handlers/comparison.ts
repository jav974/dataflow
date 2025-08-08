import { NodeType } from "../../config/schema";
import registry, { NodeExecParams, NodeExecutor } from "../registry";

const handleCompareEqual: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const left: unknown = inputs.get('left');
    const right: unknown = inputs.get('right');

    return new Map().set('result', left == right);
};

const handleCompareNotEqual: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const left: unknown = inputs.get('left');
    const right: unknown = inputs.get('right');

    return new Map().set('result', left != right);
};

const handleCompareGreaterThan: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const left: number = inputs.get('left');
    const right: number = inputs.get('right');

    return new Map().set('result', left > right);
};

const handleCompareLessThan: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const left: number = inputs.get('left');
    const right: number = inputs.get('right');

    return new Map().set('result', left < right);
};

const handleCompareGreaterThanOrEqual: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const left: number = inputs.get('left');
    const right: number = inputs.get('right');

    return new Map().set('result', left >= right);
};

const handleCompareLessThanOrEqual: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const left: number = inputs.get('left');
    const right: number = inputs.get('right');

    return new Map().set('result', left <= right);
};

registry.set(NodeType.COMPARE_EQUAL, handleCompareEqual);
registry.set(NodeType.COMPARE_NOT_EQUAL, handleCompareNotEqual);
registry.set(NodeType.COMPARE_GREATER_THAN, handleCompareGreaterThan);
registry.set(NodeType.COMPARE_LESS_THAN, handleCompareLessThan);
registry.set(NodeType.COMPARE_GREATER_THAN_OR_EQUAL, handleCompareGreaterThanOrEqual);
registry.set(NodeType.COMPARE_LESS_THAN_OR_EQUAL, handleCompareLessThanOrEqual);