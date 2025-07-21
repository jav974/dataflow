import { ParameterTypes, PrimitiveTypes } from "@dataflow-ide/dataflow-core";
import useHoverable from "@dataflow-ui/hooks/useHoverable";
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
        if (type !== ParameterTypes.ANY && type !== ParameterTypes.OBJECT && !PrimitiveTypes.includes(type as ParameterTypes)) {
            return type;
        }

        return undefined;
    }, [type]);

    return (
        <div className={`flex ${!isInput ? 'justify-end' : ''}`} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
            <span className="inline-block whitespace-nowrap">{name}</span>
            {customType && !isCollection &&
                <Tooltip tooltip="Expand">
                    <span className={`${isHovered ? 'visible' : 'hidden'} text-purple-500 cursor-pointer`} onClick={onSplit}>...</span>
                </Tooltip>
            }
            {isHovered && removable && <span className={`${isHovered ? '' : 'invisible'} text-red-500 cursor-pointer`} onClick={onRemove}>[x]</span>}
        </div>
    );
}
