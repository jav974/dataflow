import { ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";

export interface MathNodeProps extends NodeProps {
}

export default function MathNode({ node }: MathNodeProps) {
    return (
        <Node
            node={node}
            size={{width: 215, height: 100}}
            hasExecute={false}
            hasContinue={false}
            inputMultiple={true}
            minInputParams={2}
            inputMultipleType={ParameterType.NUMBER}
        />
    );
}
