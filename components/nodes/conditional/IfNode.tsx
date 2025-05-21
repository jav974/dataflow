import Node, { NodeProps } from "@/components/core/Node";

interface IfNodeProps extends NodeProps {
}

export default function IfNode({node}: IfNodeProps) {
    return (
        <Node
            node={node}
            hasContinue={false}
            hasExecute={false}
            size={{width: 200, height: 400}}
        />
    );
}
