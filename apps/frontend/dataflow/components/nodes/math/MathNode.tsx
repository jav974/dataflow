import { ParameterTypes } from "@/dataflow/config/schema";
import Node, { NodeProps } from "@/dataflow/components/core/Node";

export default function MathNode({ node, ...props }: NodeProps) {
    return (
        <Node
            node={node}
            size={{width: 215, height: 100}}
            hasExecute={false}
            hasContinue={false}
            inputMultiple={true}
            minInputParams={2}
            inputMultipleType={ParameterTypes.NUMBER}
            {...props}
        />
    );
}
