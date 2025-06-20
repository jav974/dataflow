import Node, { NodeProps } from "@/dataflow/components/core/Node";
import { ParameterTypes } from "@/dataflow/config/schema";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import useObservableInput from "@/dataflow/hooks/useObservableInput";
import { useMemo } from "react";
import { useRefSignalEffect } from "react-refsignal";

export default function ForeachNode({node}: NodeProps) {
    const connectionInfo = useObservableInput(node.id, 'value');
    const { updateNodeInput, setNodeOutputs } = useGraphContext();
    const input = useMemo(() => node.inputs ? node.inputs[0] ?? undefined : undefined, [node.inputs]);

    useRefSignalEffect(() => {
        if (!input || !connectionInfo.current || !connectionInfo.current.target.isCollection) return ;

        if (input.type !== connectionInfo.current.target.type) {
            updateNodeInput(node.id, {...input, type: connectionInfo.current.target.type});
            setNodeOutputs(node.id, [
                {id: "index", name: "index", type: ParameterTypes.ANY},
                {id: "item", name: "item", type: connectionInfo.current.target.type},
            ]);
        }
    }, [connectionInfo, input, updateNodeInput, setNodeOutputs]);

    return (
        <Node
            node={node}
            hasExecute={true}
            hasContinue={true}
            size={{width: 200, height: 100}}
        />
    );
}
