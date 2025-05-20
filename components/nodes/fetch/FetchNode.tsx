import { useCallback, useEffect, useState } from "react";
import Node, { type NodeProps } from "../../core/Node";
import { NodeType, ParameterType } from "../../config/Schema";
import { useGraphContext } from "@/contexts/GraphContext";
import FetchConfigModal from "./FetchConfigModal";

interface FetchNodeProps extends Omit<NodeProps, "type" | "executable"> {
}

export default function FetchNode({ id, name, description, inputs, outputs, position }: FetchNodeProps) {
    const {addNodeInput} = useGraphContext();
    const [configureModalOpen, setConfigureModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!inputs) {
            addNodeInput(id, {
                id: "url",
                name: "URL",
                type: ParameterType.STRING,
                required: false,
                editable: true
            });
        }
    }, [id, inputs, addNodeInput]);

    const toggleConfigureModal = useCallback(() => {
        setConfigureModalOpen(!configureModalOpen);
    }, [configureModalOpen]);

    return (
        <Node
            id={id}
            name={name}
            type={NodeType.FETCH}
            description={description}
            inputs={inputs}
            outputs={outputs}
            size={{ width: 300, height: 100 }}
            position={position}
            executable={true}
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
