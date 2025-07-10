import { HugeiconsIcon, HugeiconsIconProps } from "@hugeicons/react";
// import useHoverable from "@dataflow-ui/hooks/useHoverable";

export default function BaseIcon({ color, size = 24, strokeWidth = 2, className = "cursor-pointer", ...props }: HugeiconsIconProps) {
    // const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverable();

    return (
        <HugeiconsIcon
            // onMouseEnter={handleMouseEnter}
            // onMouseLeave={handleMouseLeave}
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            //fill={isHovered ? color : "none"}
            className={className}
            {...props}
        />
    )
}
