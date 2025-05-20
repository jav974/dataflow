import { NodeType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";

interface StartNodeProps extends Omit<NodeProps, "name" | "type" | "executable" | "outputMultiple"> {
}

export default function StartNode({id, position, outputs}: StartNodeProps) {
    return (
        <Node
            id={id}
            name="Start"
            type={NodeType.START}
            position={position}
            outputs={outputs}
            executable={true}
            hasExecute={false}
            hasContinue={true}
            size={{width: 200, height: 100}}
            outputMultiple={true}
        />
    );
}
