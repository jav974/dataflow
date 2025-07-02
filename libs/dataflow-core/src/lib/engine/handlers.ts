import { NodeType, ParameterTypes, ParameterValueType } from "../config/schema";
import registry, { NodeExecContext, NodeExecParams, NodeExecutor } from "./registry";
import { isNumeric, math_add, math_div, math_mod, math_mul, math_sub } from "./lib";
import executionContext, { KeyValue } from "./context";
import "./handlers/array";
import "./handlers/bitwise";
import "./handlers/logical";
import { eventBus } from "../events/events";
import { Log } from "./types";
import { appendResult, createVariable, getValueByPath, setValueByPath } from "./utils";

type SimpleMathContext = Map<string, (...numbers: number[]) => number>;

function toFloat(value: ParameterValueType): number {
    return parseFloat(value?.toString() ?? '0');
}

function toFloats(params: NodeExecParams): number[] {
    return Array.from(params.values()).map(toFloat);
}

const dummyExecutor: NodeExecutor = async (): Promise<NodeExecParams> => {
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

const handleMathPow: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const base = toFloat(inputs.get('base'));
    const exponent = toFloat(inputs.get('exponent'));
    const power = Math.pow(base, exponent);

    result.set('result', power);

    return result;
};

const handleMathSqrt: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = toFloat(inputs.get('value'));
    const sqrt = Math.sqrt(value);

    result.set('result', sqrt);

    return result;
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
    const inputMap: Map<string, string> = context.get('_inputMap');
    const varName = context.get('var') as string;
    const nodeId = context.get('_node_id') as string;
    let value: unknown;

    if (inputMap.size === 1) {
        value = inputs.get('value');
    } else if (inputMap.size > 1) {
        const res: KeyValue = {};

        for (const [key, _path] of inputMap) {
            const path = _path.replace(/^value\./, "");
            const inputValue = inputs.get(key);

            setValueByPath(res, path, inputValue);
        }

        value = res;
    }

    executionContext.variables[nodeId] = value;
    executionContext.variables[varName] = value;

    return appendResult('result', value, context, 'result');
}

const handleGetVar: NodeExecutor = async (_: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const value = executionContext.variables[context.get('var')];

    return appendResult('value', value, context, 'value');
};

const handleNewVar: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const value = inputs.get('default');
    let defaultValue: unknown;

    // Use provided value
    if (value !== null && value !== undefined) {
        defaultValue = value;
    } else {
        if (context.get('_isCollection')) {
            defaultValue = [];
        } else {
            const type = context.get('_type');

            switch (type) {
                case ParameterTypes.BOOLEAN:
                    defaultValue = false;
                    break ;
                case ParameterTypes.NUMBER:
                    defaultValue = 0;
                    break ;
                case ParameterTypes.STRING:
                    defaultValue = '';
                    break ;
                default:
                    defaultValue = createVariable(type, inputs, 'default');
                    break ;
            }
        }
    }

    executionContext.variables[context.get('_node_id')] = defaultValue;

    return appendResult('result', defaultValue, context, 'var');
}

const handleStart: NodeExecutor = async (_: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
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

    // TODO: Duplicating values is wild, but a return node with named outputs
    // replaced by their uuid is wild too as it will mean nothing to the end user.
    for (const [key, value] of inputs) {
        const varName = context.get('_inputMap').get(key) ?? key;
        executionContext.result[key] = value;
        executionContext.result[varName] = value;
    }

    return new Map();
};

const handleIf: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const value = inputs.get('value');

    return (new Map()).set('branch', value ? 'on_true' : 'on_false');
};

const handleFor: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    return (new Map()).set('index', Number(inputs.get('first')));
};

const handleForeach: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    return appendResult('item', inputs.get('item'), context, 'item')
        .set('index', inputs.get('index'));
};

const handleStringTrim: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = inputs.get('value')?.toString() ?? '';
    const ltrim = inputs.has('left') ? inputs.get('left') as boolean : true;
    const rtrim = inputs.has('right') ? inputs.get('right') as boolean : true;

    result.set('result', value);

    if (ltrim && rtrim) {
        result.set('result', value.trim());
    } else if (ltrim) {
        result.set('result', value.replace(/^\s+/, ''));
    } else if (rtrim) {
        result.set('result', value.replace(/\s+$/, ''));
    }

    return result;
};

const handleStringConcat: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const values = Array.from(inputs.values()).map(v => v?.toString() ?? '');
    const concatenated = values.join('');

    result.set('result', concatenated);

    return result;
};

