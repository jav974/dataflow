import { InputConfig, OutputConfig, ParameterType } from "@/components/config/Schema";
import Node, { NodeProps } from "@/components/core/Node";
import { useGraphContext } from "@/contexts/GraphContext";
import { useEffect, useMemo } from "react";

interface IfNodeProps extends NodeProps {
}

export default function IfNode({node}: IfNodeProps) {
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
    }, [node.id]);

    const defaultOutputs = useMemo((): OutputConfig[] => {
        return [{
            id: "result",
            name: "result",
            type: ParameterType.ANY
        }];
    }, [node.id]);

    const size = useMemo(() => {
        return {
            width: 200,
            height: 400
        }
    }, [node.id]);

    useEffect(() => {
        if (!node.inputs) {
            setNodeInputs(node.id, defaultInputs);
        }
    }, [node.id, node.inputs, defaultInputs, setNodeInputs]);

    useEffect(() => {
        if (!node.outputs) {
            setNodeOutputs(node.id, defaultOutputs);
        }
    }, [node.id, node.outputs, defaultOutputs, setNodeOutputs]);

    return (
        <Node
            node={node}
            hasContinue={false}
            hasExecute={false}
            size={size}
        />
    );
}
