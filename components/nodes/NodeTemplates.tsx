import { NodeConfig, NodeType } from "../config/Schema";
import registry from "./registry";
import FetchNode from "./fetch/FetchNode";
import MathNode from "./math/MathNode";
import SetVarNode from "./variables/SetVarNode";
import IfNode from "./conditional/IfNode";
import GetVarNode from "./variables/GetVarNode";
import { jsonToMap } from "@/engine/utils";
import StartNode from "./special/StartNode";
import ReturnNode from "./special/ReturnNode";

registry.set(NodeType.START, (node: NodeConfig) =>
    <StartNode
        id={node.id}
        outputs={node.outputs}
        position={node.position}
    />
);

registry.set(NodeType.RETURN, (node: NodeConfig) =>
    <ReturnNode
        id={node.id}
        inputs={node.inputs}
        position={node.position}
    />
);

registry.set(NodeType.FETCH, (node: NodeConfig) =>
    <FetchNode
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        outputs={node.outputs}
        position={node.position}
    />
);

registry.set(NodeType.MATH_ADD, (node: NodeConfig) =>
    <MathNode
        type={NodeType.MATH_ADD}
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        position={node.position}
        executable={false}
    />
);

registry.set(NodeType.MATH_SUB, (node: NodeConfig) =>
    <MathNode
        type={NodeType.MATH_SUB}
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        position={node.position}
        executable={false}
    />
);

registry.set(NodeType.MATH_MUL, (node: NodeConfig) =>
    <MathNode
        type={NodeType.MATH_MUL}
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        position={node.position}
        executable={false}
    />
);

registry.set(NodeType.MATH_DIV, (node: NodeConfig) =>
    <MathNode
        type={NodeType.MATH_DIV}
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        position={node.position}
        executable={false}
    />
);

registry.set(NodeType.MATH_MOD, (node: NodeConfig) =>
    <MathNode
        type={NodeType.MATH_MOD}
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        position={node.position}
        executable={false}
    />
);

registry.set(NodeType.SET, (node: NodeConfig) =>
    <SetVarNode
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        outputs={node.outputs}
        position={node.position}
        executable={true}
    />
);

registry.set(NodeType.CONDITIONAL_IF, (node: NodeConfig) =>
    <IfNode
        id={node.id}
        name={node.name}
        inputs={node.inputs}
        outputs={node.outputs}
        position={node.position}
    />
);

registry.set(NodeType.GET, (node: NodeConfig) =>
    <GetVarNode
        id={node.id}
        name={node.name}
        outputs={node.outputs}
        position={node.position}
        context={jsonToMap<any>(node.context)}
    />
);
