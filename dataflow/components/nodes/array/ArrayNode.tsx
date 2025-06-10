import Node, { NodeProps } from "../../core/Node";

interface ArrayNodeProps extends NodeProps {
}

export default function ArrayNode({node, ...props}: ArrayNodeProps) {
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
