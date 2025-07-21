import { useCallback, useEffect, useMemo, useState } from "react";
import Node, { type NodeProps } from "../../core/Node";
import FetchConfigModal from "./FetchConfigModal";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { ParameterTypes } from "@dataflow-ide/dataflow-core";

export default function FetchNode({ node }: NodeProps) {
    const [configureModalOpen, setConfigureModalOpen] = useState<boolean>(false);
    const {addNodeInput, removeNodeInput} = useGraphContext();

    const toggleConfigureModal = useCallback(() => {
        setConfigureModalOpen(!configureModalOpen);
    }, [configureModalOpen]);

    const selectedMethod = useMemo(() => {
        if (node.inputs) {
            return node.inputs.find(input => input.id === "method")?.defaultValue;
        }
    }, [node.inputs]);

    useEffect(() => {
        switch (selectedMethod) {
            case 'GET':
            case 'OPTIONS':
                removeNodeInput(node.id, "body");
                break ;
            case 'POST':
            case 'PUT':
            case 'PATCH':
            case 'DELETE':
                addNodeInput(node.id, {id: "body", name: "body", required: false, type: ParameterTypes.ANY});
                break ;
        }
    }, [selectedMethod, node.id, addNodeInput, removeNodeInput]);

    return (
        <Node
            node={node}
            size={{ width: 300, height: 100 }}
        >
            {/* <div className="flex flex-col gap-2">
                <div className="flex justify-center p-2">
                    <button className="text-blue-500 hover:underline cursor-pointer" onClick={toggleConfigureModal}>Configure</button>
                    
                    <FetchConfigModal isOpen={configureModalOpen} onClose={toggleConfigureModal}/>
                </div>
            </div> */}
        </Node>
    );
}
