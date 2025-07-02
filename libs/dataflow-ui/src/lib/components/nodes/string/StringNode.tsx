import Node, { NodeProps } from "../../core/Node";

export default function StringNode({ node, ...props }: NodeProps) {
    return (
        <Node
            node={node}
            hasExecute={false}
            hasContinue={false}
            size={{ width: 200, height: 100 }}
            {...props}
        />
    );
}
