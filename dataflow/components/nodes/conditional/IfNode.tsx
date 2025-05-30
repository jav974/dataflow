import Node, { NodeProps } from "@/dataflow/components/core/Node";

interface IfNodeProps extends NodeProps {
}

export default function IfNode({node}: IfNodeProps) {
    return (
        <Node
            node={node}
            hasContinue={true}
            hasExecute={true}
            size={{width: 200, height: 400}}
        />
    );
}
