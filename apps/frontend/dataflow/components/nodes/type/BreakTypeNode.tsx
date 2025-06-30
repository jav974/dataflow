import { useCallback, useMemo } from "react";
import Node, { NodeProps } from "../../core/Node";
import { NodeConfig, ParameterTypes } from "@/dataflow/config/schema";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useRefSignalEffect } from "react-refsignal";
import useObservableInput from "@/dataflow/hooks/useObservableInput";

export default function BreakTypeNode({node, ...props}: NodeProps) {
    const { updateNodeInput, setNodeOutputs, types } = useGraphContext();
    const input = useMemo(() => node.inputs ? node.inputs[0] : undefined, [node.inputs]);
    const connectionInfo = useObservableInput(node.id, 'value');

    const updateType = useCallback((node: NodeConfig, type: string) => {
        updateNodeInput(node.id, {...input, type});

        switch (type) {
            case ParameterTypes.ANY:
            case ParameterTypes.BOOLEAN:
            case ParameterTypes.NUMBER:
            case ParameterTypes.STRING:
                setNodeOutputs(node.id, []);
                break ;
            default:
                const graphType = types.current.find(graphType => graphType.id === type);
                const outputs = graphType?.properties ?? [];
                setNodeOutputs(node.id, outputs);
                break ;
        }
    }, [input, types, setNodeOutputs, updateNodeInput]);

    // Update type of input after it is connected
    // Update outputs depending on input type
    useRefSignalEffect(() => {
        if (!input) return ;

        if (connectionInfo.current && connectionInfo.current.target.type !== input.type) {
            updateType(node, connectionInfo.current.target.type);
        }
    }, [connectionInfo, node, input]);

    // Update outputs when type updates
    useRefSignalEffect(() => {
        if (connectionInfo.current && connectionInfo.lastUpdated < types.lastUpdated) {
            updateType(node, connectionInfo.current.target.type);
        }
    }, [types]);

    return (
        <Node
            node={node}
            size={{width: 250, height: 100}}
            hasContinue={false}
            hasExecute={false}
            {...props}
        />
    );
}