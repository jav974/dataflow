import useHoverable from "@/dataflow/hooks/useHoverable";

interface UneditablePinProps {
    name: string;
    removable: boolean;
    onRemove?: () => void;
}

export default function UneditablePin({name, removable, onRemove}: UneditablePinProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();

    return (
        <div onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
            {name} &nbsp;
            {isHovered && removable && <span className={`${isHovered ? '' : 'invisible'} text-red-500 cursor-pointer`} onClick={onRemove}>[x]</span>}
        </div>
    );
}
