import Node, { NodeProps } from "@/components/core/Node";

interface ForeachNodeProps extends NodeProps {
}

export default function ForeachNode({node}: ForeachNodeProps) {
    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
        />
    );
}
