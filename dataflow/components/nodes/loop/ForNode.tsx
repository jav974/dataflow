import Node, { NodeProps } from "@/dataflow/components/core/Node";

interface ForNodeProps extends NodeProps {
}

export default function ForNode({node}: ForNodeProps) {
    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
        />
    );
}
