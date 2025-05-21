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
    <StartNode node={node} />
);

registry.set(NodeType.RETURN, (node: NodeConfig) =>
    <ReturnNode node={node} />
);

registry.set(NodeType.FETCH, (node: NodeConfig) =>
    <FetchNode node={node} />
);

registry.set(NodeType.MATH_ADD, (node: NodeConfig) =>
    <MathNode node={node} />
);

registry.set(NodeType.MATH_SUB, (node: NodeConfig) =>
    <MathNode node={node} />
);

registry.set(NodeType.MATH_MUL, (node: NodeConfig) =>
    <MathNode node={node} />
);

registry.set(NodeType.MATH_DIV, (node: NodeConfig) =>
    <MathNode node={node} />
);

registry.set(NodeType.MATH_MOD, (node: NodeConfig) =>
    <MathNode node={node} />
);

registry.set(NodeType.SET, (node: NodeConfig) =>
    <SetVarNode node={node} />
);

registry.set(NodeType.CONDITIONAL_IF, (node: NodeConfig) =>
    <IfNode node={node} />
);

registry.set(NodeType.GET, (node: NodeConfig) =>
    <GetVarNode node={node} context={jsonToMap<any>(node.context)} />
);
