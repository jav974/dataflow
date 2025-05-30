import { ParameterTypes } from "@/dataflow/config/schema";
import Node, { NodeProps } from "@/dataflow/components/core/Node";

interface ReturnNodeProps extends NodeProps {
}

export default function ReturnNode({node}: ReturnNodeProps) {
    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={false}
            size={{width: 200, height: 100}}
            inputMultiple={true}
            inputMultipleType={ParameterTypes.ANY}
            minInputParams={0}
        />
    );
}
