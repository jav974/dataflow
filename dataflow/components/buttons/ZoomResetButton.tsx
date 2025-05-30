import BaseIcon from "../icons/BaseIcon";
import { ZoomIcon } from "@hugeicons/core-free-icons";

interface ZoomResetButtonProps {
    onClick: () => void;
}

export default function ZoomResetButton({ onClick }: ZoomResetButtonProps) {
    return <BaseIcon icon={ZoomIcon} color="#4a90e2" onClick={onClick} />
}
