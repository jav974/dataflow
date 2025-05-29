import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { NodeType, OutputConfig, ParameterTypes } from "../config/Schema";
import BaseIcon from "../icons/BaseIcon";
import Pin from "./pin/Pin";
import { COLOR_BLUE } from "../config/Style";
import useHoverable from "@/hooks/useHoverable";
import { useGraphContext } from "@/contexts/GraphContext";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface NodeValueOutputsProps {
    nodeId: string;
    nodeType: NodeType;
    outputs?: OutputConfig[];
    multiple: boolean;
    onRef: (outputId: string, el: HTMLDivElement | null) => void;
}

export default function NodeValueOutputs({nodeId, nodeType, outputs, onRef, multiple}: NodeValueOutputsProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const {addNodeOutput} = useGraphContext();

    const handleAddPin = useCallback(() => {
        addNodeOutput(nodeId, {
            id: uuidv4(),
            name: "name",
            type: ParameterTypes.ANY
        });
    }, [nodeId, addNodeOutput]);

    if (!outputs?.length && !multiple) {
        return null;
    }

    return (
        <div
            className={`space-y-2 pb-2 pt-2 border-2 border-transparent ${multiple ? 'hover:border-gray-500 hover:border-dashed' : ''}`}
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
        >
            {outputs?.map((output) => (
                <Pin
                    key={output.id}
                    id={output.id}
                    nodeId={nodeId}
                    nodeType={nodeType}
                    name={output.name}
                    type={output.type}
                    isInput={false}
                    onRef={onRef}
                    editable={multiple}
                    removable={multiple}
                    isCollection={output.isCollection}
                    typeEditable={multiple}
                />
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
