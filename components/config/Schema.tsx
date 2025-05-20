enum NodeType {
    START = "start",
    RETURN = "return",
    TRIGGER = "trigger",

    FETCH = "fetch",

    MATH_ADD = "add",
    MATH_SUB = "sub",
    MATH_MUL = "mul",
    MATH_DIV = "div",
    MATH_MOD = "mod",
    MATH_SQRT = "sqrt",
    MATH_POW = "pow",

    STRING_CONCAT = "concat",
    STRING_TRIM = "trim",
    STRING_LTRIM = "ltrim",
    STRING_RTRIM = "rtrim",

    CONDITIONAL_IF = "conditional_if",
    SET = "set_variable",
    GET = "get_variable",
}

enum ParameterType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    ANY = "any"
}

interface AppConfig {
    name: string;
    nodes: NodeConfig[];
    connections?: ConnectionConfig[];
    zoom?: number;
    // JSON.stringify() of a Map<string, string>
    variables?: string;
}

interface Coordinates {
    x: number;
    y: number;
}

interface NodeConfig {
    id: string;
    name: string;
    executable: boolean;
    description?: string;
    type: NodeType;
    inputs?: InputConfig[];
    outputs?: OutputConfig[];
    position: Coordinates;
    // JSON.stringify() of a Map<string, any>
    context?: string;
}

interface ConnectorConfig {
    id: string;
    pin: string;
}

interface ConnectionConfig {
    from: ConnectorConfig;
    to: ConnectorConfig;
}

interface InputConfig {
    id: string;
    name: string;
    type: ParameterType;
    required: boolean;
    defaultValue?: any;
    editable?: boolean;
}

interface OutputConfig {
    id: string;
    name: string;
    type: ParameterType;
}

function parseAppConfig(config: string): AppConfig {
    const parsedConfig = JSON.parse(config);
    return parsedConfig;
}

type ParameterValueType = string | number | undefined | null;

export { NodeType, ParameterType };
export type { AppConfig, NodeConfig, InputConfig, OutputConfig, ConnectorConfig, ConnectionConfig, Coordinates, ParameterValueType };
export { parseAppConfig };
