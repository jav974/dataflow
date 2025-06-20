import { NodeType } from "@/dataflow/config/schema";
import registry, { NodeExecContext, NodeExecParams, NodeExecutor } from "../registry";
import { appendResult } from "../utils";

const handleArrayAt: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const index: number = inputs.get('index') ?? 0;

    return appendResult('result', array[index], context, 'element');
}

const handleArrayConcat: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const arrays: never[][] = Array.from(inputs.values());

    return new Map().set('result', [].concat(...arrays));
}

const handleArrayFill: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const value: unknown = inputs.get('value');
    const start: number | undefined = inputs.get('start');
    const end: number | undefined = inputs.get('end');

    if (end) {
        if (array.length < end) {
            for (let i = array.length; i < end; i++) {
                array.push(value);
            }
        }
    }

    return new Map().set('result', array.fill(value, start, end));
}

const handleArrayShift: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const firstElement = array.shift();
    const result: NodeExecParams = new Map();

    result.set('result', array);
    
    return appendResult('element', firstElement, context, 'element', result);
};

const handleArrayUnshift: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const value: unknown = inputs.get('value');
    const length = array.unshift(value);

    return new Map().set('result', array).set('length', length);
};

const handleArraySlice: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const start: number = inputs.get('start');
    const end: number = inputs.get('end');
    const slice = array.slice(start, end);

    return new Map().set('result', slice);
};

const handleArraySplice: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const start: number = inputs.get('start');
    const count: number = inputs.get('count');
    const removed = array.splice(start, count);
    const result: NodeExecParams = new Map();

    result.set('result', array);

    return appendResult('removed', removed, context, 'removed', result);
};

const handleArrayPop: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const removed = array.pop();
    const result: NodeExecParams = new Map();

    result.set('result', array);

    return appendResult('removed', removed, context, 'removed', result);
};

const handleArrayPush: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');
    const value: unknown = inputs.get('value');
    const length = array.push(value);

    return new Map().set('result', array).set('length', length);
};

const handleArrayReverse: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');

    return new Map().set('result', array.reverse());
};

const handleArrayLength: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const array: unknown[] = inputs.get('array');

    return new Map().set('result', array.length);
};

registry.set(NodeType.ARRAY_AT, handleArrayAt);
registry.set(NodeType.ARRAY_CONCAT, handleArrayConcat);
registry.set(NodeType.ARRAY_FILL, handleArrayFill);
registry.set(NodeType.ARRAY_SHIFT, handleArrayShift);
registry.set(NodeType.ARRAY_UNSHIFT, handleArrayUnshift);
registry.set(NodeType.ARRAY_SLICE, handleArraySlice);
registry.set(NodeType.ARRAY_SPLICE, handleArraySplice);
registry.set(NodeType.ARRAY_POP, handleArrayPop);
registry.set(NodeType.ARRAY_PUSH, handleArrayPush);
registry.set(NodeType.ARRAY_REVERSE, handleArrayReverse);
registry.set(NodeType.ARRAY_LENGTH, handleArrayLength);
