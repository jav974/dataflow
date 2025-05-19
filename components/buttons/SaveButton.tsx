import BaseIcon from "../icons/BaseIcon";
import { FloppyDiskIcon } from "@hugeicons/core-free-icons";

interface SaveButtonProps {
    onClick: () => void;
}

export default function SaveButton({ onClick }: SaveButtonProps) {
    return <BaseIcon icon={FloppyDiskIcon} color="#4a90e2" onClick={onClick} />
}
