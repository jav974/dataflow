import React, { useCallback, useMemo } from "react";
import useLinkable from "@/hooks/useLinkable";
import { useGraphContext } from "@/contexts/GraphContext";
import { NodeType, ParameterType } from "../../config/Schema";
import NamedPin from "./NamedPin";
import ValuedPin from "./ValuedPin";
import Tooltip from "@/components/ui/Tooltip";

interface PinProps {
    nodeId: string;
    id: string;
    nodeType: NodeType;
    name: string;
    type: ParameterType;
    required?: boolean;
    isInput: boolean;
    removable?: boolean;
    defaultValue?: any;
    editable?: boolean;
    onRef: (id: string, el: HTMLDivElement | null) => void;
}

function Pin({ nodeId, id, nodeType, name, type, required, isInput, onRef, removable = false, defaultValue, editable }: PinProps) {
    const {removeNodeInput, removeNodeOutput, setInputDefaultValue, setOutputName, setInputName, computedResult} = useGraphContext();
    const {isConnected, onClick, handlePointerDown, handlePointerUp} = useLinkable(nodeId, id, isInput, !isInput);
    
    const onPinRef = useCallback((el: HTMLDivElement | null) => {
        onRef(id, el);
    }, [nodeId, id, onRef]);
    
    const handleRemoveInputPin = useCallback(() => {
        removeNodeInput(nodeId, id);
    }, [nodeId, id, removeNodeInput]);

    const handleRemoveOutputPin = useCallback(() => {
        removeNodeOutput(nodeId, id);
    }, [nodeId, id, removeNodeOutput]);

    const handleInputSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setInputDefaultValue(nodeId, id, data[id]);
    }, [nodeId, id, setInputDefaultValue]);

    const handleOutputSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setOutputName(nodeId, id, data[id]);
    }, [nodeId, id, setOutputName]);

    const handleInputNameSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setInputName(nodeId, id, data[id]);
    }, [nodeId, id, setInputName]);

    const executionValue = useMemo((): any => {
        return computedResult.ref.current.get(nodeId + ':' + id);
    }, [computedResult.lastUpdated, nodeId, id]);

    const pinContainerClass = "flex items-center gap-1" + (!isInput ? " flex-row-reverse" : "");
    const basePinClass = "min-w-[12px] min-h-[12px] rounded-full cursor-pointer";
    const pinClass = `${basePinClass} ${isConnected
        ? 'bg-blue-500'
        : 'border-2 border-blue-500 bg-transparent'
    }`;

    return (
        <Tooltip tooltip={executionValue}>
            <div className={pinContainerClass}>
                <div
                    ref={onPinRef}
                    className={pinClass}
                    onClick={onClick}
                    onPointerDownCapture={handlePointerDown}
                    onPointerUp={handlePointerUp}
                >
                </div>
                <div className="text-gray-300 text-sm">
                    {!isInput && !editable && name}
                    {!isInput && editable &&
                        <NamedPin id={id} value={name} removable={true} onSubmit={handleOutputSubmit} onRemove={handleRemoveOutputPin}/>
                    }

                    {isInput && !editable && name}
                    {isInput && editable && !isConnected && nodeType !== NodeType.RETURN &&
                        <ValuedPin id={id} name={name} type={type} defaultValue={defaultValue} required={required ?? false} removable={removable} onSubmit={handleInputSubmit} onRemove={handleRemoveInputPin} />
                    }
                    {nodeType === NodeType.RETURN &&
                        <NamedPin id={id} value={name} removable={true} onSubmit={handleInputNameSubmit} onRemove={handleRemoveInputPin} orientation="left"/>
                    }
                    {required && !editable && <span className="text-red-500 ml-1">*</span>}
                </div>
            </div>
        </Tooltip>
    );
}

export default Pin;
export type { PinProps };
