import Node, { NodeProps } from "../../core/Node";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { InputConfig, NodeConfig, NodeType } from "@dataflow-ide/dataflow-core";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { useRefSignalEffect } from "react-refsignal";

export default function ArrayNode({node, ...props}: NodeProps) {
    const prevInputRef = useRef<InputConfig | undefined>(node.inputs ? {...node.inputs[0]} : undefined);
    const {setNodeInputs, setNodeOutputs, getConnectionInfo, connections} = useGraphContext();
    const arrayInput = useMemo(() => node.inputs ? node.inputs[0] : undefined, [node.inputs]);
    const connectionInfo = useMemo(() => {
        if (!arrayInput) return undefined;
        return getConnectionInfo(node.id, arrayInput);
    }, [arrayInput, node.id, getConnectionInfo]);
    const error = useMemo(() => {
        if (connectionInfo && !connectionInfo.target.isCollection) {
            return "Invalid Array input";
        }
        return undefined;
    }, [connectionInfo]);

    const updateType = useCallback((node: NodeConfig, type: string) => {
        setNodeInputs(node.id, node.inputs?.map((v) => {
            if (node.type === NodeType.ARRAY_CONCAT) {
                return {...v, type};
            }

            switch (v.id) {
                case 'array':
                case 'value':
                    return {...v, type};
            }

            return v;
        }) ?? []);

        if (node.type !== NodeType.ARRAY_LENGTH) {
            setNodeOutputs(node.id, node.outputs?.map((v) => {
                if (node.type === NodeType.ARRAY_CONCAT) {
                    return {...v, type};
                }

                switch (v.id) {
                    case 'result':
                    case 'element':
                    case 'removed':
                        return {...v, type};
                }

                return v;
            }) ?? []);
        }
    }, [setNodeInputs, setNodeOutputs]);

    // Update types of inputs/outputs after array input is connected
    // Update types of inputs/outputs after array input connection type changes
    useRefSignalEffect(() => {
        if (!arrayInput) return ;
        const connectionInfo = getConnectionInfo(node.id, arrayInput);

        if (connectionInfo && connectionInfo.target.isCollection) {
            if (connectionInfo.target.type !== arrayInput.type) {
                updateType(node, connectionInfo.target.type);
            }
        }
    }, [connections, connectionInfo?.node, arrayInput, getConnectionInfo]);

    // Update types of inputs/outputs after user changes type for array input
    useEffect(() => {
        if (!node.inputs || !arrayInput) return ;

        if (arrayInput.type !== prevInputRef.current?.type) {
            prevInputRef.current = arrayInput;
            updateType(node, arrayInput.type);
        }
    }, [node, arrayInput, node.inputs, updateType]);

    return (
        <Node
            node={node}
            hasExecute={false}
            hasContinue={false}
            size={{ width: 200, height: 100 }}
            {...props}
        >
            {error && <div>{error}</div>}
        </Node>
    );
}
