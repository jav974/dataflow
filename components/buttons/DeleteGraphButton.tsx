import BaseIcon from "../icons/BaseIcon";
import { Delete02Icon } from "@hugeicons/core-free-icons";

interface DeleteGraphButtonProps {
    onClick: () => void;
}

export default function DeleteGraphButton({ onClick }: DeleteGraphButtonProps) {
    return <BaseIcon icon={Delete02Icon} color="red" onClick={onClick} />
}
