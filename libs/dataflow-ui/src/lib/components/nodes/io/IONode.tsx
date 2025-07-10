import Node, { NodeProps } from "../../core/Node";

export default function IONode({node}: NodeProps) {
    return (
        <Node
            node={node}
            hasContinue={true}
            hasExecute={true}
            size={{width: 250, height: 100}}
        />
    );
}
