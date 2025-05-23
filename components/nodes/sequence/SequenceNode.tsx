import Node, { NodeProps } from "@/components/core/Node";

interface SequenceNodeProps extends NodeProps {
}

export default function SequenceNode({node}: SequenceNodeProps) {
    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
            branchMultiple={true}
            minBranches={2}
        />
    );
}
