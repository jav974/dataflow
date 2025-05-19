import { useCallback, useState } from "react";

export default function useHoverable() {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);
    
    return { isHovered, handleMouseEnter, handleMouseLeave };
}
