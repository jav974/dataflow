import { NodeType, ParameterValueType } from "@/dataflow/config/schema";
import registry, { NodeExecContext, NodeExecParams, NodeExecutor } from "./registry";
import { isNumeric, math_add, math_div, math_mod, math_mul, math_sub } from "./lib";
import executionContext from "./context";

type SimpleMathContext = Map<string, (...numbers: number[]) => number>;

function toFloat(value: ParameterValueType): number {
    return parseFloat(value?.toString() ?? '0');
}

function toFloats(params: NodeExecParams): number[] {
    return Array.from(params.values()).map(toFloat);
}

const dummyExecutor: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    return new Map();
}

const handleSimpleMath: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const _inputs = toFloats(inputs);
    
    result.set('result', context.get('callback')(..._inputs));

    return result;
}

const handleMathAdd: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const context: SimpleMathContext = new Map();
    context.set('callback', math_add);
    return handleSimpleMath(inputs, context);
};

const handleMathSub: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const context: SimpleMathContext = new Map();
    context.set('callback', math_sub);
    return handleSimpleMath(inputs, context);
};

const handleMathMul: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const context: SimpleMathContext = new Map();
    context.set('callback', math_mul);
    return handleSimpleMath(inputs, context);
};

const handleMathDiv: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const context: SimpleMathContext = new Map();
    context.set('callback', math_div);
    return handleSimpleMath(inputs, context);
};

const handleMathMod: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const context: SimpleMathContext = new Map();
    context.set('callback', math_mod);
    return handleSimpleMath(inputs, context);
};

const handleCompare: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const A = inputs.get('A');
    const B = inputs.get('B');
    const A_EQ_B = inputs.get('A_EQ_B');
    const A_NEQ_B = inputs.get('A_NEQ_B');
    const A_SUP_B = inputs.get('A_SUP_B');
    const A_INF_B = inputs.get('A_INF_B');

    if (A == B || ((A === undefined || A === null) && (B as string) === '')) {
        result.set('result', A_EQ_B);
    } else if (isNumeric(A) && isNumeric(B) && Number(A) > Number(B)) {
        result.set('result', A_SUP_B !== undefined ? A_SUP_B : A_NEQ_B);
    } else if (isNumeric(A) && isNumeric(B) && Number(A) < Number(B)) {
        result.set('result', A_INF_B !== undefined ? A_INF_B : A_NEQ_B);
    } else {
        result.set('result', A_NEQ_B);
    }

    return result;
};

const handleSetVar: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = inputs.get('value');

    result.set('result', value);
    executionContext.variables[context.get('_node_id')] = value;

    return result;
}

const handleGetVar: NodeExecutor = async (_: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = executionContext.variables[context.get('var')];

    result.set('value', value);

    return result;
};

const handleStart: NodeExecutor = async (_: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const result: Map<string, any> = new Map();
    executionContext.variables = {};
    executionContext.result = {};

    for (const [key, value] of context) {
        if (key !== '_node_id') {
            result.set(key, value);
            executionContext.variables[key] = value;
        }
    }

    return result;
};

const handleReturn: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    executionContext.result = {};

    for (const [key, value] of inputs) {
        executionContext.result[key] = value;
    }

    return new Map();
};

const handleIf: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const value = inputs.get('value');

    return (new Map()).set('branch', value ? 'on_true' : 'on_false');
};

const handleFor: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    return (new Map()).set('index', Number(inputs.get('first')));
};

const handleForeach: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    return (new Map()).set('index', undefined).set('item', undefined);
};

registry.set(NodeType.START, handleStart);
registry.set(NodeType.RETURN, handleReturn);

registry.set(NodeType.MATH_ADD, handleMathAdd);
registry.set(NodeType.MATH_SUB, handleMathSub);
registry.set(NodeType.MATH_MUL, handleMathMul);
registry.set(NodeType.MATH_DIV, handleMathDiv);
registry.set(NodeType.MATH_MOD, handleMathMod);

registry.set(NodeType.COMPARE, handleCompare);
registry.set(NodeType.IF, handleIf);
registry.set(NodeType.FOR, handleFor);
registry.set(NodeType.FOREACH, handleForeach);

registry.set(NodeType.SET, handleSetVar);
registry.set(NodeType.GET, handleGetVar);

registry.set(NodeType.SEQUENCE, dummyExecutor);
