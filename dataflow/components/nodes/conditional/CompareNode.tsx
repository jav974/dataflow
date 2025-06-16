import Node, { NodeProps } from "@/dataflow/components/core/Node";

export default function CompareNode({node}: NodeProps) {
    return (
        <Node
            node={node}
            hasContinue={false}
            hasExecute={false}
            size={{width: 200, height: 400}}
        />
    );
}
