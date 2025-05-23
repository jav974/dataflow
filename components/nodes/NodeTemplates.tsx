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

registry.set(NodeType.CONDITIONAL_IF, {
    builder: (node: NodeConfig) => <IfNode node={node} />,
    config: {
        type: NodeType.CONDITIONAL_IF,
        name: "If",
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
                required: true,
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

registry.set(NodeType.SEQUENCE, {
    builder: (node: NodeConfig) => <SequenceNode node={node} />,
    config: {
        executable: true,
        name: "Sequence",
        type: NodeType.SEQUENCE,
        outputBranches: [
            {id: "then_1", name: "Then"},
            {id: "then_2", name: "Then"}
        ]
    }
});
