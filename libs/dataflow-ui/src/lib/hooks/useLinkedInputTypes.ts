import { useRefSignalEffect, useRefSignalMemo } from "react-refsignal";
import useObservableNode from "./useObservableNode";
import { useEffect, useRef } from "react";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";

export default function useLinkedInputTypes(nodeId: string, ...inputIds: string[]) {
    const { updateNodeInput } = useGraphContext();
    const prevType = useRef<string | undefined>(undefined);
    const node = useObservableNode(nodeId);
    const inputs = useRefSignalMemo(() => {
        if (!node.current) return [];

        return inputIds.map(inputId => {
            return node.current?.current.inputs?.find(input => input.id === inputId);
        }).filter(input => input !== undefined);
    }, [node, node.current, inputIds]);

    // First effect to ensure all inputs are of the same type
    useEffect(() => {
        const distinctTypes = new Set(inputs.current.map(input => input.type));

        if (distinctTypes.size > 1) {
            console.warn(`Multiple input types detected for node ${nodeId}:`, Array.from(distinctTypes));
            console.warn('Setting all inputs to the type of the first input:', inputs.current[0].type);
            inputs.current.forEach(input => {
                if (input.type !== inputs.current[0].type) {
                    updateNodeInput(nodeId, {...input, type: inputs.current[0].type });
                }
            });
        }

        prevType.current = inputs.current[0]?.type;
    }, []);

    // Update input types if one of them change
    useRefSignalEffect(() => {
        if (!prevType.current) return;

        const distinctTypes = new Set(inputs.current.map(input => input.type));
        if (distinctTypes.size != 2) return;

        let newType: string | undefined = undefined;

        for (const input of inputs.current) {
            if (input.type !== prevType.current) {
                newType = input.type;
                break;
            }
        }

        if (newType) {
            console.log(`Updating input types for node ${nodeId} to ${newType}`);
            inputs.current.forEach(input => {
                if (input.type !== newType) {
                    updateNodeInput(nodeId, {...input, type: newType });
                }
            });
            prevType.current = newType;
        }
    }, [inputs]);
}
