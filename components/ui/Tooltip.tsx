import useHoverable from "@/hooks/useHoverable";
import React from "react";

interface TooltipProps {
    tooltip?: React.ReactNode;
    children: React.ReactNode;
}

export default function Tooltip({tooltip, children}: TooltipProps) {
    const {isHovered, handleMouseEnter, handleMouseLeave} = useHoverable();

    return (
        <div className="relative" onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave}>
            {children}
            {tooltip !== undefined && tooltip !== null &&
                <div className={`z-10000 ${isHovered ? 'block' : 'hidden'} absolute top-8 bg-gray-700 text-white text-sm px-2 py-1 rounded-md`}>
                    {tooltip}
                </div>
            }
        </div>
    );
}
