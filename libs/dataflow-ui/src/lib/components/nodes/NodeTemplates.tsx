import { NodeConfig, NodeType, ParameterTypes } from "@dataflow-ide/dataflow-core";
import registry from "./registry";
import FetchNode from "./fetch/FetchNode";
import MathNode from "./math/MathNode";
import IfNode from "./conditional/IfNode";
import GetVarNode from "./variables/GetVarNode";
import StartNode from "./special/StartNode";
import ReturnNode from "./special/ReturnNode";
import SequenceNode from "./sequence/SequenceNode";
import CompareNode from "./conditional/CompareNode";
import ForNode from "./loop/ForNode";
import ForeachNode from "./loop/ForeachNode";
import TypeDefNode from "./type/TypeDefNode";
import StringNode from "./string/StringNode";
import DebugVarNode from "./variables/DebugVarNode";
import NewVarNode from "./variables/NewVarNode";
import ArrayNode from "./array/ArrayNode";
import IONode from "./io/IONode";
import Node from "../core/Node";
import { LogicalNode } from "./logical/LogicalNode";
import { BitwiseNode } from "./bitwise/BitwiseNode";
import BreakTypeNode from "./type/BreakTypeNode";
import UpdateVarNode from "./variables/UpdateVarNode";

registry.set(NodeType.START, {
    builder: (node: NodeConfig) => <StartNode node={node} />,
    config: {
        type: NodeType.START,
        name: "Start",
        executable: true,
        position: {x: 100, y: 500}
    }
});

registry.set(NodeType.RETURN, {
    builder: (node: NodeConfig) => <ReturnNode node={node} />,
    config: {
        type: NodeType.RETURN,
        name: "Return",
        executable: true,
        position: {x: 800, y: 500}
    }
});

