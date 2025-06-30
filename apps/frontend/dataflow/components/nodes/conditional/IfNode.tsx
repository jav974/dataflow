import Node, { NodeProps } from "@/dataflow/components/core/Node";

export default function IfNode({node}: NodeProps) {
    return (
        <Node
            node={node}
            hasContinue={true}
            hasExecute={true}
            size={{width: 200, height: 400}}
        />
    );
}
