import { useCallback, useState } from "react";

interface UseHoverableReturn {
    isHovered: boolean;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
}

export default function useHoverable(): UseHoverableReturn {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);
    
    return { isHovered, handleMouseEnter, handleMouseLeave };
}
