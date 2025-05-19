import { HugeiconsIcon, HugeiconsIconProps } from "@hugeicons/react";
import useHoverable from "@/hooks/useHoverable";

export interface BaseIconProps extends HugeiconsIconProps {
}

export default function BaseIcon({ color, size = 24, strokeWidth = 2, className = "cursor-pointer", ...props }: BaseIconProps) {
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverable();

    return (
        <HugeiconsIcon
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            fill={isHovered ? color : "none"}
            className={className}
            {...props}
        />
    )
}
