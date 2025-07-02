import { OutputConfig, jsonToMap } from "@dataflow-ide/dataflow-core";
import Node, { NodeProps } from "@dataflow-ui/components/core/Node";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { batch } from "react-refsignal";
import StartConfigModal from "./StartConfigModal";

export default function StartNode({node}: NodeProps) {
    const {variables, setVariable, removeVariable, startParams} = useGraphContext();
    const outputs = useRef<OutputConfig[]>([...node.outputs ?? []]);
    const [configureModalOpen, setConfigureModalOpen] = useState<boolean>(false);
    const context = useMemo(() => jsonToMap(node.context), [node.context]);

    const toggleConfigureModal = useCallback(() => {
        setConfigureModalOpen(!configureModalOpen);
    }, [configureModalOpen]);

    useEffect(() => {
        batch(() => {
            node.outputs?.forEach((output: OutputConfig) => {
                setVariable(output.id, output.name, output.type, output.isCollection ?? false);
            });

            outputs.current.forEach((output: OutputConfig) => {
                if (!node.outputs?.find(o => o.id === output.id)) {
                    removeVariable(output.id);
                }
            });

            outputs.current = [...node.outputs ?? []];
        }, [variables]);
    }, [node.outputs, removeVariable, setVariable, variables]);

    useEffect(() => {
        startParams.current = {};

        for (const [key, value] of context.entries()) {
            startParams.current[key] = value;
        }

        startParams.notifyUpdate();
    }, [context, startParams]);

    return (
        <Node
            node={node}
            hasExecute={false}
            hasContinue={true}
            size={{width: 200, height: 100}}
            outputMultiple={true}
        >
            {node.outputs && node.outputs.length > 0 &&
            <div className="flex flex-col gap-2">
                <div className="flex justify-center p-2">
                    <button className="text-blue-500 hover:underline cursor-pointer" onClick={toggleConfigureModal}>Configure</button>
                    
                    <StartConfigModal
                        isOpen={configureModalOpen}
                        onClose={toggleConfigureModal}
                        node={node}
                        context={context}
                    />
                </div>
            </div>
            }
        </Node>
    );
}
