import { useCallback, useMemo } from "react";
import { InputConfig, ParameterType } from "../config/Schema";
import Pin from "./Pin";
import useHoverable from "@/hooks/useHoverable";
import BaseIcon from "../icons/BaseIcon";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { COLOR_BLUE } from "../config/Style";
import { useGraphContext } from "@/contexts/GraphContext";
import { v4 as uuidv4 } from "uuid";
import { OutputPin, useNodes } from "@/contexts/NodeContext";

interface NodeInputsProps {
    nodeId: string;
    inputs?: InputConfig[];
    multiple?: boolean;
    minInputParams?: number;
    inputMultipleType?: ParameterType;
    onRef: (inputId: string, el: HTMLDivElement | null) => void;
}

export default function NodeInputs({nodeId, inputs, onRef, multiple = false, minInputParams = 0, inputMultipleType}: NodeInputsProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const {addNodeInput, addConnection} = useGraphContext();
    const {nodes, connectionDrag, stopConnectionDrag} = useNodes();
    const inputParams = useMemo(() => inputs?.length ?? 0, [inputs]);

    const handleAddPin = useCallback(() => {
        if (!multiple) return ;

        addNodeInput(nodeId, {
            id: uuidv4(),
            name: "",
            type: inputMultipleType ?? ParameterType.STRING,
            required: true,
            editable: true
        });
    }, [addNodeInput, nodeId, inputs, inputMultipleType, multiple]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isHovered || !multiple || !connectionDrag) return ;
        
        const node = nodes.ref.current.get(connectionDrag.connector.id);
        if (!node) return;

        const output = node.outputs.find((pin: OutputPin) => pin.id === connectionDrag.connector.pin);
        if (!output) return;

        if (output.type !== inputMultipleType) {
            // TODO
            return ;
        }

        e.stopPropagation();

        const inputId = uuidv4();

        addNodeInput(nodeId, {
            id: inputId,
            name: "",
            type: inputMultipleType ?? ParameterType.STRING,
            required: true,
            editable: true
        });

        addConnection({
            from: {id: node.id, pin: output.id},
            to: {id: nodeId, pin: inputId}
        });

        stopConnectionDrag();
    }, [nodeId, connectionDrag, inputMultipleType, isHovered, multiple, addNodeInput, addConnection, stopConnectionDrag]);

    if (!inputs?.length) {
        return null;
    }

    return (
        <div
            className="space-y-2 border-transparent hover:border-black hover:border-dashed border-2 pb-2 pt-2"
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
            onPointerUp={handlePointerUp}
        >
            {inputs?.map((input: InputConfig) => (
                <div key={input.id}>
                    <Pin
                        id={input.id}
                        nodeId={nodeId}
                        name={input.name}
                        type={input.type}
                        required={input.required}
                        isInput={true}
                        onRef={onRef}
                        removable={multiple && inputParams > minInputParams}
                        defaultValue={input.defaultValue}
                        editable={input.editable}
                    />
                </div>
            ))}
            {multiple && isHovered &&
            <div className="flex justify-center">
                <BaseIcon
                    icon={AddCircleIcon}
                    size={16}
                    color={COLOR_BLUE}
                    strokeWidth={1.5}
                    onClick={handleAddPin}
                />
            </div>
            }
        </div>
    );
}
