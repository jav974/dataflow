import { useCallback, useState } from "react";
import Node, { type NodeProps } from "../../core/Node";
import FetchConfigModal from "./FetchConfigModal";

interface FetchNodeProps extends NodeProps {
}

export default function FetchNode({ node }: FetchNodeProps) {
    const [configureModalOpen, setConfigureModalOpen] = useState<boolean>(false);

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
