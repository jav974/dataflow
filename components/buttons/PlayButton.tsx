import { useCallback, useState } from "react";
import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import BaseIcon from "../icons/BaseIcon";

interface PlayButtonProps {
    onClick: (isPlaying: boolean) => void;
}

export default function PlayButton({onClick}: PlayButtonProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const handleClick = useCallback(() => {
        onClick(!isPlaying);
        setIsPlaying(!isPlaying);
    }, [isPlaying, onClick]);

    return <BaseIcon icon={isPlaying ? PauseIcon : PlayIcon} color="#00FF00" onClick={handleClick} />;
}
