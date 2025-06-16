import { useCallback, useMemo } from "react";
import { InputConfig, NodeType, ParameterType, ParameterTypes } from "../../config/schema";
import Pin from "./pin/Pin";
import useHoverable from "@/dataflow/hooks/useHoverable";
import BaseIcon from "../icons/BaseIcon";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { COLOR_BLUE } from "../../config/style";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { v4 as uuidv4 } from "uuid";
import { OutputPin, useNodeContext } from "@/dataflow/contexts/NodeContext";

interface NodeInputsProps {
    nodeId: string;
    nodeType: NodeType;
    inputs?: InputConfig[];
    multiple?: boolean;
    minInputParams?: number;
    multipleType?: ParameterType;
    onRef: (inputId: string, el: HTMLDivElement | null) => void;
}

export default function NodeInputs({nodeId, nodeType, inputs, onRef, multiple = false, minInputParams = 0, multipleType}: NodeInputsProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();
    const {addNodeInput, addConnection} = useGraphContext();
    const {nodes, connectionDrag, stopConnectionDrag} = useNodeContext();
    const inputParams = useMemo(() => inputs?.length ?? 0, [inputs]);

    const handleAddPin = useCallback(() => {
        if (!multiple) return ;

        if (nodeType !== NodeType.RETURN) {
            addNodeInput(nodeId, {
                id: uuidv4(),
                name: "",
                type: multipleType ?? ParameterTypes.STRING,
                required: true,
                editable: true
            });
        } else {
            addNodeInput(nodeId, {
                id: uuidv4(),
                name: "name",
                type: ParameterTypes.ANY,
                required: false,
                editable: true
            });
        }
    }, [addNodeInput, nodeId, multipleType, multiple, nodeType]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isHovered || !multiple || !connectionDrag.current) return ;
        
        const node = nodes.current.get(connectionDrag.current.connector.id)?.current;
        if (!node) return;

        const output = node.outputs.find((pin: OutputPin) => pin.id === connectionDrag.current?.connector.pin);
        if (!output) return;

        if (output.type !== multipleType && multipleType !== ParameterTypes.ANY) {
            // TODO
            return ;
        }

        e.stopPropagation();

        const inputId = uuidv4();

        addNodeInput(nodeId, {
            id: inputId,
            name: "New",
            type: output.type,
            required: true,
            editable: true,
            isCollection: output.isCollection
        });

        addConnection({
            from: {id: node.mutableNodeConfig.id, pin: output.id},
            to: {id: nodeId, pin: inputId}
        });

        stopConnectionDrag();
    }, [nodeId, multipleType, isHovered, multiple, addNodeInput, addConnection, stopConnectionDrag, connectionDrag, nodes]);

    if (!inputs?.length && !multiple) {
        return null;
    }

    return (
        <div
            className={`space-y-2 pb-2 pt-2 border-2 border-transparent ${multiple ? 'hover:border-gray-500 hover:border-dashed' : ''}`}
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
            onPointerUp={handlePointerUp}
        >
            {inputs?.map((input: InputConfig) => (
                <div key={input.id}>
                    <Pin
                        id={input.id}
                        nodeId={nodeId}
                        nodeType={nodeType}
                        name={input.name}
                        type={input.type}
                        required={input.required}
                        isInput={true}
                        onRef={onRef}
                        removable={multiple && inputParams > minInputParams}
                        defaultValue={input.defaultValue}
                        editable={input.editable}
                        isCollection={input.isCollection}
                        typeEditable={input.typeEditable || nodeType === NodeType.RETURN}
                        collectionEditable={input.collectionEditable || nodeType === NodeType.RETURN}
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
