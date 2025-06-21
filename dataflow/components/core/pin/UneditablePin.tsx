import { ParameterTypes, PrimitiveTypes } from "@/dataflow/config/schema";
import useHoverable from "@/dataflow/hooks/useHoverable";
import { useMemo } from "react";
import Tooltip from "../../ui/Tooltip";

interface UneditablePinProps {
    name: string;
    type: string;
    isCollection?: boolean;
    removable: boolean;
    isInput: boolean;
    onRemove?: () => void;
    onSplit?: () => void;
}

export default function UneditablePin({name, type, isCollection, isInput, removable, onRemove, onSplit}: UneditablePinProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();

    const customType = useMemo(() => {
        if (type !== ParameterTypes.ANY && !PrimitiveTypes.includes(type as ParameterTypes)) {
            return type;
        }

        return undefined;
    }, [type]);

    return (
        <div className={`flex ${!isInput ? 'justify-end' : ''}`} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
            {name}
            {customType && !isCollection &&
                <Tooltip tooltip="Expand">
                    <span className={`${isHovered ? 'visible' : 'hidden'} text-purple-500 cursor-pointer`} onClick={onSplit}>...</span>
                </Tooltip>
            }
            {isHovered && removable && <span className={`${isHovered ? '' : 'invisible'} text-red-500 cursor-pointer`} onClick={onRemove}>[x]</span>}
        </div>
    );
}
