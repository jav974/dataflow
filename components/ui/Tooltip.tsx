import React from "react";

interface TooltipProps {
    tooltip?: React.ReactNode;
    children: React.ReactNode;
}

export default function Tooltip({tooltip, children}: TooltipProps) {
    return (
        <div className="relative group">
            {children}
            {tooltip !== undefined && tooltip !== null &&
                <div className="absolute top-8 opacity-0 bg-gray-700 text-white text-sm px-2 py-1 rounded-md transition-opacity duration-200 group-hover:opacity-100">
                    {tooltip}
                </div>
            }
        </div>
    );
}
