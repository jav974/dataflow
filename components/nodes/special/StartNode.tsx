import Node, { NodeProps } from "@/components/core/Node";

interface StartNodeProps extends NodeProps {
}

export default function StartNode({node}: StartNodeProps) {
    return (
        <Node
            node={node}
            hasExecute={false}
            hasContinue={true}
            size={{width: 200, height: 100}}
            outputMultiple={true}
        />
    );
}
