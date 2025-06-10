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
    SET = "set_variable",
    GET = "get_variable",
    DEBUG = "debug_variable",
    SEQUENCE = "sequence",

    TYPEDEF = "typedef",
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
    defaultValue?: any;
    editable?: boolean;
    isCollection?: boolean;
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

type ParameterValueType = any;

export { NodeType, ParameterTypes, parseAppConfig };
export type { GraphType, TypeDefinition, TypeProperty, AppConfig, NodeConfig, InputConfig, OutputConfig, ConnectorConfig, ConnectionConfig, Coordinates, ParameterValueType, OutputBranchConfig, VariableConfig, ParameterType };