const handleStringSplit: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = (inputs.get('value')?.toString() ?? '') as string;
    const separator = inputs.get('separator')?.toString() ?? '';
    const parts = value.split(separator);

    result.set('result', parts);

    return result;
};

const handleStringReplace: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = inputs.get('value')?.toString() ?? '';
    const search = inputs.get('search')?.toString() ?? '';
    const replace = inputs.get('replace')?.toString() ?? '';
    const all = inputs.get('all') ?? true;
    const caseSensitive = inputs.get('case_sensitive') ?? true;
    let flags = all ? 'g' : '';
    flags += caseSensitive ? '' : 'i';
    const replaced = value.replace(new RegExp(search, flags), replace);

    result.set('result', replaced);

    return result;
};

const handleStringLength: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = inputs.get('value')?.toString() ?? '';
    
    result.set('result', value.length);
    
    return result;
};

const handleStringToUpper: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = inputs.get('value')?.toString() ?? '';
    result.set('result', value.toUpperCase());
    return result;
};

const handleStringToLower: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const value = inputs.get('value')?.toString() ?? '';
    result.set('result', value.toLowerCase());
    return result;
};

const handleIOWrite: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const fd = inputs.get('fd') as number;
    const content = inputs.get('content') as string;
    let type = "log";
    
    if (fd === 1) {
        type = "log";
    } else if (fd === 2) {
        type = "error";
    } else if (fd === 3) {
        type = "warn";
    } else if (fd === 4) {
        type = "debug";
    }

    // TODO: Really handle fd server side

    // Emit an event for client display
    const clientSocketId = context.get('_clientSocketId');
    const eventName = !clientSocketId ? 'io_write' : 'io_write_' + clientSocketId;

    eventBus.emit<Log>(eventName, {
        type,
        createdAt: Date.now(),
        message: content
    } as Log);

    result.set('bytes_written', content.length);
    return result;
};

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const handleDelay: NodeExecutor = async (inputs: NodeExecParams): Promise<NodeExecParams> => {
    const result: NodeExecParams = new Map();
    const delay = inputs.get('delay') as number;

    const before = Date.now();
    await sleep(delay);
    const after = Date.now();

    return result.set('awaited', after - before);
}

const handleBreakType: NodeExecutor = async (inputs: NodeExecParams, context: NodeExecContext): Promise<NodeExecParams> => {
    const input = inputs.get('value');
    const result: NodeExecParams = new Map();

    for (const [key, value] of context.get('_outputMap')) {
        result.set(key, getValueByPath(input, value));
    }

    return result;
}

registry.set(NodeType.DEBUG, dummyExecutor);
registry.set(NodeType.START, handleStart);
registry.set(NodeType.RETURN, handleReturn);

registry.set(NodeType.MATH_ADD, handleMathAdd);
registry.set(NodeType.MATH_SUB, handleMathSub);
registry.set(NodeType.MATH_MUL, handleMathMul);
registry.set(NodeType.MATH_DIV, handleMathDiv);
registry.set(NodeType.MATH_MOD, handleMathMod);
registry.set(NodeType.MATH_POW, handleMathPow);
registry.set(NodeType.MATH_SQRT, handleMathSqrt);

registry.set(NodeType.COMPARE, handleCompare);
registry.set(NodeType.IF, handleIf);
registry.set(NodeType.FOR, handleFor);
registry.set(NodeType.FOREACH, handleForeach);

registry.set(NodeType.SET, handleSetVar);
registry.set(NodeType.GET, handleGetVar);
registry.set(NodeType.NEW, handleNewVar);

registry.set(NodeType.SEQUENCE, dummyExecutor);

registry.set(NodeType.STRING_TRIM, handleStringTrim);
registry.set(NodeType.STRING_CONCAT, handleStringConcat);
registry.set(NodeType.STRING_SPLIT, handleStringSplit);
registry.set(NodeType.STRING_REPLACE, handleStringReplace);
registry.set(NodeType.STRING_LENGTH, handleStringLength);
registry.set(NodeType.STRING_TO_UPPER, handleStringToUpper);
registry.set(NodeType.STRING_TO_LOWER, handleStringToLower);

registry.set(NodeType.IO_WRITE, handleIOWrite);
registry.set(NodeType.DELAY, handleDelay);

registry.set(NodeType.BREAK_TYPE, handleBreakType);