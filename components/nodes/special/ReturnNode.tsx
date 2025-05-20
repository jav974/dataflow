import { NodeType, ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";

interface ReturnNodeProps extends Omit<NodeProps, "name" | "type" | "executable"> {
}

export default function ReturnNode({id, position, inputs}: ReturnNodeProps) {
    return (
        <Node
            id={id}
            name="Return"
            type={NodeType.RETURN}
            position={position}
            inputs={inputs}
            executable={true}
            hasExecute={true}
            hasContinue={false}
            size={{width: 200, height: 100}}
            inputMultiple={true}
            inputMultipleType={ParameterType.ANY}
            minInputParams={0}
        />
    );
}
