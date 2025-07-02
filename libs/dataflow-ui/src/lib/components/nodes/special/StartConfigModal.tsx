import Modal from "@dataflow-ui/components/core/Modal";
import { NodeConfig } from "@dataflow-ide/dataflow-core";
import React, { useCallback } from "react";
import PinTypeForm from "../../core/pin/PinTypeForm";
import NamedPin from "../../core/pin/NamedPin";
import ValuedPin from "../../core/pin/ValuedPin";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";

interface StartConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    node: NodeConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Map<string, any>;
}

export default function StartConfigModal({isOpen, onClose, node, context}: StartConfigModalProps) {
    const {setOutputName, setNodeContext} = useGraphContext();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNameChange = useCallback((id: string, value: any) => {
        setOutputName(node.id, id, value[id]);
    }, [node.id, setOutputName]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleValueChange = useCallback((id: string, value: any) => {
        setNodeContext(node.id, context.set(id, value[id]));
    }, [node.id, context, setNodeContext]);

    return (
        <Modal title="Configure Start options" isOpen={isOpen}>
            <div className="flex text-sm w-full bg-white/30">
                <div className="flex flex-col grow">
                    <div className="flex">
                        <div className="p-1 w-30">Type / Collection</div>
                        <div className="p-1 w-50">Name</div>
                        <div className="p-1 w-60">Default</div>
                    </div>
                    <div className="flex flex-col">
                    {node.outputs?.map((v, index) => {
                        return (
                            <div key={index} className="flex grow">
                                <div className="p-1 w-30">
                                    <PinTypeForm nodeId={node.id} pinId={v.id} isInput={false} type={v.type} isCollection={v.isCollection} collectionEditable={true} />
                                </div>
                                <div className="flex w-50 max-w-50 overflow-hidden p-1">
                                    <NamedPin id={v.id} orientation="left" removable={false} value={v.name} onSubmit={(data) => handleNameChange(v.id, data)} />
                                </div>
                                <div className="flex w-60 max-w-60 overflow-hidden p-1">
                                    <ValuedPin id={v.id} name={v.name} required={false} type={v.type} defaultValue={context.get(v.id)} removable={false} onSubmit={(data) => handleValueChange(v.id, data)} />
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Close
                </button>
            </div>
        </Modal>
    );
};
