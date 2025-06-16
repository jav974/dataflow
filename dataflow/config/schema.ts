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
    STRING_SPLIT = "split",
    STRING_REPLACE = "replace",
    STRING_LENGTH = "length",
    STRING_TO_UPPER = "to_upper",
    STRING_TO_LOWER = "to_lower",

    COMPARE = "compare",
    IF = "if",
    FOR = "for",
    FOREACH = "foreach",
    NEW = "new_variable",
    SET = "set_variable",
    GET = "get_variable",
    DEBUG = "debug_variable",
    SEQUENCE = "sequence",

    TYPEDEF = "typedef",

    ARRAY_AT = "array_at",
    ARRAY_CONCAT = "array_concat",
    ARRAY_FILL = "array_fill",
    ARRAY_FILTER = "array_filter",
    ARRAY_FIND = "array_find",
    ARRAY_FINDINDEX = "array_findindex",
    ARRAY_MAP = "array_map",
    ARRAY_SHIFT = "array_shift",
    ARRAY_UNSHIFT = "array_unshift",
    ARRAY_SLICE = "array_slice",
    ARRAY_POP = "array_pop",
    ARRAY_PUSH = "array_push",
    ARRAY_SPLICE = "array_splice",
    ARRAY_REVERSE = "array_reverse",
    ARRAY_LENGTH = "array_length",

    IO_WRITE = "io_write",
    IO_READ = "io_read",
    DELAY = "delay"
}

enum ParameterTypes {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    ANY = "any"
}

type ParameterType = ParameterTypes | string;

interface TypeProperty {
    id: string;
    name: string;
    type: string;
    isCollection: boolean;
}

interface TypeDefinition {
    id: string;
    name: string;
    properties: TypeProperty[]
}

interface GraphType extends TypeDefinition {
    id: string;
}

interface VariableConfig {
    id: string;
    name: string;
    type: string;
    isCollection: boolean;
}

interface AppConfig {
    name: string;
    nodes: NodeConfig[];
    connections?: ConnectionConfig[];
    variables: VariableConfig[];
    types?: GraphType[];
    zoom?: number;
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
    branches?: OutputBranchConfig[];
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
    defaultValue?: unknown;
    editable?: boolean;
    isCollection?: boolean;
    typeEditable?: boolean;
    collectionEditable?: boolean;
}

interface OutputConfig {
    id: string;
    name: string;
    type: ParameterType;
    isCollection?: boolean;
}

interface OutputBranchConfig {
    id: string;
    name: string;
}

function parseAppConfig(config: string): AppConfig {
    const parsedConfig = JSON.parse(config);
    return parsedConfig;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParameterValueType = any;

export { NodeType, ParameterTypes, parseAppConfig };
export type { GraphType, TypeDefinition, TypeProperty, AppConfig, NodeConfig, InputConfig, OutputConfig, ConnectorConfig, ConnectionConfig, Coordinates, ParameterValueType, OutputBranchConfig, VariableConfig, ParameterType };
