import { InputConfig, NodeType, OutputConfig, ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import { useEffect, useMemo } from "react";

interface IfNodeProps extends Omit<NodeProps, "type" | "executable"> {

}

export default function IfNode({id, position, inputs, outputs}: IfNodeProps) {
    const {setNodeInputs, setNodeOutputs} = useGraphContext();

    const defaultInputs = useMemo((): InputConfig[] => {
        return [
            {
                id: "A",
                name: "A",
                required: true,
                type: ParameterType.ANY,
                defaultValue: 0,
                editable: true
            },
            {
                id: "B",
                name: "B",
                required: true,
                type: ParameterType.ANY,
                defaultValue: 0,
                editable: true
            },
            {
                id: "A_EQ_B",
                name: "A == B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            },
            {
                id: "A_NEQ_B",
                name: "A != B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            },
            {
                id: "A_SUP_B",
                name: "A > B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            },
            {
                id: "A_INF_B",
                name: "A < B",
                required: true,
                type: ParameterType.ANY,
                editable: false
            }
        ];
    }, [id]);

    const defaultOutputs = useMemo((): OutputConfig[] => {
        return [{
            id: "result",
            name: "result",
            type: ParameterType.ANY
        }];
    }, [id]);

    const size = useMemo(() => {
        return {
            width: 200,
            height: 400
        }
    }, [id]);

    useEffect(() => {
        if (!inputs) {
            setNodeInputs(id, defaultInputs);
        }
    }, [id, inputs, defaultInputs, setNodeInputs]);

    useEffect(() => {
        if (!outputs) {
            setNodeOutputs(id, defaultOutputs);
        }
    }, [id, outputs, defaultOutputs, setNodeOutputs]);

    return (
        <Node
            id={id}
            name="If"
            executable={false}
            hasContinue={false}
            hasExecute={false}
            type={NodeType.CONDITIONAL_IF}
            position={position}
            inputs={inputs}
            outputs={outputs}
            size={size}
        >
        </Node>
    );
}