import { NodeConfig, NodeType, ParameterTypes } from "../../config/schema";
import registry from "./registry";
import FetchNode from "./fetch/FetchNode";
import MathNode from "./math/MathNode";
import SetVarNode from "./variables/SetVarNode";
import IfNode from "./conditional/IfNode";
import GetVarNode from "./variables/GetVarNode";
import { jsonToMap } from "@/dataflow/engine/utils";
import StartNode from "./special/StartNode";
import ReturnNode from "./special/ReturnNode";
import SequenceNode from "./sequence/SequenceNode";
import CompareNode from "./conditional/CompareNode";
import ForNode from "./loop/ForNode";
import ForeachNode from "./loop/ForeachNode";
import TypeDefNode from "./type/TypeDefNode";
import StringNode from "./string/StringNode";

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
            {id: "num_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
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
            {id: "num_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
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
            {id: "num_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
            {id: "num_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
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
            {id: "num_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
            {id: "num_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 1},
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
            {id: "num_a", name: "A", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "B", type: ParameterTypes.NUMBER, required: true, editable: true, defaultValue: 0},
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
    builder: (node: NodeConfig) => <SetVarNode node={node} />,
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
    builder: (node: NodeConfig) => <GetVarNode node={node} context={jsonToMap<any>(node.context)} />,
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
        executable: true,
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
        executable: true,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""}
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
        executable: true,
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
        executable: true,
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
        executable: true,
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
        executable: true,
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
        executable: true,
        inputs: [
            {id: "value", name: "Value", type: ParameterTypes.STRING, required: true, editable: true, defaultValue: ""}
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterTypes.STRING}
        ]
    }
});
