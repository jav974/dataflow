import useHoverable from "@/dataflow/hooks/useHoverable";
import React, { HTMLAttributes, useCallback, useEffect, useMemo, useState, useRef } from "react";

interface TooltipProps {
    tooltip?: React.ReactNode;
    children: React.ReactNode;
    showOn?: "hover" | "click" | "right-click";
}

export default function Tooltip({ tooltip, children, showOn = "hover" }: TooltipProps) {
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverable();
    const [visible, setVisible] = useState<boolean>(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback(() => {
        setVisible(true);
    }, []);

    const handleRightClick = useCallback((event: React.MouseEvent) => {
        event.preventDefault(); // Prevent default context menu
        setVisible(true);
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
            setVisible(false);
        }
    }, []);

    // Close tooltip when clicking elsewhere
    useEffect(() => {
        if (visible) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("contextmenu", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("contextmenu", handleClickOutside);
        };
    }, [visible]);

    const handlers = useMemo((): Partial<HTMLAttributes<HTMLDivElement>> => {
        switch (showOn) {
            case "hover":
                return { onPointerEnter: handleMouseEnter, onPointerLeave: handleMouseLeave };
            case "click":
                return { onClick: handleClick };
            case "right-click":
                return { onContextMenu: handleRightClick };
        }
    }, [showOn, handleMouseEnter, handleMouseLeave]);

    useEffect(() => {
        setVisible(isHovered);
    }, [isHovered]);

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
