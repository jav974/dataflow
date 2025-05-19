import { ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import { useEffect, useMemo } from "react";

export interface MathNodeProps extends Omit<NodeProps, "outputs"> {
}

export default function MathNode({ id, name, type, description, inputs, position }: MathNodeProps) {
    const {setNodeInputs, setNodeOutputs} = useGraphContext();
    const nodeOutputs = useMemo(() => {
        return [{id: "result", name: "result", type: ParameterType.NUMBER}];
    }, []);

    // Initialize Math node with at least 2 number parameters
    useEffect(() => {
        if (!inputs) {
            setNodeInputs(id, [
                {id: "num1", name: "A", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
                {id: "num2", name: "B", type: ParameterType.NUMBER, required: true, editable: true, defaultValue: 0},
            ]);
        }
    }, [id, inputs, setNodeInputs]);

    // Initialize Math node with exactly 1 output parameter
    useEffect(() => {
        setNodeOutputs(id, nodeOutputs);
    }, [id, setNodeOutputs, nodeOutputs]);

    return (
        <Node
            id={id}
            name={name}
            description={description}
            inputs={inputs}
            outputs={nodeOutputs}
            position={position}
            type={type}
            size={{width: 215, height: 100}}
            hasExecute={false}
            hasContinue={false}
            multiple={true}
            minInputParams={2}
            inputMultipleType={ParameterType.NUMBER}
            executable={false}
        />
    );
}
