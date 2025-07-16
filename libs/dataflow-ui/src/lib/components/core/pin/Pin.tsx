import React, { useCallback, useMemo } from "react";
import useLinkable from "@dataflow-ui/hooks/useLinkable";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { NodeType, ParameterType } from "@dataflow-ide/dataflow-core";
import NamedPin from "./NamedPin";
import ValuedPin from "./ValuedPin";
import Tooltip from "@dataflow-ui/components/ui/Tooltip";
import { PinStyle } from "@dataflow-ui/themes/style";
import PinTypeForm from "./PinTypeForm";
import UneditablePin from "./UneditablePin";

interface PinProps {
    nodeId: string;
    id: string;
    nodeType: NodeType;
    name: string;
    type: ParameterType;
    required?: boolean;
    isInput: boolean;
    removable?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue?: any;
    editable?: boolean;
    isCollection?: boolean;
    typeEditable?: boolean;
    collectionEditable?: boolean;
    onRef: (id: string, el: HTMLDivElement | null) => void;
}

function Pin({ nodeId, id, nodeType, name, type, required, isInput, onRef, removable = false, defaultValue, editable, isCollection = false, typeEditable = false, collectionEditable = false }: PinProps) {
    const {removeNodeInput, removeNodeOutput, setInputDefaultValue, setOutputName, setInputName, splitInputParam, splitOutputParam, computedResult} = useGraphContext();
    const {isConnected, onClick, handlePointerDown, handlePointerUp} = useLinkable(nodeId, id, isInput);
    
    const onPinRef = useCallback((el: HTMLDivElement | null) => {
        onRef(id, el);
    }, [id, onRef]);
    
    const handleRemoveInputPin = useCallback(() => {
        removeNodeInput(nodeId, id);
    }, [nodeId, id, removeNodeInput]);

    const handleRemoveOutputPin = useCallback(() => {
        removeNodeOutput(nodeId, id);
    }, [nodeId, id, removeNodeOutput]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setInputDefaultValue(nodeId, id, data[id]);
    }, [nodeId, id, setInputDefaultValue]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOutputSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setOutputName(nodeId, id, data[id]);
    }, [nodeId, id, setOutputName]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputNameSubmit = useCallback((data: any, event?: React.BaseSyntheticEvent) => {
        event?.preventDefault();
        setInputName(nodeId, id, data[id]);
    }, [nodeId, id, setInputName]);

    const handleSplit = useCallback(() => {
        if (isInput) splitInputParam(nodeId, id);
        else splitOutputParam(nodeId, id);
    }, [splitInputParam, nodeId, id, isInput, splitOutputParam]);

    const lastUpdated = computedResult.lastUpdated;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const executionValue = useMemo((): any => {
        void lastUpdated;
        if (computedResult.current.size === 0) return undefined;
        if (!computedResult.current.has(nodeId + ':' + id)) return undefined;
        
        const res = computedResult.current.get(nodeId + ':' + id);
        return JSON.stringify(res, null, 2);
    }, [computedResult, lastUpdated, nodeId, id]);

    const pinContainerClass = "flex grow items-center gap-1" + (!isInput ? " flex-row-reverse" : "");
    const typeClass = isCollection ? "border-dotted" : "rounded-full";
    const style = PinStyle[type] ?? PinStyle.custom;
    const connectedClass = isConnected ? style.connectedClass : `border-2 bg-transparent ${style.disconnectedClass}`;
    const pinClass = `io-pin w-[12px] h-[12px] ${typeClass} ${connectedClass} cursor-pointer`;
    const pinTypeForm = !typeEditable ? null : <PinTypeForm nodeId={nodeId} pinId={id} isInput={isInput} type={type} isCollection={isCollection} collectionEditable={collectionEditable} />;

    return (
        <Tooltip tooltip={executionValue}>
            <div className={pinContainerClass}>
                <Tooltip tooltip={pinTypeForm} showOn="right-click">
                    <div
                        ref={onPinRef}
                        className={pinClass}
                        onClick={onClick}
                        onPointerDownCapture={handlePointerDown}
                        onPointerUp={handlePointerUp}
                    />
                </Tooltip>
                <div className={`flex grow text-gray-300 text-sm ${!isInput ? 'flex-row-reverse' : ''}`}>
                    {!isInput && !editable &&
                        <UneditablePin isInput={isInput} type={type} isCollection={isCollection} name={name} removable={removable} onRemove={handleRemoveOutputPin} onSplit={handleSplit}/>
                    }

                    {!isInput && editable &&
                        <NamedPin id={id} value={name} removable={true} onSubmit={handleOutputSubmit} onRemove={handleRemoveOutputPin}/>
                    }

                    {isInput && !editable && nodeType !== NodeType.BREAK_TYPE && nodeType !== NodeType.CALL_EVENT && !isCollection &&
                        <UneditablePin isInput={isInput} type={type} isCollection={isCollection} name={name} removable={removable} onRemove={handleRemoveInputPin} onSplit={handleSplit}/>
                    }

                    {isInput && ((!editable && (nodeType === NodeType.BREAK_TYPE || nodeType === NodeType.CALL_EVENT)) || isCollection) && <span className="inline-block whitespace-nowrap">{name}</span>}
                    
                    {isInput && editable && !isConnected && nodeType !== NodeType.RETURN && !isCollection &&
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
