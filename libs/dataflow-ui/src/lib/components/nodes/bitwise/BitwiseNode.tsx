import Node, { NodeProps } from "../../core/Node";

export default function BitwiseNode({node, ...props}: NodeProps) {
    return (
        <Node
            node={node}
            size={{width: 200, height: 100}}
            hasContinue={false}
            hasExecute={false}
            {...props}
        />
    );
}
