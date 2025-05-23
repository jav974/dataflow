import Node, { NodeProps } from "@/components/core/Node";

interface CompareNodeProps extends NodeProps {
}

export default function CompareNode({node}: CompareNodeProps) {
    return (
        <Node
            node={node}
            hasContinue={false}
            hasExecute={false}
            size={{width: 200, height: 400}}
        />
    );
}
