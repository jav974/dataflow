import React, { useCallback, useEffect, useMemo, useState } from "react";

interface UseFocusableReturn {
    readonly isFocused: boolean;
    readonly handlers: {
        readonly onPointerDown: () => void;
        readonly onContextMenu: (event: React.MouseEvent) => void;
    }
}

export default function useFocusable(elementRef: React.RefObject<HTMLElement | null>): UseFocusableReturn {
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const onPointerDown = useCallback(() => {
        setIsFocused(true);
    }, []);

    const onContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault(); // Prevent default context menu
        setIsFocused(true);
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
            setIsFocused(false);
        }
    }, []);

    const handlers = useMemo(() => ({
        onPointerDown,
        onContextMenu
    }), [onPointerDown, onContextMenu]);

    // Set unfocused when clicking elsewhere
    useEffect(() => {
        if (isFocused) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("contextmenu", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("contextmenu", handleClickOutside);
        };
    }, [isFocused]);

    return {
        isFocused,
        handlers
    };
}
