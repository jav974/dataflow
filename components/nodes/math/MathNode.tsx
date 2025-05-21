import { ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import { useEffect, useMemo } from "react";

export interface MathNodeProps extends NodeProps {
}

export default function MathNode({ node }: MathNodeProps) {
    const {setNodeInputs, setNodeOutputs} = useGraphContext();
    const nodeOutputs = useMemo(() => {
        return [{id: "result", name: "result", type: ParameterType.NUMBER}];
    }, []);

    // Initialize Math node with at least 2 number parameters
    useEffect(() => {
        if (!node.inputs) {
            setNodeInputs(node.id, [
                {id: "num1", name: "A", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
                {id: "num2", name: "B", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
            ]);
        }
    }, [node.id, node.inputs, setNodeInputs]);

    // Initialize Math node with exactly 1 output parameter
    useEffect(() => {
        if (!node.outputs) {
            setNodeOutputs(node.id, nodeOutputs);
        }
    }, [node.id, node.outputs, setNodeOutputs, nodeOutputs]);

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
