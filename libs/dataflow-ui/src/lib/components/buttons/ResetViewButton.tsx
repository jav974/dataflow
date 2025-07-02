import BaseIcon from "../icons/BaseIcon";
import { BorderVerticalIcon } from "@hugeicons/core-free-icons";

interface ResetViewButtonProps {
    onClick: () => void;
}

export default function ResetViewButton({ onClick }: ResetViewButtonProps) {
    return <BaseIcon icon={BorderVerticalIcon} color="#4a90e2" onClick={onClick} />
}
