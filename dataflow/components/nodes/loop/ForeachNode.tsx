import Node, { NodeProps } from "@/dataflow/components/core/Node";

export default function ForeachNode({node}: NodeProps) {
    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
        />
    );
}
