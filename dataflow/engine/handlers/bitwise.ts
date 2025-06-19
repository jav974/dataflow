import { NodeType } from "@/dataflow/config/schema";
import registry, { NodeExecParams, NodeExecutor } from "../registry";

const handleBitwiseAnd: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const inputA = inputs.get('input_a') as number;
    const inputB = inputs.get('input_b') as number;

    return new Map().set('result', inputA & inputB);
}

const handleBitwiseOr: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const inputA = inputs.get('input_a') as number;
    const inputB = inputs.get('input_b') as number;

    return new Map().set('result', inputA | inputB);
}

const handleBitwiseXor: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const inputA = inputs.get('input_a') as number;
    const inputB = inputs.get('input_b') as number;

    return new Map().set('result', inputA ^ inputB);
}

const handleBitwiseNot: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const input = inputs.get('input') as number;

    return new Map().set('result', ~input);
}

const handleBitwiseLshift: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const inputA = inputs.get('input_a') as number;
    const inputB = inputs.get('input_b') as number;

    return new Map().set('result', inputA << inputB);
}

const handleBitwiseRshift: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const inputA = inputs.get('input_a') as number;
    const inputB = inputs.get('input_b') as number;

    return new Map().set('result', inputA >> inputB);
}

const handleBitwiseUrshift: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const inputA = inputs.get('input_a') as number;
    const inputB = inputs.get('input_b') as number;

    return new Map().set('result', inputA >>> inputB);
}

registry.set(NodeType.BITWISE_AND, handleBitwiseAnd);
registry.set(NodeType.BITWISE_OR, handleBitwiseOr);
registry.set(NodeType.BITWISE_XOR, handleBitwiseXor);
registry.set(NodeType.BITWISE_NOT, handleBitwiseNot);
registry.set(NodeType.BITWISE_LSHIFT, handleBitwiseLshift);
registry.set(NodeType.BITWISE_RSHIFT, handleBitwiseRshift);
registry.set(NodeType.BITWISE_URSHIFT, handleBitwiseUrshift);
