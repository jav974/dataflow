import Node, { NodeProps } from "@dataflow-ui/components/core/Node";
import useLinkedInputTypes from "@dataflow-ui/hooks/useLinkedInputTypes";

export default function ComparisonNode({node, ...props}: NodeProps) {
    useLinkedInputTypes(node.id, ...node.inputs!.map(input => input.id));

    return (
        <Node
            node={node}
            size={{width: 200, height: 100}}
            hasContinue={false}
            hasExecute={false}
            {...props}
        />
    );
}
