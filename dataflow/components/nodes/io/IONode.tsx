import Node, { NodeProps } from "../../core/Node";

interface IONodeProps extends NodeProps {
}

export default function IONode({node}: IONodeProps) {
    return (
        <Node
            node={node}
            hasContinue={true}
            hasExecute={true}
            size={{width: 250, height: 100}}
        />
    );
}