registry.set(NodeType.FETCH, {
    builder: (node: NodeConfig) => <FetchNode node={node} />,
    config: {
        type: NodeType.FETCH,
        name: "Fetch",
        executable: true,
        inputs: [
            {id: "url", name: "URL", type: ParameterTypes.STRING, required: false, editable: true, defaultValue: ''},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.MATH_ADD, {
    builder: (node: NodeConfig) => <MathNode node={node} />,
    config: {
        type: NodeType.MATH_ADD,
        name: "Add",
        executable: false,
        inputs: [
            {id: "num_a", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.MATH_SUB, {
    builder: (node: NodeConfig) => <MathNode node={node} />,
    config: {
        type: NodeType.MATH_SUB,
        name: "Subtract",
        executable: false,
        inputs: [
            {id: "num_a", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.MATH_MUL, {
    builder: (node: NodeConfig) => <MathNode node={node} />,
    config: {
        type: NodeType.MATH_MUL,
        name: "Multiply",
        executable: false,
        inputs: [
            {id: "num_a", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
            {id: "num_b", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.MATH_DIV, {
    builder: (node: NodeConfig) => <MathNode node={node} />,
    config: {
        type: NodeType.MATH_DIV,
        name: "Divide",
        executable: false,
        inputs: [
            {id: "num_a", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
            {id: "num_b", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.MATH_MOD, {
    builder: (node: NodeConfig) => <MathNode node={node} />,
    config: {
        type: NodeType.MATH_MOD,
        name: "Modulo",
        executable: false,
        inputs: [
            {id: "num_a", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.MATH_POW, {
    builder: (node: NodeConfig) => <MathNode node={node} inputMultiple={false} />,
    config: {
        type: NodeType.MATH_POW,
        name: "Power",
        executable: false,
        inputs: [
            {id: "base", name: "Base", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "exponent", name: "Exponent", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.MATH_SQRT, {
    builder: (node: NodeConfig) => <MathNode node={node} inputMultiple={false} />,
    config: {
        type: NodeType.MATH_SQRT,
        name: "Square Root",
        executable: false,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.SET, {
    builder: (node: NodeConfig) => <UpdateVarNode node={node} />,
    config: {
        type: NodeType.SET,
        name: "Set variable",
        executable: true,
        inputs: [
            {id: "value", name: "value", type: ParameterTypes.ANY, required: true, editable: false},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY}
        ]
    }
});

registry.set(NodeType.GET, {
    builder: (node: NodeConfig) => <GetVarNode node={node} />,
    config: {
        type: NodeType.GET,
        name: "Get variable",
        executable: false,
        outputs: [
            {id: "value", name: "value", type: ParameterTypes.ANY}
        ]
    }
});

registry.set(NodeType.COMPARE, {
    builder: (node: NodeConfig) => <CompareNode node={node} />,
    config: {
        type: NodeType.COMPARE,
        name: "Compare",
        executable: false,
        inputs: [
            {
                id: "A",
                name: "A",
                required: true,
                type: ParameterTypes.ANY,
                defaultValue: 0,
                editable: true
            },
            {
                id: "B",
                name: "B",
                required: false,
                type: ParameterTypes.ANY,
                defaultValue: 0,
                editable: true
            },
            {
                id: "A_EQ_B",
                name: "A == B",
                required: true,
                type: ParameterTypes.ANY,
                editable: false
            },
            {
                id: "A_NEQ_B",
                name: "A != B",
                required: true,
                type: ParameterTypes.ANY,
                editable: false
            },
            {
                id: "A_SUP_B",
                name: "A > B",
                required: true,
                type: ParameterTypes.ANY,
                editable: false
            },
            {
                id: "A_INF_B",
                name: "A < B",
                required: true,
                type: ParameterTypes.ANY,
                editable: false
            }
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY}
        ]
    }
});

registry.set(NodeType.IF, {
    builder: (node: NodeConfig) => <IfNode node={node} />,
    config: {
        executable: true,
        name: "If",
        type: NodeType.IF,
        inputs: [
            {id: "value", name: "value", type: ParameterTypes.BOOLEAN, editable: true, required: true, defaultValue: true}
        ],
        branches: [
            {id: "on_true", name: "onTrue"},
            {id: "on_false", name: "onFalse"}
        ]
    }
});

registry.set(NodeType.SEQUENCE, {
    builder: (node: NodeConfig) => <SequenceNode node={node} />,
    config: {
        executable: true,
        name: "Sequence",
        type: NodeType.SEQUENCE,
        branches: [
            {id: "then_1", name: "Then"},
            {id: "then_2", name: "Then"}
        ]
    }
});

registry.set(NodeType.FOR, {
    builder: (node: NodeConfig) => <ForNode node={node} />,
    config: {
        executable: true,
        name: "For",
        type: NodeType.FOR,
        inputs: [
            {id: "first", name: "First", type: ParameterTypes.NUMBER, required: true, defaultValue: 0, editable: true},
            {id: "last", name: "Last", type: ParameterTypes.NUMBER, required: true, defaultValue: 0, editable: true},
            {id: "inclusive", name: "Inclusive", type: ParameterTypes.BOOLEAN, required: false, defaultValue: false, editable: true},
        ],
        branches: [
            {id: "callback", name: "callback"}
        ],
        outputs: [
            {id: "index", name: "index", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.FOREACH, {
    builder: (node: NodeConfig) => <ForeachNode node={node} />,
    config: {
        executable: true,
        name: "Foreach",
        type: NodeType.FOREACH,
        inputs: [
            {id: "value", name: "value", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, defaultValue: []}
        ],
        outputs: [
            {id: "index", name: "index", type: ParameterTypes.ANY},
            {id: "item", name: "item", type: ParameterTypes.ANY}
        ],
        branches: [
            {id: "callback", name: "callback"}
        ]
    }
});

registry.set(NodeType.WHILE, {
    builder: (node: NodeConfig) => <ForNode node={node} />,
    config: {
        executable: true,
        name: "While",
        type: NodeType.WHILE,
        inputs: [
            {id: "condition", name: "Condition", type: ParameterTypes.BOOLEAN, required: false, editable: false, isCollection: false, defaultValue: false}
        ],
        outputs: [
        ],
        branches: [
            {id: "callback", name: "callback"}
        ]
    }
});

registry.set(NodeType.TYPEDEF, {
    builder: (node: NodeConfig) => <TypeDefNode node={node} />,
    config: {
        executable: false,
        name: "Define Type",
        type: NodeType.TYPEDEF,
    }
});

registry.set(NodeType.STRING_TRIM, {
    builder: (node: NodeConfig) => <StringNode node={node} />,
    config: {
        type: NodeType.STRING_TRIM,
        name: "Trim",
        executable: false,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""},
            {id: "left", name: "ltrim", type: ParameterTypes.BOOLEAN, required: true, editable: true, defaultValue: true},
            {id: "right", name: "rtrim", type: ParameterTypes.BOOLEAN, required: true, editable: true, defaultValue: true}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.STRING}
        ]
    }
});

registry.set(NodeType.STRING_CONCAT, {
    builder: (node: NodeConfig) => <StringNode node={node} inputMultiple={true} inputMultipleType={ParameterTypes.STRING} />,
    config: {
        type: NodeType.STRING_CONCAT,
        name: "Concatenate",
        executable: false,
        inputs: [
            {id: "value", name: "", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.STRING}
        ]
    }
});

registry.set(NodeType.STRING_SPLIT, {
    builder: (node: NodeConfig) => <StringNode node={node} />,
    config: {
        type: NodeType.STRING_SPLIT,
        name: "Split",
        executable: false,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""},
            {id: "separator", name: "Separator", type: ParameterTypes.STRING, required: false, editable: true, defaultValue: ""}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.STRING, isCollection: true}
        ]
    }
});

registry.set(NodeType.STRING_REPLACE, {
    builder: (node: NodeConfig) => <StringNode node={node} />,
    config: {
        type: NodeType.STRING_REPLACE,
        name: "Replace",
        executable: false,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""},
            {id: "search", name: "Search", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""},
            {id: "replace", name: "Replace", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""},
            {id: "all", name: "Replace all", type: ParameterTypes.BOOLEAN, required: false, editable: true, defaultValue: true},
            {id: "case_sensitive", name: "Case sensitive", type: ParameterTypes.BOOLEAN, required: false, editable: true, defaultValue: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.STRING}
        ]
    }
});

registry.set(NodeType.STRING_LENGTH, {
    builder: (node: NodeConfig) => <StringNode node={node} />,
    config: {
        type: NodeType.STRING_LENGTH,
        name: "Length",
        executable: false,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.STRING_TO_UPPER, {
    builder: (node: NodeConfig) => <StringNode node={node} />,
    config: {
        type: NodeType.STRING_TO_UPPER,
        name: "To Upper Case",
        executable: false,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.STRING}
        ]
    }
});

registry.set(NodeType.STRING_TO_LOWER, {
    builder: (node: NodeConfig) => <StringNode node={node} />,
    config: {
        type: NodeType.STRING_TO_LOWER,
        name: "To Lower Case",
        executable: false,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.STRING}
        ]
    }
});

registry.set(NodeType.DEBUG, {
    builder: (node: NodeConfig) => <DebugVarNode node={node} />,
    config: {
        type: NodeType.DEBUG,
        executable: true,
        name: "Debug",
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.ANY, required: true, editable: false}
        ]
    }
});

registry.set(NodeType.NEW, {
    builder: (node: NodeConfig) => <NewVarNode node={node} />,
    config: {
        type: NodeType.NEW,
        executable: true,
        name: "New variable",
        inputs: [
            {id: "defaultValue", name: "Default", type: ParameterTypes.ANY, required: false, editable: true},
        ],
        outputs: [
            {id: "result", name: "var", type: ParameterTypes.ANY}
        ]
    }
});

registry.set(NodeType.ARRAY_AT, {
    builder: (node: NodeConfig) => <ArrayNode node={node} />,
    config: {
        type: NodeType.ARRAY_AT,
        executable: false,
        name: "Array At",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
            {id: "index", name: "Index", type: ParameterTypes.NUMBER, required: true, editable: true}
        ],
        outputs: [
            {id: "result", name: "element", type: ParameterTypes.ANY}
        ]
    }
});

registry.set(NodeType.ARRAY_CONCAT, {
    builder: (node: NodeConfig) => <ArrayNode node={node} inputMultiple={true} minInputParams={2} />,
    config: {
        type: NodeType.ARRAY_CONCAT,
        executable: false,
        name: "Array Concat",
        inputs: [
            {id: "array_a", name: "A", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
            {id: "array_b", name: "B", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true}
        ]
    }
});

registry.set(NodeType.ARRAY_FILL, {
    builder: (node: NodeConfig) => <ArrayNode hasContinue={true} hasExecute={true} node={node} />,
    config: {
        type: NodeType.ARRAY_FILL,
        executable: true,
        name: "Array Fill",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
            {id: "value", name: "Value", type: ParameterTypes.ANY, required: true, editable: true},
            {id: "start", name: "Start", type: ParameterTypes.NUMBER, required: false, editable: true},
            {id: "end", name: "End", type: ParameterTypes.NUMBER, required: false, editable: true}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true}
        ]
    }
});

registry.set(NodeType.ARRAY_SHIFT, {
    builder: (node: NodeConfig) => <ArrayNode hasContinue={true} hasExecute={true} node={node} />,
    config: {
        type: NodeType.ARRAY_SHIFT,
        executable: true,
        name: "Array Shift",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true},
            {id: "element", name: "element", type: ParameterTypes.ANY}
        ]
    }
});

registry.set(NodeType.ARRAY_UNSHIFT, {
    builder: (node: NodeConfig) => <ArrayNode hasContinue={true} hasExecute={true} node={node} />,
    config: {
        type: NodeType.ARRAY_UNSHIFT,
        executable: true,
        name: "Array Unshift",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
            {id: "value", name: "Value", type: ParameterTypes.ANY, required: true, editable: true}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true},
            {id: "length", name: "length", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.ARRAY_SLICE, {
    builder: (node: NodeConfig) => <ArrayNode node={node} />,
    config: {
        type: NodeType.ARRAY_SLICE,
        executable: false,
        name: "Array Slice",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
            {id: "start", name: "Start", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "end", name: "End", type: ParameterTypes.NUMBER, required: false, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true},
        ]
    }
});

registry.set(NodeType.ARRAY_SPLICE, {
    builder: (node: NodeConfig) => <ArrayNode hasContinue={true} hasExecute={true} node={node} />,
    config: {
        type: NodeType.ARRAY_SPLICE,
        executable: true,
        name: "Array Splice",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
            {id: "start", name: "Start", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "count", name: "Count", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true},
            {id: "removed", name: "removed", type: ParameterTypes.ANY, isCollection: true},
        ]
    }
});

registry.set(NodeType.ARRAY_POP, {
    builder: (node: NodeConfig) => <ArrayNode hasContinue={true} hasExecute={true} node={node} />,
    config: {
        type: NodeType.ARRAY_POP,
        executable: true,
        name: "Array Pop",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true},
            {id: "removed", name: "removed", type: ParameterTypes.ANY, isCollection: false},
        ]
    }
});

registry.set(NodeType.ARRAY_PUSH, {
    builder: (node: NodeConfig) => <ArrayNode hasContinue={true} hasExecute={true} node={node} />,
    config: {
        type: NodeType.ARRAY_PUSH,
        executable: true,
        name: "Array Push",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
            {id: "value", name: "Value", type: ParameterTypes.ANY, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true},
        ]
    }
});

registry.set(NodeType.ARRAY_REVERSE, {
    builder: (node: NodeConfig) => <ArrayNode node={node} />,
    config: {
        type: NodeType.ARRAY_REVERSE,
        executable: false,
        name: "Array Reverse",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true, typeEditable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.ANY, isCollection: true},
        ]
    }
});

registry.set(NodeType.ARRAY_LENGTH, {
    builder: (node: NodeConfig) => <ArrayNode node={node} />,
    config: {
        type: NodeType.ARRAY_LENGTH,
        executable: false,
        name: "Array Length",
        inputs: [
            {id: "array", name: "Array", type: ParameterTypes.ANY, required: true, editable: false, isCollection: true},
        ],
        outputs: [
            {id: "result", name: "length", type: ParameterTypes.NUMBER, isCollection: false},
        ]
    }
});

registry.set(NodeType.IO_WRITE, {
    builder: (node: NodeConfig) => <IONode node={node}/>,
    config: {
        type: NodeType.IO_WRITE,
        executable: true,
        name: "IO Write",
        inputs: [
            {id: "fd", name: "FD", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
            {id: "content", name: "Content", type: ParameterTypes.STRING, required: true, editable: true}
        ],
        outputs: [
            {id: "bytes_written", name: "Bytes written", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.DELAY, {
    builder: (node: NodeConfig) => <Node node={node} hasContinue={true} hasExecute={true} size={{width: 200, height: 100}} />,
    config: {
        type: NodeType.DELAY,
        executable: true,
        name: "Delay",
        inputs: [
            {id: "delay", name: "Time in ms", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0}
        ],
        outputs: [
            {id: "awaited", name: "Awaited", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.BITWISE_AND, {
    builder: (node: NodeConfig) => <BitwiseNode node={node} />,
    config: {
        type: NodeType.BITWISE_AND,
        executable: false,
        name: "AND",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "input_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.BITWISE_OR, {
    builder: (node: NodeConfig) => <BitwiseNode node={node} />,
    config: {
        type: NodeType.BITWISE_OR,
        executable: false,
        name: "OR",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "input_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.BITWISE_XOR, {
    builder: (node: NodeConfig) => <BitwiseNode node={node} />,
    config: {
        type: NodeType.BITWISE_XOR,
        executable: false,
        name: "XOR",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "input_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.BITWISE_NOT, {
    builder: (node: NodeConfig) => <BitwiseNode node={node} />,
    config: {
        type: NodeType.BITWISE_NOT,
        executable: false,
        name: "NOT",
        inputs: [
            {id: "input", name: "number", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.BITWISE_LSHIFT, {
    builder: (node: NodeConfig) => <BitwiseNode node={node} />,
    config: {
        type: NodeType.BITWISE_LSHIFT,
        executable: false,
        name: "LSHIFT",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "input_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.BITWISE_RSHIFT, {
    builder: (node: NodeConfig) => <BitwiseNode node={node} />,
    config: {
        type: NodeType.BITWISE_RSHIFT,
        executable: false,
        name: "RSHIFT",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "input_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.BITWISE_URSHIFT, {
    builder: (node: NodeConfig) => <BitwiseNode node={node} />,
    config: {
        type: NodeType.BITWISE_URSHIFT,
        executable: false,
        name: "URSHIFT",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true},
            {id: "input_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.NUMBER}
        ]
    }
});

registry.set(NodeType.LOGICAL_AND, {
    builder: (node: NodeConfig) => <LogicalNode node={node} inputMultiple={true} minInputParams={2} inputMultipleType={ParameterTypes.ANY} />,
    config: {
        type: NodeType.LOGICAL_AND,
        executable: false,
        name: "Operator &&",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.ANY, required: true, editable: false},
            {id: "input_b", name: "B", type: ParameterTypes.ANY, required: true, editable: false},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.BOOLEAN}
        ]
    }
});

registry.set(NodeType.LOGICAL_OR, {
    builder: (node: NodeConfig) => <LogicalNode node={node} inputMultiple={true} minInputParams={2} inputMultipleType={ParameterTypes.ANY} />,
    config: {
        type: NodeType.LOGICAL_OR,
        executable: false,
        name: "Operator ||",
        inputs: [
            {id: "input_a", name: "A", type: ParameterTypes.ANY, required: true, editable: false},
            {id: "input_b", name: "B", type: ParameterTypes.ANY, required: true, editable: false},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.BOOLEAN}
        ]
    }
});

registry.set(NodeType.LOGICAL_NOT, {
    builder: (node: NodeConfig) => <LogicalNode node={node} />,
    config: {
        type: NodeType.LOGICAL_NOT,
        executable: false,
        name: "Operator !",
        inputs: [
            {id: "input", name: "value", type: ParameterTypes.ANY, required: true, editable: false},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.BOOLEAN}
        ]
    }
});

registry.set(NodeType.BREAK_TYPE, {
    builder: node => <BreakTypeNode node={node} />,
    config: {
        type: NodeType.BREAK_TYPE,
        executable: false,
        name: "Break Type",
        inputs: [
            {id: "value", name: "value", type: ParameterTypes.ANY, required: true, editable: false}
        ],
        outputs: [
            {id: "result", name: "value", type: ParameterTypes.ANY}
        ]
    }
});
