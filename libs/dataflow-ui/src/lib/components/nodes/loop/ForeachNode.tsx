import Node, { NodeProps } from "@dataflow-ui/components/core/Node";
import { ParameterTypes } from "@dataflow-ide/dataflow-core";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import useObservableInput from "@dataflow-ui/hooks/useObservableInput";
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
