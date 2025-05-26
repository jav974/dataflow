import { NodeConfig, NodeType, ParameterType } from "../config/Schema";
import registry from "./registry";
import FetchNode from "./fetch/FetchNode";
import MathNode from "./math/MathNode";
import SetVarNode from "./variables/SetVarNode";
import IfNode from "./conditional/IfNode";
import GetVarNode from "./variables/GetVarNode";
import { jsonToMap } from "@/engine/utils";
import StartNode from "./special/StartNode";
import ReturnNode from "./special/ReturnNode";
import SequenceNode from "./sequence/SequenceNode";
import CompareNode from "./conditional/CompareNode";
import ForNode from "./loop/ForNode";
import ForeachNode from "./loop/ForeachNode";
import TypeDefNode from "./type/TypeDefNode";

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
            {id: "url", name: "URL", type: ParameterType.STRING, required: false, editable: true, defaultValue: ''},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.NUMBER}
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
            {id: "num_a", name: "A", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "B", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.NUMBER}
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
            {id: "num_a", name: "A", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "B", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.NUMBER}
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
            {id: "num_a", name: "A", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 1},
            {id: "num_b", name: "B", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 1},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.NUMBER}
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
            {id: "num_a", name: "A", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 1},
            {id: "num_b", name: "B", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 1},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.NUMBER}
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
            {id: "num_a", name: "A", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
            {id: "num_b", name: "B", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.NUMBER}
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
            {id: "value", name: "value", type: ParameterType.ANY, required: true, editable: false},
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.ANY}
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
            {id: "value", name: "value", type: ParameterType.ANY}
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
                type: ParameterType.ANY,
                defaultValue: 0,
                editable: true
            },
            {
                id: "B",
                name: "B",
                required: false,
                type: ParameterType.ANY,
                defaultValue: 0,
                editable: true
            },
            {
                id: "A_EQ_B",
                name: "A == B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            },
            {
                id: "A_NEQ_B",
                name: "A != B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            },
            {
                id: "A_SUP_B",
                name: "A > B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            },
            {
                id: "A_INF_B",
                name: "A < B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            }
        ],
        outputs: [
            {id: "result", name: "result", type: ParameterType.ANY}
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
            {id: "value", name: "value", type: ParameterType.BOOLEAN, editable: true, required: true, defaultValue: true}
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
            {id: "first", name: "First", type: ParameterType.NUMBER, required: true, defaultValue: 0, editable: true},
            {id: "last", name: "Last", type: ParameterType.NUMBER, required: true, defaultValue: 0, editable: true},
            {id: "inclusive", name: "Inclusive", type: ParameterType.BOOLEAN, required: false, defaultValue: false, editable: true},
        ],
        branches: [
            {id: "callback", name: "callback"}
        ],
        outputs: [
            {id: "index", name: "index", type: ParameterType.NUMBER}
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
            {id: "value", name: "value", type: ParameterType.ANY, required: true, editable: false, defaultValue: []}
        ],
        outputs: [
            {id: "index", name: "index", type: ParameterType.ANY},
            {id: "item", name: "item", type: ParameterType.ANY}
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
