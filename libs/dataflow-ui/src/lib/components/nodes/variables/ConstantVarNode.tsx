import { ParameterTypes, PrimitiveTypes } from "@dataflow-ide/dataflow-core";
import Node, { NodeProps } from "@dataflow-ui/components/core/Node";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { useEffect, useMemo } from "react";

export default function ConstantVarNode({node}: NodeProps) {
    const {updateNodeOutput, updateNodeInput} = useGraphContext();

    const inputType = useMemo(() => {
        return node.inputs![0].type;
    }, [node.inputs]);

    useEffect(() => {
        updateNodeOutput(node.id, {...node.outputs![0], type: inputType});
        const isPrimitive = PrimitiveTypes.includes(node.inputs![0].type as ParameterTypes);

        if (!isPrimitive && node.inputs![0].editable) {
            updateNodeInput(node.id, {...node.inputs![0], editable: false});
        } else if (isPrimitive && !node.inputs![0].editable) {
            updateNodeInput(node.id, {...node.inputs![0], editable: true});
        }
    }, [node.id, node.inputs, inputType, updateNodeOutput, updateNodeInput]);

    return (
        <Node node={node} hasContinue={false} hasExecute={false} size={{width: 200, height: 100}} />
    );
}
