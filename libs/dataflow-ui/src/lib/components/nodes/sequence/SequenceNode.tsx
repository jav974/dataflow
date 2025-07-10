import Node, { NodeProps } from "@dataflow-ui/components/core/Node";

export default function SequenceNode({node}: NodeProps) {
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
