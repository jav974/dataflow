import useFocusable from "@/dataflow/hooks/useFocusable";
import useHoverable from "@/dataflow/hooks/useHoverable";
import React, { HTMLAttributes, useEffect, useMemo, useState, useRef } from "react";

interface TooltipProps {
    tooltip?: React.ReactNode;
    children: React.ReactNode;
    showOn?: "hover" | "click" | "right-click";
}

export default function Tooltip({ tooltip, children, showOn = "hover" }: TooltipProps) {
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverable();
    const [visible, setVisible] = useState<boolean>(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const {isFocused, handlers: { onPointerDown, onContextMenu }} = useFocusable(tooltipRef);

    const handlers = useMemo((): Partial<HTMLAttributes<HTMLElement>> => {
        switch (showOn) {
            case "hover":
                return { onPointerEnter: handleMouseEnter, onPointerLeave: handleMouseLeave };
            case "click":
                return { onClick: onPointerDown };
            case "right-click":
                return { onContextMenu };
        }
    }, [showOn, handleMouseEnter, handleMouseLeave, onPointerDown, onContextMenu]);

    useEffect(() => {
        setVisible(isHovered || isFocused);
    }, [isHovered, isFocused]);

    return (
        <div className="relative" {...handlers} ref={tooltipRef}>
            {children}
            {tooltip !== undefined && tooltip !== null && visible && (
                <div className="z-10000 absolute top-4 bg-gray-700 text-white text-sm px-2 py-1 rounded-md">
                    {tooltip}
                </div>
            )}
        </div>
    );
}
