import { useCallback, useEffect, useState } from "react";
import Node, { type NodeProps } from "../../core/Node";
import { ParameterType } from "../../config/Schema";
import { useGraphContext } from "@/contexts/GraphContext";
import FetchConfigModal from "./FetchConfigModal";

interface FetchNodeProps extends NodeProps {
}

export default function FetchNode({ node }: FetchNodeProps) {
    const {addNodeInput} = useGraphContext();
    const [configureModalOpen, setConfigureModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!node.inputs) {
            addNodeInput(node.id, {
                id: "url",
                name: "URL",
                type: ParameterType.STRING,
                required: false,
                editable: true
            });
        }
    }, [node.id, node.inputs, addNodeInput]);

    const toggleConfigureModal = useCallback(() => {
        setConfigureModalOpen(!configureModalOpen);
    }, [configureModalOpen]);

    return (
        <Node
            node={node}
            size={{ width: 300, height: 100 }}
        >
            <div className="flex flex-col gap-2">
                <div className="flex justify-center p-2">
                    <button className="text-blue-500 hover:underline cursor-pointer" onClick={toggleConfigureModal}>Configure</button>
                    
                    <FetchConfigModal isOpen={configureModalOpen} onClose={toggleConfigureModal}/>
                </div>
            </div>
        </Node>
    );
}
