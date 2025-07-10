import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import BaseIcon from "../icons/BaseIcon";

interface PlayButtonProps {
    isPlaying: boolean;
    onClick: () => void;
}

export default function PlayButton({isPlaying, onClick}: PlayButtonProps) {
    return <BaseIcon icon={isPlaying ? PauseIcon : PlayIcon} color="#00FF00" onClick={onClick} />;
}
