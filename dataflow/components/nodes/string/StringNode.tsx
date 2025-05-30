import Node, { NodeProps } from "../../core/Node";

interface StringNodeProps extends NodeProps {
}

export default function StringNode({ node, ...props }: StringNodeProps) {
    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{ width: 200, height: 100 }}
            {...props}
        />
    );
}
